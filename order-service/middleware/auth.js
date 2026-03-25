import axios from 'axios';

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
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Authentication failed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication service unavailable'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRole = (...roles) => {
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

export default authenticateToken;
