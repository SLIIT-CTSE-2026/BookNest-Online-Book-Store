import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticateToken, authorizeRole } from './middleware/auth.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());

app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  changeOrigin: true,
}));

app.use('/api/customers', 
  authenticateToken,
  authorizeRole('customer'),
  createProxyMiddleware({
    target: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:5002',
    changeOrigin: true,
  })
);

app.use('/api/sellers', 
  authenticateToken,
  authorizeRole('seller'),
  createProxyMiddleware({
    target: process.env.SELLER_SERVICE_URL || 'http://localhost:5003',
    changeOrigin: true,
  })
);

app.use('/api/orders',
  authenticateToken,
  authorizeRole('customer', 'seller', 'admin'),
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:5005',
    changeOrigin: true,
    pathRewrite: (path) => `/api/orders${path}`,
  })
);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});