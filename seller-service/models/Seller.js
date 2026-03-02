import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
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
  createDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const seller = mongoose.model('Seller', sellerSchema);
export default seller;