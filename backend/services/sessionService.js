const { v4: uuidv4 } = require('uuid');
const { generateSecureToken } = require('../utils/security');
const User = require('../models/User');

class SessionService {
  
  /**
   * Create a new session for a user
   * @param {Object} user - User object
   * @param {Object} deviceInfo - Device information from request
   * @returns {Object} Session data
   */
  static async createSession(user, deviceInfo = {}) {
    try {
      const sessionId = uuidv4();
      const sessionToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      
      const session = {
        sessionId,
        deviceInfo: {
          userAgent: deviceInfo.userAgent || 'Unknown',
          ip: deviceInfo.ip || 'Unknown',
          browser: deviceInfo.browser || 'Unknown',
          os: deviceInfo.os || 'Unknown',
          deviceType: deviceInfo.deviceType || 'Unknown'
        },
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt,
        isActive: true
      };

      // Add session to user's sessions array
      if (!user.sessions) {
        user.sessions = [];
      }
      
      // Limit to 5 active sessions per user
      if (user.sessions.length >= 5) {
        user.sessions.sort((a, b) => b.lastActivity - a.lastActivity);
        user.sessions = user.sessions.slice(0, 4);
      }
      
      user.sessions.push(session);
      user.lastLogin = new Date();
      
      await user.save();
      
      return {
        sessionId,
        sessionToken,
        expiresAt,
        deviceInfo: session.deviceInfo
      };
    } catch (error) {
      throw new Error('Failed to create session: ' + error.message);
    }
  }

  /**
   * Update session activity
   * @param {String} userId - User ID
   * @param {String} sessionId - Session ID
   * @returns {Boolean} Success status
   */
  static async updateSessionActivity(userId, sessionId) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      const session = user.sessions.find(s => s.sessionId === sessionId);
      if (!session) return false;

      session.lastActivity = new Date();
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Failed to update session activity:', error);
      return false;
    }
  }

  /**
   * Validate session
   * @param {String} userId - User ID
   * @param {String} sessionId - Session ID
   * @returns {Boolean} Session validity
   */
  static async validateSession(userId, sessionId) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      const session = user.sessions.find(s => s.sessionId === sessionId);
      if (!session) return false;

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.revokeSession(userId, sessionId);
        return false;
      }

      // Check if session is active
      if (!session.isActive) return false;

      return true;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  }

  /**
   * Revoke a specific session
   * @param {String} userId - User ID
   * @param {String} sessionId - Session ID
   * @returns {Boolean} Success status
   */
  static async revokeSession(userId, sessionId) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      user.sessions = user.sessions.filter(s => s.sessionId !== sessionId);
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Failed to revoke session:', error);
      return false;
    }
  }

  /**
   * Revoke all sessions for a user (logout from all devices)
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  static async revokeAllSessions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      user.sessions = [];
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Failed to revoke all sessions:', error);
      return false;
    }
  }

  /**
   * Get all active sessions for a user
   * @param {String} userId - User ID
   * @returns {Array} Active sessions
   */
  static async getActiveSessions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.sessions) return [];

      // Filter out expired sessions
      const now = new Date();
      const activeSessions = user.sessions.filter(session => 
        session.isActive && session.expiresAt > now
      );

      return activeSessions.map(session => ({
        sessionId: session.sessionId,
        deviceInfo: session.deviceInfo,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt
      }));
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   * @param {String} userId - User ID
   * @returns {Boolean} Success status
   */
  static async cleanupExpiredSessions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      const now = new Date();
      user.sessions = user.sessions.filter(session => session.expiresAt > now);
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return false;
    }
  }

  /**
   * Check for suspicious login activity
   * @param {Object} user - User object
   * @param {Object} deviceInfo - Current device info
   * @returns {Object} Suspicious activity analysis
   */
  static analyzeSuspiciousActivity(user, deviceInfo) {
    if (!user.sessions || user.sessions.length === 0) {
      return { isSuspicious: false, reasons: [] };
    }

    const reasons = [];
    const recentSessions = user.sessions
      .filter(s => s.lastActivity > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .sort((a, b) => b.lastActivity - a.lastActivity);

    // Check for different locations (IP addresses)
    const recentIPs = recentSessions.map(s => s.deviceInfo.ip).filter(Boolean);
    const uniqueIPs = [...new Set(recentIPs)];
    if (uniqueIPs.length > 2) {
      reasons.push('Multiple IP addresses detected');
    }

    // Check for different device types
    const recentDevices = recentSessions.map(s => s.deviceInfo.deviceType).filter(Boolean);
    const uniqueDevices = [...new Set(recentDevices)];
    if (uniqueDevices.length > 2) {
      reasons.push('Multiple device types detected');
    }

    // Check for rapid successive logins
    if (recentSessions.length > 5) {
      reasons.push('High frequency login attempts');
    }

    // Check for new device/browser combination
    const currentCombo = `${deviceInfo.browser}-${deviceInfo.os}`;
    const existingCombos = user.sessions.map(s => 
      `${s.deviceInfo.browser}-${s.deviceInfo.os}`
    );
    if (!existingCombos.includes(currentCombo)) {
      reasons.push('New device/browser detected');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
      riskLevel: reasons.length >= 3 ? 'high' : reasons.length >= 2 ? 'medium' : 'low'
    };
  }

  /**
   * Extract device information from request
   * @param {Object} req - Express request object
   * @returns {Object} Device information
   */
  static extractDeviceInfo(req) {
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    
    // Basic browser detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // Basic OS detection
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    // Basic device type detection
    let deviceType = 'Unknown';
    if (userAgent.includes('Mobile')) deviceType = 'Mobile';
    else if (userAgent.includes('Tablet')) deviceType = 'Tablet';
    else deviceType = 'Desktop';

    return {
      userAgent,
      ip,
      browser,
      os,
      deviceType
    };
  }
}

module.exports = SessionService;
