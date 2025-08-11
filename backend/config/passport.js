require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

/**
 * JWT Strategy for API authentication with enhanced security
 */
passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'homeaze-fallback-secret-key',
  passReqToCallback: true
}, async (req, payload, done) => {
  try {
    const user = await User.findById(payload.id || payload.userId).select('-password');
    if (!user) {
      return done(null, false);
    }

    // Check if account is locked
    if (user.accountLocked && user.lockUntil > Date.now()) {
      return done(null, false, { message: 'Account is temporarily locked' });
    }

    // Check account status
    if (user.accountStatus !== 'active') {
      return done(null, false, { message: 'Account is not active' });
    }

    // Validate session if present
    if (payload.sessionId && user.sessions) {
      const session = user.sessions.find(s => s.sessionId === payload.sessionId);
      if (!session || session.expiresAt < new Date()) {
        return done(null, false, { message: 'Session expired' });
      }
      
      // Update last activity
      session.lastActivity = new Date();
      await user.save();
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

/**
 * Google OAuth Strategy with enhanced security
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth profile:', profile.id, profile.emails[0].value);
      
      // Check if user already exists with this Google ID or email
      let user = await User.findOne({ 
        $or: [
          { 'socialAccounts.googleId': profile.id },
          { email: profile.emails[0].value }
        ]
      });
      
      if (user) {
        // Update existing user with Google account info
        if (!user.socialAccounts.googleId) {
          user.socialAccounts.googleId = profile.id;
          user.socialAccounts.googleProfile = {
            displayName: profile.displayName,
            photos: profile.photos
          };
          user.emailVerified = true; // Google emails are pre-verified
          user.lastLogin = new Date();
          await user.save();
        }
        return done(null, user);
      }
      
      // Create new user from Google profile
      const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: 'oauth-' + Math.random().toString(36).substring(7), // Random password for OAuth users
        userType: 'customer',
        profilePicture: profile.photos[0]?.value,
        emailVerified: true,
        socialAccounts: {
          googleId: profile.id,
          googleProfile: {
            displayName: profile.displayName,
            photos: profile.photos
          }
        },
        accountStatus: 'active',
        registrationMethod: 'google',
        lastLogin: new Date(),
        address: {
          coordinates: [0, 0] // Default coordinates
        }
      });
      
      await newUser.save();
      return done(null, newUser);
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
}

/**
 * Facebook OAuth Strategy with enhanced security
 */
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use('facebook', new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos', 'name']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Facebook OAuth profile:', profile.id, profile.emails?.[0]?.value);
      
      const email = profile.emails?.[0]?.value;
      
      // Check if user already exists with this Facebook ID or email
      let user = await User.findOne({ 
        $or: [
          { 'socialAccounts.facebookId': profile.id },
          ...(email ? [{ email: email }] : [])
        ]
      });
      
      if (user) {
        // Update existing user with Facebook account info
        if (!user.socialAccounts.facebookId) {
          user.socialAccounts.facebookId = profile.id;
          user.socialAccounts.facebookProfile = {
            displayName: profile.displayName,
            photos: profile.photos
          };
          if (email) {
            user.emailVerified = true;
          }
          user.lastLogin = new Date();
          await user.save();
        }
        return done(null, user);
      }
      
      // Create new user (only if email is available)
      if (!email) {
        return done(new Error('Email not provided by Facebook'), null);
      }
      
      const newUser = new User({
        name: profile.displayName,
        email: email,
        password: 'oauth-' + Math.random().toString(36).substring(7), // Random password for OAuth users
        userType: 'customer',
        profilePicture: profile.photos?.[0]?.value,
        emailVerified: email ? true : false,
        socialAccounts: {
          facebookId: profile.id,
          facebookProfile: {
            displayName: profile.displayName,
            photos: profile.photos
          }
        },
        accountStatus: 'active',
        registrationMethod: 'facebook',
        lastLogin: new Date(),
        address: {
          coordinates: [0, 0] // Default coordinates
        }
      });
      
      await newUser.save();
      return done(null, newUser);
      
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      return done(error, null);
    }
  }));
}

/**
 * Serialize user for session
 */
passport.serializeUser((user, done) => {
  done(null, user._id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
