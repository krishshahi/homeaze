const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { 
  PasswordSecurity, 
  MFAUtils, 
  AccountSecurity, 
  TokenUtils,
  SessionSecurity
} = require('../utils/security');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '90d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, userType, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      userType: userType || 'customer',
      address
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    const userResponse = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const deviceInfo = SessionSecurity.extractDeviceInfo(req);

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (AccountSecurity.isAccountLocked(user)) {
      const lockDurationMinutes = Math.ceil(
        (user.loginAttempts.lockedUntil - new Date()) / (1000 * 60)
      );
      
      // Send SMS alert about account lockout
      if (user.phoneVerification?.isVerified) {
        await smsService.sendAccountLockedAlert(user.phone, lockDurationMinutes);
      }
      
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${lockDurationMinutes} minutes.`,
        code: 'ACCOUNT_LOCKED',
        lockedUntil: user.loginAttempts.lockedUntil
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Handle failed login attempt
      const lockoutInfo = await AccountSecurity.handleFailedLogin(user);
      
      const response = {
        success: false,
        message: 'Invalid credentials',
        attemptsRemaining: lockoutInfo.attemptsRemaining
      };
      
      if (lockoutInfo.isLocked) {
        response.message = 'Too many failed attempts. Account temporarily locked.';
        response.code = 'ACCOUNT_LOCKED';
        response.lockedUntil = lockoutInfo.lockedUntil;
        
        // Send SMS alert about account lockout
        if (user.phoneVerification?.isVerified) {
          const lockDurationMinutes = Math.ceil(
            (lockoutInfo.lockedUntil - new Date()) / (1000 * 60)
          );
          await smsService.sendAccountLockedAlert(user.phone, lockDurationMinutes);
        }
        
        return res.status(423).json(response);
      }
      
      return res.status(401).json(response);
    }

    // Handle successful login
    const sessionId = await AccountSecurity.handleSuccessfulLogin(user, deviceInfo);

    // Generate tokens with session ID
    const tokenPayload = { 
      userId: user._id, 
      sessionId,
      userType: user.userType 
    };
    
    const token = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id, sessionId }, 
      process.env.JWT_REFRESH_SECRET || 'refresh-secret', 
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    // Send login alert if enabled
    if (user.emailVerification?.isVerified) {
      await emailService.sendLoginAlert(user, deviceInfo);
    }
    
    if (user.phoneVerification?.isVerified) {
      await smsService.sendLoginAlert(user.phone, deviceInfo);
    }

    // Remove password from response
    const userResponse = user.getPublicProfile();

    const responseData = {
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        refreshToken,
        sessionId,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
        requiresMFA: user.mfa?.isEnabled || false
      }
    };

    // If MFA is enabled, don't include full access token
    if (user.mfa?.isEnabled) {
      responseData.message = 'MFA verification required';
      responseData.data.requiresMFAVerification = true;
      responseData.data.tempToken = jwt.sign(
        { userId: user._id, sessionId, mfaPending: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
      delete responseData.data.token; // Remove full access token
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      code: 'SERVER_ERROR'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you would blacklist the token
    // For now, we just send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new tokens
      const newToken = generateToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });

    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user data'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token (in production, you'd send this via email)
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '1h'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email',
      resetToken // In production, don't send this in response
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Invalid reset token'
        });
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Setup MFA
// @route   POST /api/auth/mfa/setup
// @access  Private
const setupMFA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate MFA secret
    const secret = MFAUtils.generateMFASecret(user.email);
    const qrCodeUrl = await MFAUtils.generateQRCode(secret);
    const backupCodes = MFAUtils.generateBackupCodes();

    // Save MFA data to user
    user.mfa = {
      isEnabled: false, // Will be enabled after verification
      secret: secret.base32,
      backupCodes: backupCodes,
      lastUsed: null
    };

    await user.save();

    // Send setup email with QR code and backup codes
    await emailService.sendMFASetup(user, qrCodeUrl, backupCodes);

    res.status(200).json({
      success: true,
      message: 'MFA setup initiated. Check your email for setup instructions.',
      data: {
        qrCodeUrl,
        backupCodes: backupCodes.map(code => code.code),
        secret: secret.base32 // For manual entry
      }
    });

  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during MFA setup'
    });
  }
};

// @desc    Verify and enable MFA
// @route   POST /api/auth/mfa/verify-setup
// @access  Private
const verifyMFASetup = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.mfa?.secret) {
      return res.status(400).json({
        success: false,
        message: 'MFA setup not initiated'
      });
    }

    // Verify the token
    const isValid = MFAUtils.verifyMFAToken(token, user.mfa.secret);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MFA token'
      });
    }

    // Enable MFA
    user.mfa.isEnabled = true;
    user.mfa.lastUsed = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA enabled successfully',
      data: {
        mfaEnabled: true
      }
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during MFA verification'
    });
  }
};

// @desc    Verify MFA token during login
// @route   POST /api/auth/mfa/verify
// @access  Public (with temp token)
const verifyMFA = async (req, res) => {
  try {
    const { tempToken, mfaToken, backupCode } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Temporary token required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (!decoded.mfaPending) {
        throw new Error('Invalid temp token');
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired temporary token'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.mfa?.isEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA not enabled for this user'
      });
    }

    let isValid = false;

    if (mfaToken) {
      // Verify MFA token
      isValid = MFAUtils.verifyMFAToken(mfaToken, user.mfa.secret);
    } else if (backupCode) {
      // Verify backup code
      isValid = MFAUtils.validateBackupCode(backupCode, user.mfa.backupCodes);
      if (isValid) {
        await user.save(); // Save updated backup codes
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'MFA token or backup code required'
      });
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MFA token or backup code'
      });
    }

    // Update MFA last used
    user.mfa.lastUsed = new Date();
    await user.save();

    // Generate full access token
    const tokenPayload = {
      userId: user._id,
      sessionId: decoded.sessionId,
      userType: user.userType,
      mfaVerified: true
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, sessionId: decoded.sessionId },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'MFA verification successful',
      data: {
        user: user.getPublicProfile(),
        token,
        refreshToken,
        sessionId: decoded.sessionId,
        mfaVerified: true
      }
    });

  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during MFA verification'
    });
  }
};

// @desc    Disable MFA
// @route   POST /api/auth/mfa/disable
// @access  Private
const disableMFA = async (req, res) => {
  try {
    const { currentPassword, mfaToken } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Verify MFA token if MFA is enabled
    if (user.mfa?.isEnabled) {
      if (!mfaToken) {
        return res.status(400).json({
          success: false,
          message: 'MFA token required to disable MFA'
        });
      }

      const isValidMFA = MFAUtils.verifyMFAToken(mfaToken, user.mfa.secret);
      if (!isValidMFA) {
        return res.status(400).json({
          success: false,
          message: 'Invalid MFA token'
        });
      }
    }

    // Disable MFA
    user.mfa = {
      isEnabled: false,
      secret: null,
      backupCodes: [],
      lastUsed: null
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'MFA disabled successfully'
    });

  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during MFA disable'
    });
  }
};

// @desc    Validate password strength
// @route   POST /api/auth/validate-password
// @access  Public
const validatePasswordStrength = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const validation = PasswordSecurity.validatePasswordStrength(password);

    res.status(200).json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Password validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password validation'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
  forgotPassword,
  resetPassword,
  setupMFA,
  verifyMFASetup,
  verifyMFA,
  disableMFA,
  validatePasswordStrength
};
