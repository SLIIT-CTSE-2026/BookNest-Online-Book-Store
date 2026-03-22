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
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
}));

app.use('/api/customers', 
  authenticateToken, 
  createProxyMiddleware({
    target: process.env.CUSTOMER_SERVICE_URL,
    changeOrigin: true,    
  })
);

app.use('/api/sellers', 
  authenticateToken,
  authorizeRole('seller'),
  createProxyMiddleware({
    target: process.env.SELLER_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/api/products',
  authenticateToken,
  authorizeRole('seller', 'customer'),
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,    
  })
);

app.use('/api/feedback',
  authenticateToken,
  createProxyMiddleware({
    target: `${process.env.FEEDBACK_SERVICE_URL}/api/feedback`,
    changeOrigin: true,
  })
);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});