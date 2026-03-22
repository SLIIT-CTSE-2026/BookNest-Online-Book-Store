import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
    trim: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: function() {
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return 'ORD-' + timestamp + '-' + randomCode;
    }
  },
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    trim: true,
    index: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative'],
    default: null
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled'
    },
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card', 'cash', 'online'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
orderSchema.index({ customerId: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });

// Virtual for calculating total amount from items
orderSchema.virtual('calculatedTotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Pre-save hook to auto-update totalAmount
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  next();
});

// Static method to get orders by customer
orderSchema.statics.findByCustomerId = async function(customerId) {
  return await this.find({ customerId }).sort({ orderDate: -1 });
};

// Static method to get orders by product
orderSchema.statics.findByProductId = async function(productId) {
  return await this.find({ 'items.productId': productId }).sort({ orderDate: -1 });
};

// Instance method to update status
orderSchema.methods.updateStatus = async function(newStatus, notes = '') {
  if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
    throw new Error('Invalid status');
  }
  
  this.status = newStatus;
  
  if (newStatus === 'delivered') {
    this.deliveryDate = new Date();
  }
  
  if (notes) {
    this.notes = notes;
  }
  
  await this.save();
  return this;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
