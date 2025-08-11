const express = require('express');
const passport = require('passport');
const SessionService = require('../services/sessionService');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

/**
 * @desc    Get all active sessions for the current user
 * @route   GET /api/sessions
 * @access  Private
 */
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await SessionService.getActiveSessions(userId);

    res.json({
      success: true,
      message: 'Active sessions retrieved successfully',
      data: {
        sessions,
        totalCount: sessions.length
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions'
    });
  }
});

/**
 * @desc    Get current session details
 * @route   GET /api/sessions/current
 * @access  Private
 */
router.get('/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = req.user.sessionId; // From JWT payload
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'No session ID found in token'
      });
    }

    const sessions = await SessionService.getActiveSessions(userId);
    const currentSession = sessions.find(s => s.sessionId === sessionId);

    if (!currentSession) {
      return res.status(404).json({
        success: false,
        message: 'Current session not found'
      });
    }

    res.json({
      success: true,
      message: 'Current session details retrieved',
      data: {
        session: currentSession,
        isCurrent: true
      }
    });

  } catch (error) {
    console.error('Get current session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve current session'
    });
  }
});

/**
 * @desc    Revoke a specific session
 * @route   DELETE /api/sessions/:sessionId
 * @access  Private
 */
router.delete('/:sessionId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const currentSessionId = req.user.sessionId; // From JWT payload

    // Prevent users from revoking their current session through this endpoint
    if (sessionId === currentSessionId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke current session. Use logout endpoint instead.'
      });
    }

    const success = await SessionService.revokeSession(userId, sessionId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or already revoked'
      });
    }

    // Send security notification
    if (req.user.email && req.user.emailVerified) {
      const deviceInfo = SessionService.extractDeviceInfo(req);
      await sendEmail({
        to: req.user.email,
        subject: 'Security Alert - Session Terminated',
        template: 'session-revoked',
        data: {
          name: req.user.name,
          revokedAt: new Date().toLocaleString(),
          revokedFrom: `${deviceInfo.browser} on ${deviceInfo.os}`,
          revokedIP: deviceInfo.ip
        }
      });
    }

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });

  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session'
    });
  }
});

/**
 * @desc    Revoke all sessions except current one
 * @route   POST /api/sessions/revoke-others
 * @access  Private
 */
router.post('/revoke-others', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id;
    const currentSessionId = req.user.sessionId; // From JWT payload

    if (!currentSessionId) {
      return res.status(400).json({
        success: false,
        message: 'No current session ID found'
      });
    }

    // Get all active sessions first to count them
    const activeSessions = await SessionService.getActiveSessions(userId);
    const otherSessions = activeSessions.filter(s => s.sessionId !== currentSessionId);
    
    if (otherSessions.length === 0) {
      return res.json({
        success: true,
        message: 'No other sessions to revoke',
        data: { revokedCount: 0 }
      });
    }

    // Revoke all sessions and create new ones (keeping only current)
    const user = await require('../models/User').findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Keep only the current session
    user.sessions = user.sessions.filter(s => s.sessionId === currentSessionId);
    await user.save();

    // Send security notification
    if (user.email && user.emailVerified) {
      const deviceInfo = SessionService.extractDeviceInfo(req);
      await sendEmail({
        to: user.email,
        subject: 'Security Alert - Multiple Sessions Terminated',
        template: 'sessions-revoked-bulk',
        data: {
          name: user.name,
          revokedCount: otherSessions.length,
          revokedAt: new Date().toLocaleString(),
          revokedFrom: `${deviceInfo.browser} on ${deviceInfo.os}`,
          revokedIP: deviceInfo.ip
        }
      });
    }

    res.json({
      success: true,
      message: `Successfully revoked ${otherSessions.length} other sessions`,
      data: { 
        revokedCount: otherSessions.length,
        remainingSessions: 1 // Current session
      }
    });

  } catch (error) {
    console.error('Revoke other sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke other sessions'
    });
  }
});

/**
 * @desc    Revoke all sessions (complete logout from all devices)
 * @route   POST /api/sessions/revoke-all
 * @access  Private
 */
router.post('/revoke-all', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get count of sessions before revoking
    const activeSessions = await SessionService.getActiveSessions(userId);
    const sessionCount = activeSessions.length;

    const success = await SessionService.revokeAllSessions(userId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to revoke all sessions'
      });
    }

    // Send security notification
    if (req.user.email && req.user.emailVerified) {
      const deviceInfo = SessionService.extractDeviceInfo(req);
      await sendEmail({
        to: req.user.email,
        subject: 'Security Alert - All Sessions Terminated',
        template: 'all-sessions-revoked',
        data: {
          name: req.user.name,
          sessionCount: sessionCount,
          revokedAt: new Date().toLocaleString(),
          revokedFrom: `${deviceInfo.browser} on ${deviceInfo.os}`,
          revokedIP: deviceInfo.ip
        }
      });
    }

    res.json({
      success: true,
      message: 'All sessions revoked successfully. Please login again.',
      data: { 
        revokedCount: sessionCount
      }
    });

  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke all sessions'
    });
  }
});

/**
 * @desc    Update session activity (extend session)
 * @route   POST /api/sessions/activity
 * @access  Private
 */
router.post('/activity', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = req.user.sessionId; // From JWT payload

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'No session ID found in token'
      });
    }

    const success = await SessionService.updateSessionActivity(userId, sessionId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired'
      });
    }

    res.json({
      success: true,
      message: 'Session activity updated successfully'
    });

  } catch (error) {
    console.error('Update session activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session activity'
    });
  }
});

/**
 * @desc    Get session security summary
 * @route   GET /api/sessions/security-summary
 * @access  Private
 */
router.get('/security-summary', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await SessionService.getActiveSessions(userId);
    
    // Analyze session security
    const deviceTypes = [...new Set(sessions.map(s => s.deviceInfo.deviceType))];
    const locations = [...new Set(sessions.map(s => s.deviceInfo.ip))];
    const browsers = [...new Set(sessions.map(s => s.deviceInfo.browser))];
    
    // Check for suspicious patterns
    const suspiciousFlags = [];
    if (locations.length > 3) suspiciousFlags.push('Multiple locations detected');
    if (sessions.length > 5) suspiciousFlags.push('High number of active sessions');
    if (deviceTypes.length > 3) suspiciousFlags.push('Multiple device types');

    // Get last login info
    const currentDeviceInfo = SessionService.extractDeviceInfo(req);
    const suspiciousActivity = SessionService.analyzeSuspiciousActivity(req.user, currentDeviceInfo);

    res.json({
      success: true,
      message: 'Security summary retrieved successfully',
      data: {
        totalActiveSessions: sessions.length,
        uniqueDeviceTypes: deviceTypes.length,
        uniqueLocations: locations.length,
        uniqueBrowsers: browsers.length,
        deviceTypes,
        browsers,
        lastLogin: req.user.lastLogin,
        suspiciousFlags,
        riskAssessment: {
          level: suspiciousActivity.riskLevel || 'low',
          isSuspicious: suspiciousActivity.isSuspicious,
          reasons: suspiciousActivity.reasons
        }
      }
    });

  } catch (error) {
    console.error('Get security summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve security summary'
    });
  }
});

module.exports = router;
