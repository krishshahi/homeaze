import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import SecurityAPI from '../services/securityApi';
import { TOKEN_STORAGE_KEY } from '../config/api';



const { width } = Dimensions.get('window');

/**
 * Social Login Buttons Component
 */
export const SocialLoginButtons = ({ onSuccess, loading = false }) => {
  const [socialLoading, setSocialLoading] = useState(null);

  const handleOAuthLogin = async (provider) => {
    try {
      setSocialLoading(provider);
      
      // For web-based OAuth flow
      const oauthUrl = SecurityAPI.getOAuthURL(provider);
      
      // Open OAuth URL in WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl,
        'homeaze://auth/callback'
      );

      if (result.type === 'success') {
        // Handle successful OAuth response
        const url = result.url;
        const params = new URLSearchParams(url.split('?')[1]);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');

        if (token && refreshToken) {
          // Store tokens and user data
          await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
          await AsyncStorage.setItem('refreshToken', refreshToken);
          
          Alert.alert('Success', `${provider} login successful!`);
          onSuccess && onSuccess({ token, refreshToken });
        } else {
          throw new Error('Authentication tokens not received');
        }
      } else if (result.type === 'cancel') {
        Alert.alert('Cancelled', 'OAuth login was cancelled');
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      Alert.alert('Error', error.message || `${provider} login failed`);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <View style={styles.socialContainer}>
      <Text style={styles.socialTitle}>Or continue with</Text>
      
      <View style={styles.socialButtonsRow}>
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={() => handleOAuthLogin('google')}
          disabled={loading || socialLoading}
        >
          {socialLoading === 'google' ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Text style={styles.socialIcon}>🔍</Text>
              <Text style={styles.socialButtonText}>Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.facebookButton]}
          onPress={() => handleOAuthLogin('facebook')}
          disabled={loading || socialLoading}
        >
          {socialLoading === 'facebook' ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Text style={styles.socialIcon}>📘</Text>
              <Text style={styles.socialButtonText}>Facebook</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.termsText}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

/**
 * Connected Accounts Management Component
 */
export const ConnectedAccountsScreen = ({ visible, onClose }) => {
  const [connectedAccounts, setConnectedAccounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (visible) {
      loadConnectedAccounts();
    }
  }, [visible]);

  const loadConnectedAccounts = async () => {
    try {
      setLoading(true);
      const response = await SecurityAPI.getConnectedAccounts();
      if (response.success) {
        setConnectedAccounts(response.data);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (provider) => {
    try {
      setActionLoading(`link-${provider}`);
      
      // Get OAuth URL and open in browser
      const oauthUrl = SecurityAPI.getOAuthURL(provider);
      
      const result = await WebBrowser.openAuthSessionAsync(
        `${oauthUrl}?linking=true`,
        'homeaze://auth/callback'
      );

      if (result.type === 'success') {
        Alert.alert('Success', `${provider} account linked successfully!`);
        await loadConnectedAccounts();
      }
    } catch (error) {
      Alert.alert('Error', error.message || `Failed to link ${provider} account`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlinkAccount = async (provider) => {
    Alert.alert(
      'Unlink Account',
      `Are you sure you want to unlink your ${provider} account? You can always link it again later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(`unlink-${provider}`);
              await SecurityAPI.unlinkSocialAccount(provider);
              Alert.alert('Success', `${provider} account unlinked successfully`);
              await loadConnectedAccounts();
            } catch (error) {
              Alert.alert('Error', error.message || `Failed to unlink ${provider} account`);
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const renderAccountItem = (provider, accountData) => {
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    const isConnected = accountData.connected;
    const profile = accountData.profile;

    return (
      <View key={provider} style={styles.accountItem}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <Text style={styles.providerIcon}>
              {provider === 'google' ? '🔍' : '📘'}
            </Text>
            <View style={styles.accountDetails}>
              <Text style={styles.providerName}>{providerName}</Text>
              <Text style={styles.accountStatus}>
                {isConnected 
                  ? `Connected${profile?.displayName ? ` as ${profile.displayName}` : ''}`
                  : 'Not connected'
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.statusIndicator}>
            <Text style={[
              styles.statusDot,
              { color: isConnected ? COLORS.success : COLORS.textSecondary }
            ]}>
              {isConnected ? '●' : '○'}
            </Text>
          </View>
        </View>

        <View style={styles.accountActions}>
          {isConnected ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.unlinkButton,
                actionLoading === `unlink-${provider}` && styles.loadingButton
              ]}
              onPress={() => handleUnlinkAccount(provider)}
              disabled={actionLoading === `unlink-${provider}`}
            >
              {actionLoading === `unlink-${provider}` ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.unlinkButtonText}>Unlink</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.linkButton,
                actionLoading === `link-${provider}` && styles.loadingButton
              ]}
              onPress={() => handleLinkAccount(provider)}
              disabled={actionLoading === `link-${provider}`}
            >
              {actionLoading === `link-${provider}` ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.linkButtonText}>Link Account</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connected Accounts</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading connected accounts...</Text>
          </View>
        ) : connectedAccounts ? (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.description}>
                Manage your connected social accounts. Linking accounts allows you to sign in with multiple methods.
              </Text>

              <View style={styles.accountsList}>
                {renderAccountItem('google', connectedAccounts.google)}
                {renderAccountItem('facebook', connectedAccounts.facebook)}
              </View>

              <View style={styles.securityNote}>
                <Text style={styles.securityNoteIcon}>🔒</Text>
                <View style={styles.securityNoteContent}>
                  <Text style={styles.securityNoteTitle}>Security Note</Text>
                  <Text style={styles.securityNoteText}>
                    Linking accounts provides convenient sign-in options while maintaining security. 
                    You can unlink accounts at any time.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>Failed to load connected accounts</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadConnectedAccounts}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

/**
 * OAuth Success Handler Component
 */
export const OAuthSuccessHandler = ({ route }) => {
  useEffect(() => {
    // Handle OAuth callback success
    if (route?.params?.token) {
      const { token, refreshToken } = route.params;
      
      // Store tokens
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      AsyncStorage.setItem('refreshToken', refreshToken);
      
      // Navigate back or show success
      Alert.alert('Success', 'Account connected successfully!');
    }
  }, [route]);

  return (
    <View style={styles.successContainer}>
      <Text style={styles.successText}>🎉</Text>
      <Text style={styles.successMessage}>Account Connected Successfully!</Text>
      <Text style={styles.successSubtext}>You can now close this window.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Social Login Buttons
  socialContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  socialTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.xs,
    minHeight: 50,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  socialIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  socialButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: SPACING.md,
  },

  // Connected Accounts Modal
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  accountsList: {
    marginBottom: SPACING.lg,
  },
  accountItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  accountDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  accountStatus: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    fontSize: 20,
  },
  accountActions: {
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  linkButton: {
    backgroundColor: COLORS.primary,
  },
  linkButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  unlinkButton: {
    backgroundColor: COLORS.error,
  },
  unlinkButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingButton: {
    backgroundColor: COLORS.disabled,
  },
  securityNote: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  securityNoteIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  securityNoteContent: {
    flex: 1,
  },
  securityNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  securityNoteText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // OAuth Success Handler
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  successText: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  successMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  successSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default {
  SocialLoginButtons,
  ConnectedAccountsScreen,
  OAuthSuccessHandler
};
