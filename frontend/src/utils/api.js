import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (userData) {
    const parsedUser = JSON.parse(userData);
    config.headers['x-user-role'] = parsedUser.role;
  }
  
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.post('/auth/verify-token'),
};

export const customerAPI = {
  getCustomerById: (customerId) => api.get(`/customers/${customerId}`),
  getAllCustomers: (search) => api.get(`/customers${search ? `?search=${search}` : ''}`),
  updateCustomer: (customerId, updateData) => api.put(`/customers/${customerId}`, updateData),
  deleteCustomer: (customerId) => api.delete(`/customers/${customerId}`),
};

export const sellerAPI = {
  getSellerById: (sellerId) => api.get(`/sellers/${sellerId}`),
  getAllSellers: (search) => api.get(`/sellers${search ? `?search=${search}` : ''}`),
  updateSeller: (sellerId, updateData) => api.put(`/sellers/${sellerId}`, updateData),
  deleteSeller: (sellerId) => api.delete(`/sellers/${sellerId}`),
};

export default api;