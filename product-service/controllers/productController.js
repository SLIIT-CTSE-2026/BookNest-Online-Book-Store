const Product = require('../models/Product');
const {
  getRelevantFeedbackForProduct,
  getFeedbackHealth
} = require('../services/feedbackService');
const {
  getSellerHealth,
  getSellerByUserId
} = require('../services/sellerService');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    let query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by text
    if (search) {
      query.$text = { $search: search };
    }

    let productsQuery = Product.find(query);

    // Sorting
    if (sort) {
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      const sortField = sort.replace('-', '');
      productsQuery = productsQuery.sort({ [sortField]: sortOrder });
    }

    const products = await productsQuery.exec();

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by seller
exports.getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId });
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Sync product rating summary from feedback service
exports.syncProductRatings = async (req, res) => {
  try {
    const { productId, averageRating, ratingsCount } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required'
      });
    }

    const normalizedAverage = Number(averageRating || 0);
    const normalizedCount = Number(ratingsCount || 0);

    if (Number.isNaN(normalizedAverage) || Number.isNaN(normalizedCount)) {
      return res.status(400).json({
        success: false,
        message: 'averageRating and ratingsCount must be numeric values'
      });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        'ratings.average': Math.max(0, Math.min(5, normalizedAverage)),
        'ratings.count': Math.max(0, normalizedCount)
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product ratings synced successfully',
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get relevant feedback for a product by forwarding caller token to feedback-service.
exports.getProductFeedback = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const feedbackResponse = await getRelevantFeedbackForProduct(productId, req.headers.authorization || '');

    return res.status(200).json({
      success: true,
      message: 'Relevant feedback retrieved successfully',
      source: feedbackResponse.source,
      productId,
      data: feedbackResponse.data || {}
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch product feedback from feedback-service'
    });
  }
};

// Check feedback-service connectivity from product-service.
exports.getFeedbackServiceHealth = async (_req, res) => {
  try {
    const health = await getFeedbackHealth();
    return res.status(200).json({
      success: true,
      message: 'Feedback service health fetched successfully',
      data: health
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch feedback service health'
    });
  }
};

// Check seller-service connectivity from product-service.
exports.getSellerServiceHealth = async (_req, res) => {
  try {
    const health = await getSellerHealth();
    return res.status(200).json({
      success: true,
      message: 'Seller service health fetched successfully',
      data: health
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch seller service health'
    });
  }
};

// Get seller profile for a product by reading sellerId from product.
exports.getProductSellerProfile = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Product does not have sellerId'
      });
    }

    const seller = await getSellerByUserId(product.sellerId);

    return res.status(200).json({
      success: true,
      message: 'Seller profile retrieved successfully',
      productId,
      sellerId: product.sellerId,
      data: { seller }
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch seller profile from seller-service'
    });
  }
};
