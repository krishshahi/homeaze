const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Add user info to request
      req.userId = decoded.userId;
      req.user = user;
      
      next();
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      } else {
        throw tokenError;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check if user is a provider
const requireProvider = (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Provider account required.'
    });
  }
  next();
};

// Middleware to check if user is a customer
const requireCustomer = (req, res, next) => {
  if (req.user.userType !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer account required.'
    });
  }
  next();
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Account verification required.'
    });
  }
  next();
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.userId = decoded.userId;
        req.user = user;
      }
    } catch (tokenError) {
      // Ignore token errors in optional auth
      console.log('Optional auth token error:', tokenError.message);
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = {
  auth,
  requireProvider,
  requireCustomer,
  requireVerified,
  optionalAuth
};
