import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const readUserIdFromToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret);
    return decoded?.userId || null;
  } catch {
    // For mock usage, fallback to unsafe decode when signature check fails.
    const decoded = jwt.decode(token);
    return decoded?.userId || null;
  }
};

const buildMockOrder = (orderId, customerId) => ({
  orderId,
  customerId: customerId || 'unknown-customer',
  sellerId: process.env.DEFAULT_SELLER_ID || 'mock-seller-1001',
  status: 'delivered',
  totalAmount: 2499,
  currency: 'LKR',
  items: [
    {
      bookId: 'book-001',
      title: 'Atomic Habits',
      quantity: 1,
      price: 2499
    }
  ],
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mock Order Service is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }

  const customerId = readUserIdFromToken(req.headers.authorization);
  const order = buildMockOrder(orderId, customerId);

  return res.status(200).json({
    success: true,
    message: 'Mock order retrieved',
    data: { order }
  });
});

const port = process.env.PORT || 5005;
app.listen(port, () => {
  console.log(`Mock Order Service running on port ${port}`);
});
