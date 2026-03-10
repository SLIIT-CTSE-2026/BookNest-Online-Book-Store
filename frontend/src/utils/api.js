import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

export default api;
