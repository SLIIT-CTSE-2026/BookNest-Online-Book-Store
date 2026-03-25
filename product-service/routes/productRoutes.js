const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole, verifySeller } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/by-product-id/:productId', productController.getProductByProductId);
router.get('/seller/:sellerId', productController.getProductsBySeller);
router.get('/:id', productController.getProductById);
router.get('/:id/seller', productController.getProductSellerProfile);
router.get('/:id/feedback', productController.getProductFeedback);

// Service-to-service routes (internal use)
router.post('/ratings/sync', productController.syncProductRatings);
router.get('/feedback/health', productController.getFeedbackServiceHealth);
router.get('/seller/health', productController.getSellerServiceHealth);

// Protected routes (authentication required)
router.use(authenticateToken);

// Seller-only routes (create, update, delete products)
router.post('/', verifySeller, productController.createProduct);
router.put('/:id', verifySeller, productController.updateProduct);
router.delete('/:id', verifySeller, productController.deleteProduct);

module.exports = router;
