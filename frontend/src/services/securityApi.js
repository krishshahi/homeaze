// Enhanced Security API service for MFA, OAuth, and session management
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development server
  : 'https://your-production-api-url.com/api'; // Production server

class SecurityAPI {
  // Get auth headers with token
  static async getAuthHeaders() {
    const token = await SecureStore.getItemAsync('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * MFA ENDPOINTS
   */

  // Setup MFA for user
  static async setupMFA() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/mfa/setup`, {
        method: 'POST',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to setup MFA');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Verify MFA setup
  static async verifyMFASetup(token) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/mfa/verify-setup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify MFA setup');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Verify MFA during login
  static async verifyMFA(tempToken, mfaToken, backupCode = null) {
    try {
      const body = { tempToken };
      if (backupCode) {
        body.backupCode = backupCode;
      } else {
        body.mfaToken = mfaToken;
      }

      const response = await fetch(`${API_BASE_URL}/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify MFA');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Disable MFA
  static async disableMFA(password) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/mfa/disable`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to disable MFA');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Generate new backup codes
  static async generateBackupCodes() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/mfa/generate-backup-codes`, {
        method: 'POST',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate backup codes');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * OAUTH ENDPOINTS
   */

  // Get OAuth login URL
  static getOAuthURL(provider) {
    return `${API_BASE_URL}/oauth/${provider}`;
  }

  // Mobile OAuth with token
  static async mobileOAuth(provider, token) {
    try {
      const endpoint = provider === 'google' ? 'google/mobile' : 'facebook/mobile';
      const body = provider === 'google' 
        ? { idToken: token }
        : { accessToken: token };

      const response = await fetch(`${API_BASE_URL}/oauth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `${provider} OAuth failed`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get connected social accounts
  static async getConnectedAccounts() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/oauth/connected`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get connected accounts');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Unlink social account
  static async unlinkSocialAccount(provider) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/oauth/unlink/${provider}`, {
        method: 'POST',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to unlink ${provider} account`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * SESSION MANAGEMENT ENDPOINTS
   */

  // Get active sessions
  static async getActiveSessions() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get sessions');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get current session details
  static async getCurrentSession() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/sessions/current`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get current session');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Revoke specific session
  static async revokeSession(sessionId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to revoke session');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Revoke all other sessions
  static async revokeOtherSessions() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/sessions/revoke-others`, {
        method: 'POST',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to revoke other sessions');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Revoke all sessions
  static async revokeAllSessions() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/sessions/revoke-all`, {
        method: 'POST',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to revoke all sessions');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get security summary
  static async getSecuritySummary() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/sessions/security-summary`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get security summary');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update session activity
  static async updateSessionActivity() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/sessions/activity`, {
        method: 'POST',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update session activity');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PASSWORD & SECURITY ENDPOINTS
   */

  // Validate password strength
  static async validatePasswordStrength(password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate password');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  static async changePassword(currentPassword, newPassword) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * VERIFICATION ENDPOINTS
   */

  // Send email verification
  static async sendEmailVerification() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/send-email-verification`, {
        method: 'POST',
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email verification');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  static async verifyEmail(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify email');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Send phone verification
  static async sendPhoneVerification(phoneNumber) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/send-phone-verification`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send phone verification');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Verify phone
  static async verifyPhone(code) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/auth/verify-phone`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify phone');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default SecurityAPI;
