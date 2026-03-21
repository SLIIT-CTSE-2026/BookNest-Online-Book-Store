import axios from 'axios';

export const fetchCustomerById = async (customerId) => {
  try {
    const customerServiceUrl = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:5002';
    const response = await axios.get(`${customerServiceUrl}/api/customers`, {
      params: { search: customerId },
      timeout: 5000
    });

    const customers = response.data?.data?.customers || [];
    return customers.find((customer) => customer.userId === customerId);
  } catch (error) {
    const err = new Error('Unable to reach customer service');
    err.status = error.response?.status || 502;
    throw err;
  }
};
