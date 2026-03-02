import express from 'express';
import { getAllSellers, getSellerById, updateSeller, deleteSeller, createSellerProfile } from '../controllers/sellerController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/profile', createSellerProfile);

router.get('/', authenticateToken, authorizeRole('customer', 'seller'), getAllSellers);
router.get('/:sellerId', authenticateToken, getSellerById);
router.put('/:sellerId', authenticateToken, updateSeller);
router.delete('/:sellerId', authenticateToken, deleteSeller);

export default router;