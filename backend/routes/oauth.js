const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SessionService = require('../services/sessionService');
const { sendEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

/**
 * @desc    OAuth Success Response Helper
 */
const generateOAuthResponse = async (user, req) => {
  try {
    const deviceInfo = SessionService.extractDeviceInfo(req);
    
    // Create session
    const sessionData = await SessionService.createSession(user, deviceInfo);
    
    // Check for suspicious activity
    const suspiciousActivity = SessionService.analyzeSuspiciousActivity(user, deviceInfo);
    
    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        sessionId: sessionData.sessionId,
        userType: user.userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { 
        id: user._id,
        sessionId: sessionData.sessionId
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Send security alert if suspicious
    if (suspiciousActivity.isSuspicious && user.email && user.emailVerified) {
      await sendEmail({
        to: user.email,
        subject: 'New Login Alert - Security Notification',
        template: 'login-alert',
        data: {
          name: user.name,
          deviceInfo: deviceInfo,
          loginTime: new Date().toLocaleString(),
          location: deviceInfo.ip,
          reasons: suspiciousActivity.reasons
        }
      });
    }

    return {
      success: true,
      message: 'OAuth login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          profilePicture: user.profilePicture,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        },
        accessToken,
        refreshToken,
        sessionId: sessionData.sessionId,
        expiresAt: sessionData.expiresAt
      }
    };
  } catch (error) {
    console.error('OAuth response generation error:', error);
    return {
      success: false,
      message: 'OAuth login failed',
      error: error.message
    };
  }
};

// ===== GOOGLE OAUTH ROUTES =====

/**
 * @desc    Initiate Google OAuth
 * @route   GET /api/oauth/google
 * @access  Public
 */
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

/**
 * @desc    Google OAuth Callback
 * @route   GET /api/oauth/google/callback
 * @access  Public
 */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  async (req, res) => {
    try {
      const response = await generateOAuthResponse(req.user, req);
      
      if (response.success) {
        // Set secure HTTP-only cookies
        res.cookie('accessToken', response.data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', response.data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/success?method=google`);
      } else {
        const errorUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000'}/auth/error?message=${encodeURIComponent(response.message)}`;
        res.redirect(errorUrl);
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const errorUrl = `${process.env.CLIENT_URL || 'http://localhost:8081'}/auth/error?message=OAuth%20failed`;
      res.redirect(errorUrl);
    }
  }
);

// ===== FACEBOOK OAUTH ROUTES =====

/**
 * @desc    Initiate Facebook OAuth
 * @route   GET /api/oauth/facebook
 * @access  Public
 */
router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['email'] 
  })
);

/**
 * @desc    Facebook OAuth Callback
 * @route   GET /api/oauth/facebook/callback
 * @access  Public
 */
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/failure' }),
  async (req, res) => {
    try {
      const response = await generateOAuthResponse(req.user, req);
      
      if (response.success) {
        // Set secure HTTP-only cookies
        res.cookie('accessToken', response.data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', response.data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/success?method=facebook`);
      } else {
        const errorUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000'}/auth/error?message=${encodeURIComponent(response.message)}`;
        res.redirect(errorUrl);
      }
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      const errorUrl = `${process.env.CLIENT_URL || 'http://localhost:8081'}/auth/error?message=OAuth%20failed`;
      res.redirect(errorUrl);
    }
  }
);

// ===== MOBILE-FRIENDLY OAUTH ENDPOINTS =====

/**
 * @desc    Mobile Google OAuth
 * @route   POST /api/oauth/google/mobile
 * @access  Public
 * @body    { idToken: string } - Google ID token from mobile
 */
router.post('/google/mobile', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify Google ID token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { 'socialAccounts.googleId': googleId },
        { email: email }
      ]
    });
    
    if (user) {
      // Update existing user with Google account info
      if (!user.socialAccounts.googleId) {
        user.socialAccounts.googleId = googleId;
        user.socialAccounts.googleProfile = {
          displayName: name,
          photos: [{ value: picture }]
        };
        user.emailVerified = true;
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user from Google profile
      user = new User({
        name: name,
        email: email,
        password: 'oauth-' + Math.random().toString(36).substring(7),
        userType: 'customer',
        profilePicture: picture,
        emailVerified: true,
        socialAccounts: {
          googleId: googleId,
          googleProfile: {
            displayName: name,
            photos: [{ value: picture }]
          }
        },
        accountStatus: 'active',
        registrationMethod: 'google',
        lastLogin: new Date(),
        address: {
          coordinates: [0, 0]
        }
      });
      await user.save();
    }

    const response = await generateOAuthResponse(user, req);
    res.status(200).json(response);

  } catch (error) {
    console.error('Mobile Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google OAuth failed',
      error: error.message
    });
  }
});

/**
 * @desc    Mobile Facebook OAuth
 * @route   POST /api/oauth/facebook/mobile
 * @access  Public
 * @body    { accessToken: string } - Facebook access token from mobile
 */
router.post('/facebook/mobile', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Facebook access token is required'
      });
    }

    // Verify Facebook access token
    const fetch = require('node-fetch');
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const profile = await response.json();

    if (profile.error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Facebook access token'
      });
    }

    const { id: facebookId, email, name, picture } = profile;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email permission required for Facebook login'
      });
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { 'socialAccounts.facebookId': facebookId },
        { email: email }
      ]
    });
    
    if (user) {
      // Update existing user with Facebook account info
      if (!user.socialAccounts.facebookId) {
        user.socialAccounts.facebookId = facebookId;
        user.socialAccounts.facebookProfile = {
          displayName: name,
          photos: [{ value: picture?.data?.url }]
        };
        user.emailVerified = true;
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user from Facebook profile
      user = new User({
        name: name,
        email: email,
        password: 'oauth-' + Math.random().toString(36).substring(7),
        userType: 'customer',
        profilePicture: picture?.data?.url,
        emailVerified: true,
        socialAccounts: {
          facebookId: facebookId,
          facebookProfile: {
            displayName: name,
            photos: [{ value: picture?.data?.url }]
          }
        },
        accountStatus: 'active',
        registrationMethod: 'facebook',
        lastLogin: new Date(),
        address: {
          coordinates: [0, 0]
        }
      });
      await user.save();
    }

    const oauthResponse = await generateOAuthResponse(user, req);
    res.status(200).json(oauthResponse);

  } catch (error) {
    console.error('Mobile Facebook OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Facebook OAuth failed',
      error: error.message
    });
  }
});

// ===== OAUTH UTILITY ROUTES =====

/**
 * @desc    OAuth Success Page
 * @route   GET /api/oauth/success
 * @access  Public
 */
router.get('/success', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OAuth authentication successful'
  });
});

/**
 * @desc    OAuth Failure Page
 * @route   GET /api/oauth/failure
 * @access  Public
 */
router.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'OAuth authentication failed'
  });
});

/**
 * @desc    Link OAuth Account
 * @route   POST /api/oauth/link/:provider
 * @access  Private
 */
router.post('/link/:provider', async (req, res) => {
  try {
    // This endpoint would be used to link additional OAuth providers to existing accounts
    // Implementation depends on specific requirements
    res.status(501).json({
      success: false,
      message: 'Account linking not implemented yet'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Account linking failed',
      error: error.message
    });
  }
});

/**
 * @desc    Unlink OAuth Account
 * @route   DELETE /api/oauth/unlink/:provider
 * @access  Private
 */
router.delete('/unlink/:provider', async (req, res) => {
  try {
    // This endpoint would be used to unlink OAuth providers from accounts
    // Implementation depends on specific requirements
    res.status(501).json({
      success: false,
      message: 'Account unlinking not implemented yet'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Account unlinking failed',
      error: error.message
    });
  }
});

module.exports = router;
