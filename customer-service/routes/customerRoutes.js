import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, createCustomerProfile } from '../controllers/customerController.js';
const router = express.Router();

router.get('/', getAllCustomers);
router.get('/:customerId', getCustomerById);
router.put('/:customerId', updateCustomer);
router.delete('/:customerId', deleteCustomer);
router.post('/profile', createCustomerProfile);

export default router;