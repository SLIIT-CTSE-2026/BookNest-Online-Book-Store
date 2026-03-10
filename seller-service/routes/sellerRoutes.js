import express from 'express';
import { getAllSellers, getSellerById, updateSeller, deleteSeller, createSellerProfile } from '../controllers/sellerController.js';
const router = express.Router();

router.post('/profile', createSellerProfile);

router.get('/', getAllSellers);
router.get('/:sellerId', getSellerById);
router.put('/:sellerId', updateSeller);
router.delete('/:sellerId', deleteSeller);

export default router;