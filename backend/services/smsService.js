const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.fromPhone = process.env.TWILIO_PHONE;
    this.initializeClient();
  }

  initializeClient() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('✅ SMS service initialized successfully');
      } else {
        console.log('⚠️ SMS service not configured - Twilio credentials missing');
      }
    } catch (error) {
      console.error('❌ SMS service initialization failed:', error.message);
    }
  }

  async sendSMS({ to, message }) {
    try {
      if (!this.client) {
        console.log('📱 SMS would be sent (no client configured):', { to, message });
        return {
          success: false,
          error: 'SMS service not configured',
          mock: true
        };
      }

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = to.replace(/[^\d+]/g, '');
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromPhone,
        to: cleanPhone
      });

      console.log('📱 SMS sent successfully:', result.sid);
      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatPhoneNumber(phone) {
    // Simple phone formatting - in production, use a proper phone formatting library
    const cleaned = phone.replace(/\D/g, '');
    
    // If it's a US number without country code, add +1
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // If it already has a country code
    if (cleaned.length > 10 && !cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    return phone; // Return as-is if we can't format it
  }

  // SMS Templates
  getPhoneVerificationMessage(code, appName = 'Homeaze') {
    return `Your ${appName} verification code is: ${code}. This code will expire in 10 minutes. Do not share this code with anyone.`;
  }

  getLoginAlertMessage(deviceInfo, appName = 'Homeaze') {
    return `${appName} Security Alert: New login detected from ${deviceInfo.platform} - ${deviceInfo.browser}. If this wasn't you, secure your account immediately.`;
  }

  getPasswordResetMessage(appName = 'Homeaze') {
    return `${appName} Security Alert: A password reset was requested for your account. If you didn't request this, please contact support immediately.`;
  }

  getMFACodeMessage(code, appName = 'Homeaze') {
    return `Your ${appName} authentication code is: ${code}. This code will expire in 5 minutes.`;
  }

  getBookingNotificationMessage(bookingDetails, appName = 'Homeaze') {
    return `${appName}: New booking request for ${bookingDetails.serviceTitle} on ${bookingDetails.date}. Check your app for details.`;
  }

  getAccountLockedMessage(lockDuration, appName = 'Homeaze') {
    return `${appName} Security: Your account has been temporarily locked due to multiple failed login attempts. Try again in ${lockDuration} minutes.`;
  }

  // Convenience methods
  async sendPhoneVerification(phone, code) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const message = this.getPhoneVerificationMessage(code);
    
    return await this.sendSMS({
      to: formattedPhone,
      message
    });
  }

  async sendLoginAlert(phone, deviceInfo) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const message = this.getLoginAlertMessage(deviceInfo);
    
    return await this.sendSMS({
      to: formattedPhone,
      message
    });
  }

  async sendPasswordResetAlert(phone) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const message = this.getPasswordResetMessage();
    
    return await this.sendSMS({
      to: formattedPhone,
      message
    });
  }

  async sendMFACode(phone, code) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const message = this.getMFACodeMessage(code);
    
    return await this.sendSMS({
      to: formattedPhone,
      message
    });
  }

  async sendBookingNotification(phone, bookingDetails) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const message = this.getBookingNotificationMessage(bookingDetails);
    
    return await this.sendSMS({
      to: formattedPhone,
      message
    });
  }

  async sendAccountLockedAlert(phone, lockDurationMinutes) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const message = this.getAccountLockedMessage(lockDurationMinutes);
    
    return await this.sendSMS({
      to: formattedPhone,
      message
    });
  }

  // Utility methods
  isValidPhoneNumber(phone) {
    // Basic phone validation - in production, use a proper phone validation library
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  async validatePhoneProvider(phone) {
    try {
      if (!this.client) {
        return { valid: false, error: 'SMS service not configured' };
      }

      const lookup = await this.client.lookups.phoneNumbers(phone).fetch();
      
      return {
        valid: true,
        phoneNumber: lookup.phoneNumber,
        countryCode: lookup.countryCode,
        carrier: lookup.carrier?.name || 'Unknown'
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Rate limiting for SMS
  static smsRateLimiter = new Map();

  canSendSMS(phone, maxSMSPerHour = 5) {
    const key = `sms_${phone}`;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!SMSService.smsRateLimiter.has(key)) {
      SMSService.smsRateLimiter.set(key, []);
    }

    const timestamps = SMSService.smsRateLimiter.get(key);
    
    // Remove timestamps older than 1 hour
    const recentTimestamps = timestamps.filter(timestamp => (now - timestamp) < oneHour);
    SMSService.smsRateLimiter.set(key, recentTimestamps);

    if (recentTimestamps.length >= maxSMSPerHour) {
      return {
        allowed: false,
        resetTime: new Date(recentTimestamps[0] + oneHour),
        remainingAttempts: 0
      };
    }

    // Add current timestamp
    recentTimestamps.push(now);
    SMSService.smsRateLimiter.set(key, recentTimestamps);

    return {
      allowed: true,
      remainingAttempts: maxSMSPerHour - recentTimestamps.length
    };
  }
}

module.exports = new SMSService();
