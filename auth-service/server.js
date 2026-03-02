import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Auth Service - Database Connected");

    app.listen(process.env.PORT || 5001, () => {
      console.log(`Auth Service running on port ${process.env.PORT || 5001}`);
    });
  } catch (error) {
    console.error("Auth Service - Initialization error:", error.message);
    process.exit(1);
  }
};

start();
