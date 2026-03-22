const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product routes
router.post('/', productController.createProduct);
router.post('/ratings/sync', productController.syncProductRatings);
router.get('/feedback/health', productController.getFeedbackServiceHealth);
router.get('/seller/health', productController.getSellerServiceHealth);
router.get('/:id/seller', productController.getProductSellerProfile);
router.get('/:id/feedback', productController.getProductFeedback);
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/seller/:sellerId', productController.getProductsBySeller);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
