import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, createCustomerProfile, getCustomerSummary } from '../controllers/customerController.js';
const router = express.Router();

router.post('/', createCustomerProfile);
router.get('/', getAllCustomers);
router.get('/:customerId', getCustomerById);
router.put('/:customerId', updateCustomer);
router.delete('/:customerId', deleteCustomer);
router.get('/:customerId/summary', getCustomerSummary);

export default router;