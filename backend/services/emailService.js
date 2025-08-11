const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email configuration
        this.transporter = nodemailer.createTransporter({
          service: 'gmail', // or your email provider
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
      } else {
        // Development: Use Ethereal email for testing
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        
        console.log('📧 Development email account created:', testAccount.user);
      }

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: `"Homeaze Platform" <${process.env.EMAIL_USER || 'noreply@homeaze.com'}>`,
        to,
        subject,
        html,
        text: text || this.stripHTML(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Email sent (preview):', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(result) : null
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  stripHTML(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  // Email Templates
  getEmailVerificationTemplate(user, verificationUrl) {
    return {
      subject: 'Verify Your Email Address - Homeaze',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007AFF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #007AFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            .code { background-color: #f0f0f0; padding: 10px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏠 Welcome to Homeaze!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Thank you for signing up for Homeaze! To complete your registration, please verify your email address.</p>
            
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #007AFF;">${verificationUrl}</p>
            
            <p>This verification link will expire in 24 hours for security purposes.</p>
            
            <p>If you didn't create an account with Homeaze, you can safely ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Homeaze Team</p>
              <p><small>This is an automated message. Please do not reply to this email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getPasswordResetTemplate(user, resetUrl) {
    return {
      subject: 'Password Reset Request - Homeaze',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>We received a request to reset your password for your Homeaze account.</p>
            
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #FF6B35;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>You can only use this link once</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The Homeaze Team</p>
              <p><small>This is an automated message. Please do not reply to this email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getMFASetupTemplate(user, qrCodeUrl, backupCodes) {
    return {
      subject: 'Two-Factor Authentication Setup - Homeaze',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MFA Setup</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28A745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .qr-container { text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 8px; }
            .backup-codes { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; font-family: monospace; }
            .code { display: inline-block; margin: 5px 10px; padding: 5px 10px; background: #e9ecef; border-radius: 3px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Two-Factor Authentication Setup</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>You've successfully enabled two-factor authentication on your Homeaze account! Here are your setup details:</p>
            
            <div class="qr-container">
              <h3>QR Code for Authenticator App</h3>
              <img src="${qrCodeUrl}" alt="QR Code for MFA Setup" style="max-width: 200px; height: auto;">
              <p><small>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</small></p>
            </div>
            
            <h3>Backup Codes</h3>
            <p>Save these backup codes in a secure location. You can use them to access your account if you lose your phone:</p>
            
            <div class="backup-codes">
              ${backupCodes.map(code => `<span class="code">${code.code}</span>`).join('')}
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>Keep your backup codes safe and secure</li>
                <li>Each backup code can only be used once</li>
                <li>Don't share these codes with anyone</li>
                <li>Consider printing them and storing them offline</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The Homeaze Team</p>
              <p><small>This is an automated message. Please do not reply to this email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getLoginAlertTemplate(user, deviceInfo, location) {
    return {
      subject: 'New Login Alert - Homeaze',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #6C757D; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .login-details { background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔔 New Login Detected</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>We detected a new login to your Homeaze account. Here are the details:</p>
            
            <div class="login-details">
              <h3>Login Information:</h3>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Device:</strong> ${deviceInfo.platform} - ${deviceInfo.browser}</p>
              <p><strong>IP Address:</strong> ${deviceInfo.ip}</p>
              ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
            </div>
            
            <p>If this was you, no action is needed. If you don't recognize this login, please:</p>
            <ul>
              <li>Change your password immediately</li>
              <li>Enable two-factor authentication</li>
              <li>Review your recent account activity</li>
              <li>Contact our support team</li>
            </ul>
            
            <div class="footer">
              <p>Best regards,<br>The Homeaze Team</p>
              <p><small>This is an automated security message. Please do not reply to this email.</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Convenience methods
  async sendEmailVerification(user, verificationUrl) {
    const template = this.getEmailVerificationTemplate(user, verificationUrl);
    return await this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html
    });
  }

  async sendPasswordReset(user, resetUrl) {
    const template = this.getPasswordResetTemplate(user, resetUrl);
    return await this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html
    });
  }

  async sendMFASetup(user, qrCodeUrl, backupCodes) {
    const template = this.getMFASetupTemplate(user, qrCodeUrl, backupCodes);
    return await this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html
    });
  }

  async sendLoginAlert(user, deviceInfo, location = null) {
    const template = this.getLoginAlertTemplate(user, deviceInfo, location);
    return await this.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html
    });
  }
}

module.exports = new EmailService();
