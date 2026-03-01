import express from 'express';

import { 
  createCustomer, 
  getAllCustomers, 
  getCustomerById, 
  updateCustomer, 
  deleteCustomer, 
  loginCustomer, 
  registerCustomer 
} from '../controllers/customerController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected routes
router.post('/', createCustomer);
router.get('/', authenticateToken, authorizeRole('customer', 'seller'), getAllCustomers);
router.get('/:customerId', authenticateToken, getCustomerById);
router.put('/:customerId', authenticateToken, updateCustomer);
router.delete('/:customerId', authenticateToken, deleteCustomer);

export default router;