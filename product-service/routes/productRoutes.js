const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product routes
router.post('/', productController.createProduct);
router.post('/ratings/sync', productController.syncProductRatings);
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/seller/:sellerId', productController.getProductsBySeller);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
