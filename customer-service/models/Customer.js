import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'CUST' + Date.now() + Math.floor(Math.random() * 1000);
    }
  },
  customerName: {
    type: String,
    required: [true, 'Name is required']
  },
  customerEmail: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  customerPassword: {
    type: String,
    required: [true, 'Password is required'],
  },
  createDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
customerSchema.pre('save', async function(next) {
  if (!this.isModified('customerPassword')) return next();
  
  try {
    const saltRounds = 12;
    this.customerPassword = await bcrypt.hash(this.customerPassword, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.customerPassword);
};

customerSchema.index({ customerEmail: 1 });
customerSchema.index({ customerId: 1 });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;