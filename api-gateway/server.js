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
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[${new Date().toISOString()}] Proxying ${req.method} ${req.url} to AUTH SERVICE`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[${new Date().toISOString()}] Received response from AUTH SERVICE with status ${proxyRes.statusCode}`);
  }
}));

app.use('/api/customers', 
  authenticateToken, 
  createProxyMiddleware({
    target: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:5002',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[${new Date().toISOString()}] Proxying ${req.method} ${req.url} to CUSTOMER SERVICE`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[${new Date().toISOString()}] Received response from CUSTOMER SERVICE with status ${proxyRes.statusCode}`);
    }
  })
);

app.use('/api/sellers', 
  authenticateToken,
  authorizeRole('seller'),
  createProxyMiddleware({
    target: process.env.SELLER_SERVICE_URL || 'http://localhost:5003',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[${new Date().toISOString()}] Proxying ${req.method} ${req.url} to SELLER SERVICE`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[${new Date().toISOString()}] Received response from SELLER SERVICE with status ${proxyRes.statusCode}`);
    }
  })
);

app.use('/api/feedback',
  authenticateToken,
  createProxyMiddleware({
    target: process.env.FEEDBACK_SERVICE_URL || 'http://localhost:5007',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[${new Date().toISOString()}] Proxying ${req.method} ${req.url} to FEEDBACK SERVICE`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[${new Date().toISOString()}] Received response from FEEDBACK SERVICE with status ${proxyRes.statusCode}`);
    }
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});