import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: [true, 'orderId is required'],
    trim: true,
    index: true
  },
  customerId: {
    type: String,
    required: [true, 'customerId is required'],
    trim: true,
    index: true
  },
  productId: {
    type: String,
    trim: true,
    index: true
  },
  productName: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  sellerId: {
    type: String,
    trim: true
  },
  orderSnapshot: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

feedbackSchema.index({ sellerId: 1, createdAt: -1 });
feedbackSchema.index({ productId: 1, createdAt: -1 });
feedbackSchema.index(
  { orderId: 1, customerId: 1, productId: 1 },
  {
    unique: true,
    partialFilterExpression: { productId: { $exists: true, $type: 'string' } }
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
