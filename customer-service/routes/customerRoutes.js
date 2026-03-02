import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, createCustomerProfile } from '../controllers/customerController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Internal endpoint for auth service to create customer profiles
router.post('/profile', createCustomerProfile);

// All routes are now protected - authentication is handled by auth-service
router.get('/', authenticateToken, authorizeRole('customer', 'seller'), getAllCustomers);
router.get('/:customerId', authenticateToken, getCustomerById);
router.put('/:customerId', authenticateToken, updateCustomer);
router.delete('/:customerId', authenticateToken, deleteCustomer);

export default router;