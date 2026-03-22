import express from 'express';
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  getOrderById,
  deleteOrder,
  getOrdersByCustomerId,
  getCustomerOrderById,
  getOrdersByProductId,
  getCustomerDetails,
  getProductDetails
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/orders
 * @desc    Get orders (role-based scope)
 * @access  Private
 */
router.get('/', getOrders);

/**
 * @route   GET /api/orders/customer/:customerId
 * @desc    Get orders by customer ID
 * @access  Private
 */
router.get('/customer/:customerId', getOrdersByCustomerId);

/**
 * @route   GET /api/orders/customer/:customerId/order/:orderId
 * @desc    Get single customer order by order ID
 * @access  Private
 */
router.get('/customer/:customerId/order/:orderId', getCustomerOrderById);

/**
 * @route   GET /api/orders/product/:productId
 * @desc    Get orders by product ID
 * @access  Private
 */
router.get('/product/:productId', getOrdersByProductId);

/**
 * @route   GET /api/orders/customer-details/:customerId
 * @desc    Get customer details from customer service (Integration endpoint)
 * @access  Private
 */
router.get('/customer-details/:customerId', getCustomerDetails);

/**
 * @route   GET /api/orders/product-details/:productId
 * @desc    Get product details from seller service (Integration endpoint)
 * @access  Private
 */
router.get('/product-details/:productId', getProductDetails);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', createOrder);

/**
 * @route   PATCH /api/orders/:orderId
 * @desc    Update order status
 * @access  Private
 */
router.patch('/:orderId', updateOrderStatus);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get a single order by ID
 * @access  Private
 */
router.get('/:orderId', getOrderById);

/**
 * @route   DELETE /api/orders/:orderId
 * @desc    Delete an order
 * @access  Private
 */
router.delete('/:orderId', deleteOrder);

export default router;
