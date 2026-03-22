import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', customerRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Customer Service - Database Connected");

    app.listen(process.env.PORT, () => {
      console.log(`Customer Service running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Customer Service - Initialization error:", error.message);
    process.exit(1);
  }
};

start();