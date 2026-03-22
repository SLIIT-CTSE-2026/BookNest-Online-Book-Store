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

export const feedbackAPI = {
  create: (payload) => api.post('/feedback', payload),
  listMine: (params = {}) => api.get('/feedback', { params }),
  listForSeller: (params = {}) => api.get('/feedback/seller', { params }),
  getByOrder: (orderId) => api.get(`/feedback/order/${orderId}`),
  update: (feedbackId, payload) => api.put(`/feedback/${feedbackId}`, payload),
  remove: (feedbackId) => api.delete(`/feedback/${feedbackId}`),
};



export const productAPI = {
  createProduct: (productData) => api.post('/products', productData),
  getAllProducts: () => api.get('/products'),
  getCategories: () => api.get('/products/categories'),
  getProductsBySeller: (sellerId) =>
    api.get(`/products/seller/${sellerId}`),
  getProductById: (productId) =>
    api.get(`/products/${productId}`),
  updateProduct: (productId, updateData) =>
    api.put(`/products/${productId}`, updateData),
  deleteProduct: (productId) =>
    api.delete(`/products/${productId}`),
};

export default api;
