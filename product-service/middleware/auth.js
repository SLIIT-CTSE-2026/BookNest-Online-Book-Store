const axios = require('axios');

/**
 * Authentication middleware - verifies JWT token with auth service
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token with auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    const response = await axios.post(`${authServiceUrl}/verify-token`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.success) {
      // Attach user info to request
      req.user = response.data.data.user;
      req.userRole = response.data.data.user.role;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.response) {
      console.error('Auth service response:', error.response.status, error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Authentication failed'
      });
    }

    console.error('Auth service unavailable. Check AUTH_SERVICE_URL:', process.env.AUTH_SERVICE_URL);
    res.status(500).json({
      success: false,
      message: 'Authentication service unavailable'
    });
  }
};

/**
 * Role-based authorization middleware
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Verify seller ID matches the authenticated user
 * This ensures sellers can only create/update/delete their own products
 */
const verifySeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Allow admin to perform any action
  if (req.user.role === 'admin') {
    return next();
  }

  // For sellers, verify they can only modify their own products
  if (req.user.role === 'seller') {
    const requestedSellerId = req.body.sellerId || req.params.sellerId;
    
    // If creating a product, ensure sellerId matches the authenticated user
    if (req.method === 'POST' && req.body.sellerId) {
      if (req.body.sellerId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only create products for your own account.'
        });
      }
    }
    
    // For other operations, we'll check in the controller if needed
    req.sellerId = req.user.userId;
    return next();
  }

  // Customers and other roles cannot create/modify products
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only sellers and admins can manage products.'
  });
};

module.exports = {
  authenticateToken,
  authorizeRole,
  verifySeller
};
