const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Password Security Utils
 */
class PasswordSecurity {
  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasNonalphas) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  }
  
  static calculatePasswordStrength(password) {
    let score = 0;
    
    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character variety scoring
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/\W/.test(password)) score += 1;
    
    // Pattern checks
    if (!/(.)\1{2,}/.test(password)) score += 1; // No repeated characters
    if (!/123|abc|qwerty|password/i.test(password)) score += 1; // No common patterns
    
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const level = Math.min(Math.floor(score / 1.5), strengthLevels.length - 1);
    
    return {
      score,
      level: strengthLevels[level],
      percentage: Math.round((score / 9) * 100)
    };
  }
}

/**
 * Multi-Factor Authentication Utils
 */
class MFAUtils {
  static generateMFASecret(userEmail) {
    return speakeasy.generateSecret({
      name: `Homeaze (${userEmail})`,
      issuer: 'Homeaze Platform',
      length: 32
    });
  }
  
  static async generateQRCode(secret) {
    try {
      return await QRCode.toDataURL(secret.otpauth_url);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }
  
  static verifyMFAToken(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 step before/after for time sync issues
    });
  }
  
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push({
        code: code,
        used: false,
        createdAt: new Date()
      });
    }
    return codes;
  }
  
  static validateBackupCode(inputCode, backupCodes) {
    const code = backupCodes.find(bc => 
      bc.code === inputCode.toUpperCase() && !bc.used
    );
    
    if (code) {
      code.used = true;
      code.usedAt = new Date();
      return true;
    }
    
    return false;
  }
}

/**
 * Session Security Utils
 */
class SessionSecurity {
  static generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  static parseUserAgent(userAgent) {
    // Simple user agent parsing - in production, use a library like 'ua-parser-js'
    const platform = /Windows|Mac|Linux|Android|iOS/.exec(userAgent)?.[0] || 'Unknown';
    const browser = /Chrome|Firefox|Safari|Edge|Opera/.exec(userAgent)?.[0] || 'Unknown';
    
    return { platform, browser };
  }
  
  static extractDeviceInfo(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const { platform, browser } = this.parseUserAgent(userAgent);
    
    return {
      userAgent,
      ip,
      platform,
      browser
    };
  }
  
  static isSessionExpired(session, maxInactiveTime = 24 * 60 * 60 * 1000) { // 24 hours
    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    return (now - lastActivity) > maxInactiveTime;
  }
}

/**
 * Account Security Utils
 */
class AccountSecurity {
  static isAccountLocked(user) {
    if (!user.loginAttempts?.lockedUntil) return false;
    return new Date() < user.loginAttempts.lockedUntil;
  }
  
  static calculateLockoutDuration(attempts) {
    // Progressive lockout: 15min, 30min, 1hr, 2hr, 24hr
    const durations = [15, 30, 60, 120, 1440]; // in minutes
    const index = Math.min(attempts - 5, durations.length - 1);
    return durations[index] * 60 * 1000; // convert to milliseconds
  }
  
  static async handleFailedLogin(user) {
    const maxAttempts = 5;
    user.loginAttempts = user.loginAttempts || { count: 0 };
    user.loginAttempts.count += 1;
    user.loginAttempts.lastAttempt = new Date();
    
    if (user.loginAttempts.count >= maxAttempts) {
      const lockoutDuration = this.calculateLockoutDuration(user.loginAttempts.count);
      user.loginAttempts.lockedUntil = new Date(Date.now() + lockoutDuration);
    }
    
    await user.save();
    
    return {
      isLocked: user.loginAttempts.count >= maxAttempts,
      attemptsRemaining: Math.max(0, maxAttempts - user.loginAttempts.count),
      lockedUntil: user.loginAttempts.lockedUntil
    };
  }
  
  static async handleSuccessfulLogin(user, deviceInfo) {
    // Reset login attempts
    user.loginAttempts = {
      count: 0,
      lastAttempt: null,
      lockedUntil: null
    };
    
    // Create new session
    const sessionId = SessionSecurity.generateSessionId();
    const newSession = {
      sessionId,
      deviceInfo,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true
    };
    
    // Clean up old sessions (keep last 5 sessions)
    user.sessions = user.sessions || [];
    user.sessions = user.sessions
      .filter(session => session.isActive)
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .slice(0, 4); // Keep 4, add 1 new = 5 total
    
    user.sessions.unshift(newSession);
    
    await user.save();
    
    return sessionId;
  }
}

/**
 * Token Generation Utils
 */
class TokenUtils {
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  static generateNumericCode(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  
  static generateEmailVerificationToken() {
    const token = this.generateSecureToken(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    return {
      token,
      hashedToken: this.hashToken(token),
      expires
    };
  }
  
  static generatePhoneVerificationCode() {
    const code = this.generateNumericCode(6);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    return {
      code: code.toString(),
      expires
    };
  }
  
  static generatePasswordResetToken() {
    const token = this.generateSecureToken(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    return {
      token,
      hashedToken: this.hashToken(token),
      expires
    };
  }
}

/**
 * Input Sanitization Utils
 */
class SanitizationUtils {
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }
  
  static sanitizeEmail(email) {
    if (typeof email !== 'string') return '';
    
    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, ''); // Only allow word chars, @, ., -
  }
  
  static sanitizePhone(phone) {
    if (typeof phone !== 'string') return '';
    
    return phone
      .trim()
      .replace(/[^\d+()-\s]/g, ''); // Only allow digits, +, (), -, space
  }
}

module.exports = {
  PasswordSecurity,
  MFAUtils,
  SessionSecurity,
  AccountSecurity,
  TokenUtils,
  SanitizationUtils
};
