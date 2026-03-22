const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationYear: {
    type: Number
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number,
    min: 1
  },
  coverImage: {
    type: String
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  sellerId: {
    type: String,
    required: true
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
