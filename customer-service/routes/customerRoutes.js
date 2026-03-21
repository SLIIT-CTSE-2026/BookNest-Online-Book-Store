import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, createCustomerProfile } from '../controllers/customerController.js';
const router = express.Router();

router.post('/customers', createCustomerProfile);
router.post('/profile', createCustomerProfile);

router.get('/', getAllCustomers);
router.get('/:customerId', getCustomerById);
router.put('/:customerId', updateCustomer);
router.delete('/:customerId', deleteCustomer);

export default router;