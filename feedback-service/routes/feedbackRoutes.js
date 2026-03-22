import express from 'express';
import { authenticate, requireCustomer, requireSeller } from '../middleware/auth.js';
import {
  createFeedback,
  getMyFeedbacks,
  getFeedbackForOrder,
  getSellerFeedbacks,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', requireCustomer, createFeedback);
router.get('/', requireCustomer, getMyFeedbacks);
router.get('/order/:orderId', requireCustomer, getFeedbackForOrder);
router.get('/seller', requireSeller, getSellerFeedbacks);
router.put('/:feedbackId', requireCustomer, updateFeedback);
router.delete('/:feedbackId', requireCustomer, deleteFeedback);

export default router;
