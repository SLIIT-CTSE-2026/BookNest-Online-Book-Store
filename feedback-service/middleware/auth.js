import axios from 'axios';

// Authenticate via auth-service and attach user to request
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${authServiceUrl}/verify-token`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });

    const user = response.data?.data?.user || response.data?.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: user not found.'
      });
    }

    req.user = {
      userId: user.userId,
      role: user.role,
      email: user.email,
      name: user.name
    };
    req.token = token;
    next();
  } catch (error) {
    const status = error.response?.status || 401;
    const message = error.response?.data?.message || 'Authentication failed';
    return res.status(status).json({ success: false, message });
  }
};

export const requireCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Only customers can perform this action.'
    });
  }
  next();
};
