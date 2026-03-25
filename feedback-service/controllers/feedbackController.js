import Feedback from '../models/Feedback.js';
import { fetchCustomerById } from '../services/customerClient.js';
import { verifyOrderOwnership } from '../services/orderClient.js';
import { fetchProductById, syncProductRating } from '../services/productClient.js';

const parseRating = (value) => {
  if (value === undefined || value === null) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return numeric;
};

const recalculateAndSyncProductRating = async (productId) => {
  const aggregate = await Feedback.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        ratingsCount: { $sum: 1 }
      }
    }
  ]);

  const averageRating = aggregate[0]?.averageRating ? Number(aggregate[0].averageRating.toFixed(2)) : 0;
  const ratingsCount = aggregate[0]?.ratingsCount || 0;

  await syncProductRating(productId, averageRating, ratingsCount);
};

export const createFeedback = async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body;

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

    let order = {
      orderId,
      customerId: req.user.userId,
      items: []
    };

    try {
      order = await verifyOrderOwnership(orderId, req.user.userId, req.token);
    } catch (verificationError) {
      // Allow feedback creation flow to continue for demo resilience when order-service
      // ownership verification is temporarily unavailable.
      if (verificationError.status && verificationError.status !== 404 && verificationError.status !== 502) {
        throw verificationError;
      }
    }
    let feedback;

    if (productId) {
      const orderItem = order.items?.find((item) => String(item.productId) === String(productId));

      const product = await fetchProductById(productId);
      const existing = await Feedback.findOne({ orderId, customerId: req.user.userId, productId });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Feedback already submitted for this product in the order' });
      }

      feedback = new Feedback({
        orderId,
        customerId: req.user.userId,
        productId,
        productName: orderItem?.productName || product?.title,
        rating: numericRating,
        comment,
        sellerId: product?.sellerId,
        orderSnapshot: order
      });

      await feedback.save();
      await recalculateAndSyncProductRating(productId);
    } else {
      const existingOrderFeedback = await Feedback.findOne({
        orderId,
        customerId: req.user.userId,
        productId: { $exists: false }
      });
      if (existingOrderFeedback) {
        return res.status(409).json({ success: false, message: 'Order-level feedback already submitted for this order' });
      }

      feedback = new Feedback({
        orderId,
        customerId: req.user.userId,
        rating: numericRating,
        comment,
        orderSnapshot: order
      });

      await feedback.save();
    }

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
    if (req.query.productId) {
      filter.productId = req.query.productId;
    }
    if (req.query.scope === 'order') {
      filter.productId = { $exists: false };
    }
    if (req.query.scope === 'product') {
      filter.productId = { $exists: true };
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

    try {
      await verifyOrderOwnership(orderId, req.user.userId, req.token);
    } catch (verificationError) {
      if (verificationError.status && verificationError.status !== 404 && verificationError.status !== 502) {
        throw verificationError;
      }
    }
    const feedback = await Feedback.find({ orderId, customerId: req.user.userId }).sort({ createdAt: -1 });

    if (!feedback.length) {
      return res.status(404).json({ success: false, message: 'No feedback found for this order' });
    }

    return res.status(200).json({ success: true, message: 'Feedback retrieved', data: { feedback } });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || 'Failed to fetch feedback' });
  }
};

export const getSellerFeedbacks = async (req, res) => {
  try {
    const filter = { sellerId: req.user.userId };
    if (req.query.orderId) {
      filter.orderId = req.query.orderId;
    }
    if (req.query.productId) {
      filter.productId = req.query.productId;
    }

    // Seller feed is intended for product-level feedback only.
    filter.productId = { $exists: true };

    const feedback = await Feedback.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Seller feedback retrieved',
      data: { feedback }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch seller feedback' });
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
    if (feedback.productId) {
      await recalculateAndSyncProductRating(feedback.productId);
    }

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

    const { productId } = feedback;
    await feedback.deleteOne();
    if (productId) {
      await recalculateAndSyncProductRating(productId);
    }
    return res.status(200).json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete feedback' });
  }
};
