const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AccountSecurity, SessionSecurity } = require('../utils/security');

/**
 * Enhanced JWT Authentication Middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format.',
          code: 'INVALID_TOKEN'
        });
      } else {
        throw error;
      }
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token valid but user not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Check if account is locked
    if (AccountSecurity.isAccountLocked(user)) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to security concerns.',
        code: 'ACCOUNT_LOCKED',
        lockedUntil: user.loginAttempts.lockedUntil
      });
    }

    // Verify session if sessionId is provided in token
    if (decoded.sessionId) {
      const session = user.sessions?.find(s => s.sessionId === decoded.sessionId);
      if (!session || !session.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Session expired or invalid.',
          code: 'SESSION_INVALID'
        });
      }

      // Check if session is expired
      if (SessionSecurity.isSessionExpired(session)) {
        // Mark session as inactive
        session.isActive = false;
        await user.save();
        
        return res.status(401).json({
          success: false,
          message: 'Session expired due to inactivity.',
          code: 'SESSION_EXPIRED'
        });
      }

      // Update last activity
      session.lastActivity = new Date();
      await user.save();
    }

    // Add user and session info to request
    req.user = user;
    req.sessionId = decoded.sessionId;
    req.tokenExp = decoded.exp;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service error.',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * MFA Verification Middleware
 */
const requireMFA = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if MFA is enabled for user
    if (!user.mfa?.isEnabled) {
      return next(); // MFA not required, continue
    }

    // Check if MFA was verified in this session
    const mfaVerified = req.headers['x-mfa-verified'];
    const sessionId = req.sessionId;

    if (!mfaVerified || mfaVerified !== sessionId) {
      return res.status(403).json({
        success: false,
        message: 'MFA verification required.',
        code: 'MFA_REQUIRED',
        mfaEnabled: true
      });
    }

    next();
  } catch (error) {
    console.error('MFA middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'MFA verification service error.',
      code: 'MFA_SERVICE_ERROR'
    });
  }
};

/**
 * Role-based Authorization Middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
        code: 'INSUFFICIENT_ROLE',
        requiredRoles: roles,
        userRole: req.user.userType
      });
    }

    next();
  };
};

/**
 * Account Verification Middleware
 */
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.emailVerification?.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required.',
      code: 'EMAIL_VERIFICATION_REQUIRED',
      verified: false
    });
  }

  next();
};

/**
 * Rate Limiting Middleware for sensitive operations
 */
const sensitiveOperationLimit = (maxAttempts = 3, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.ip}_${req.user?.id || 'anonymous'}_${req.route?.path}`;
    const now = Date.now();

    if (!attempts.has(key)) {
      attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);
    const recentAttempts = userAttempts.filter(timestamp => (now - timestamp) < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      const resetTime = new Date(recentAttempts[0] + windowMs);
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        resetTime: resetTime,
        remainingAttempts: 0
      });
    }

    recentAttempts.push(now);
    attempts.set(key, recentAttempts);

    req.remainingAttempts = maxAttempts - recentAttempts.length;
    next();
  };
};

/**
 * Device Tracking Middleware
 */
const trackDevice = async (req, res, next) => {
  try {
    if (req.user) {
      const deviceInfo = SessionSecurity.extractDeviceInfo(req);
      req.deviceInfo = deviceInfo;
    }
    next();
  } catch (error) {
    console.error('Device tracking error:', error);
    next(); // Don't block request if device tracking fails
  }
};

/**
 * Security Headers Middleware
 */
const securityHeaders = (req, res, next) => {
  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  next();
};

/**
 * Request Validation Middleware
 */
const validateRequest = (req, res, next) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /script\s*:/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:/i,
    /(<|%3C).*?(>|%3E)/i, // HTML tags
    /(union|select|insert|delete|update|drop|create|alter)\s+/i // SQL keywords
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  // Check request body for suspicious content
  if (req.body && checkValue(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Request contains potentially malicious content.',
      code: 'MALICIOUS_INPUT'
    });
  }

  // Check query parameters
  if (req.query && checkValue(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Query parameters contain potentially malicious content.',
      code: 'MALICIOUS_QUERY'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireMFA,
  requireRole,
  requireVerification,
  sensitiveOperationLimit,
  trackDevice,
  securityHeaders,
  validateRequest
};
