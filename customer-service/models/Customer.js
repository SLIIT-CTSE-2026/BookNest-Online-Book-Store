import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  role: {
    type: String,
    default: 'customer',
    enum: ['customer']
  },
  // Additional customer-specific fields
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  preferences: {
    favoriteGenres: [{
      type: String
    }],
    notificationSettings: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  orderHistory: [{
    orderId: String,
    orderDate: Date,
    totalAmount: Number
  }],
  createDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;