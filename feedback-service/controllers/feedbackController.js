import Feedback from '../models/Feedback.js';
import { fetchCustomerById } from '../services/customerClient.js';
import { verifyOrderOwnership } from '../services/orderClient.js';

const parseRating = (value) => {
  if (value === undefined || value === null) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return numeric;
};

export const createFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const numericRating = parseRating(rating);
    if (numericRating === null || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
    }

    const customer = await fetchCustomerById(req.user.userId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found' });
    }

    const order = await verifyOrderOwnership(orderId, req.user.userId, req.token);

    const existing = await Feedback.findOne({ orderId, customerId: req.user.userId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Feedback already submitted for this order' });
    }

    const feedback = new Feedback({
      orderId,
      customerId: req.user.userId,
      rating: numericRating,
      comment,
      sellerId: order.sellerId,
      orderSnapshot: order
    });

    await feedback.save();

    return res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: { feedback }
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to create feedback'
    });
  }
};

export const getMyFeedbacks = async (req, res) => {
  try {
    const filter = { customerId: req.user.userId };
    if (req.query.orderId) {
      filter.orderId = req.query.orderId;
    }

    const feedback = await Feedback.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Feedback retrieved',
      data: { feedback }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
};

export const getFeedbackForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    await verifyOrderOwnership(orderId, req.user.userId, req.token);
    const feedback = await Feedback.findOne({ orderId, customerId: req.user.userId });

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'No feedback found for this order' });
    }

    return res.status(200).json({ success: true, message: 'Feedback retrieved', data: { feedback } });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Failed to fetch feedback' });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { rating, comment } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (feedback.customerId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only update your own feedback' });
    }

    if (rating !== undefined) {
      const numericRating = parseRating(rating);
      if (numericRating === null || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
      }
      feedback.rating = numericRating;
    }

    if (comment !== undefined) {
      feedback.comment = comment;
    }

    await feedback.save();

    return res.status(200).json({ success: true, message: 'Feedback updated', data: { feedback } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update feedback' });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (feedback.customerId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own feedback' });
    }

    await feedback.deleteOne();
    return res.status(200).json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete feedback' });
  }
};
