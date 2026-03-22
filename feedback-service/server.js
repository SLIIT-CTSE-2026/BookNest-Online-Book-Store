import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import feedbackRoutes from './routes/feedbackRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/feedback', feedbackRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feedback service is running',
    timestamp: new Date().toISOString()
  });
});

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Missing MONGO_URI');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Feedback Service - Database Connected');

    const port = process.env.PORT || 5004;
    app.listen(port, () => {
      console.log(`Feedback Service running on port ${port}`);
    });
  } catch (error) {
    console.error('Feedback Service - Initialization error:', error.message);
    process.exit(1);
  }
};

start();
