import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MFASetupScreen, PasswordStrengthIndicator } from '../components/MFAComponents';
import { ActiveSessionsScreen, SecurityDashboard } from '../components/SessionManagement';
import { ConnectedAccountsScreen } from '../components/SocialAuth';
import SecurityAPI from '../services/securityApi';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppSelector } from '../store/hooks';

const SecuritySettingsScreen = ({ navigation }) => {
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [securityData, setSecurityData] = useState(null);
  
  // Modal states
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [showConnectedAccounts, setShowConnectedAccounts] = useState(false);
  
  // Form states
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      
      // Load user's security settings
      setMfaEnabled(user?.mfaEnabled || false);
      
      // Load security summary
      const summary = await SecurityAPI.getSecuritySummary();
      if (summary.success) {
        setSecurityData(summary.data);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSecuritySettings();
    setRefreshing(false);
  };

  const handleMFAToggle = async () => {
    if (mfaEnabled) {
      // Disable MFA
      Alert.alert(
        'Disable Two-Factor Authentication',
        'This will reduce your account security. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              Alert.prompt(
                'Confirm Password',
                'Please enter your password to disable MFA',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Confirm',
                    onPress: async (password) => {
                      try {
                        await SecurityAPI.disableMFA(password);
                        setMfaEnabled(false);
                        Alert.alert('Success', 'Two-factor authentication disabled');
                      } catch (error) {
                        Alert.alert('Error', error.message || 'Failed to disable MFA');
                      }
                    }
                  }
                ],
                'secure-text'
              );
            }
          }
        ]
      );
    } else {
      // Enable MFA
      setShowMFASetup(true);
    }
  };

  const handleMFASetupComplete = () => {
    setMfaEnabled(true);
    Alert.alert('Success', 'Two-factor authentication has been enabled successfully!');
    loadSecuritySettings(); // Refresh security data
  };

  const handleLogoutAllDevices = async () => {
    Alert.alert(
      'Logout from All Devices',
      'This will end all your active sessions. You will need to log in again on all devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout All',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await SecurityAPI.revokeAllSessions();
              Alert.alert('Success', `${response.data.revokedCount} sessions ended`);
              // This would typically log out the current user too
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to logout from all devices');
            }
          }
        }
      ]
    );
  };

  const renderSecurityCard = (title, description, icon, onPress, rightElement = null) => (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
        </View>
        {rightElement || (
          <Text style={styles.cardArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !securityData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading security settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          
          {/* Security Overview */}
          {securityData && (
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <Text style={styles.overviewIcon}>🛡️</Text>
                <View style={styles.overviewContent}>
                  <Text style={styles.overviewTitle}>Security Status</Text>
                  <Text style={[
                    styles.overviewStatus,
                    { 
                      color: securityData.riskAssessment?.level === 'high' 
                        ? COLORS.error 
                        : securityData.riskAssessment?.level === 'medium'
                        ? COLORS.warning
                        : COLORS.success 
                    }
                  ]}>
                    {securityData.riskAssessment?.level?.toUpperCase() || 'UNKNOWN'} RISK
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.overviewButton}
                  onPress={() => setShowSecurityDashboard(true)}
                >
                  <Text style={styles.overviewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Two-Factor Authentication */}
          {renderSecurityCard(
            'Two-Factor Authentication',
            mfaEnabled 
              ? 'Your account is protected with 2FA' 
              : 'Add an extra layer of security to your account',
            '🔐',
            handleMFAToggle,
            <Switch
              value={mfaEnabled}
              onValueChange={handleMFAToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          )}

          {/* Active Sessions */}
          {renderSecurityCard(
            'Active Sessions',
            securityData 
              ? `${securityData.totalActiveSessions || 0} active sessions`
              : 'Manage devices where you\'re signed in',
            '📱',
            () => setShowSessions(true)
          )}

          {/* Connected Accounts */}
          {renderSecurityCard(
            'Connected Accounts',
            'Manage your social login connections',
            '🔗',
            () => setShowConnectedAccounts(true)
          )}

          {/* Password & Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>
            
            {renderSecurityCard(
              'Change Password',
              'Update your account password',
              '🔑',
              () => {
                // Navigate to change password screen
                Alert.alert('Feature', 'Change password screen would open here');
              }
            )}

            {renderSecurityCard(
              'Email Verification',
              user?.emailVerified 
                ? 'Email is verified ✅' 
                : 'Verify your email address',
              '📧',
              user?.emailVerified 
                ? null 
                : async () => {
                    try {
                      await SecurityAPI.sendEmailVerification();
                      Alert.alert('Success', 'Verification email sent!');
                    } catch (error) {
                      Alert.alert('Error', error.message || 'Failed to send verification email');
                    }
                  }
            )}

            {renderSecurityCard(
              'Phone Verification',
              user?.phoneVerified 
                ? 'Phone is verified ✅' 
                : 'Verify your phone number',
              '📱',
              user?.phoneVerified 
                ? null 
                : () => {
                    Alert.alert('Feature', 'Phone verification would open here');
                  }
            )}
          </View>

          {/* Privacy & Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Notifications</Text>
            
            {renderSecurityCard(
              'Email Notifications',
              'Receive security alerts via email',
              '📬',
              null,
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            )}

            {renderSecurityCard(
              'SMS Notifications',
              'Receive security alerts via SMS',
              '💬',
              null,
              <Switch
                value={smsNotifications}
                onValueChange={setSmsNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            )}
          </View>

          {/* Advanced Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advanced</Text>
            
            {renderSecurityCard(
              'Security Dashboard',
              'View detailed security analytics',
              '📊',
              () => setShowSecurityDashboard(true)
            )}

            {renderSecurityCard(
              'Logout All Devices',
              'End sessions on all devices',
              '🚪',
              handleLogoutAllDevices
            )}

            {renderSecurityCard(
              'Download Security Report',
              'Export your account security data',
              '📄',
              () => {
                Alert.alert('Feature', 'Security report download would start here');
              }
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <MFASetupScreen
        visible={showMFASetup}
        onClose={() => setShowMFASetup(false)}
        onSetupComplete={handleMFASetupComplete}
      />

      <ActiveSessionsScreen
        visible={showSessions}
        onClose={() => setShowSessions(false)}
      />

      <SecurityDashboard
        visible={showSecurityDashboard}
        onClose={() => setShowSecurityDashboard(false)}
      />

      <ConnectedAccountsScreen
        visible={showConnectedAccounts}
        onClose={() => setShowConnectedAccounts(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
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
  
  // Overview Card
  overviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  overviewContent: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  overviewStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  overviewButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  overviewButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Security Cards
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    width: 24,
    textAlign: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },

  // Sections
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
});

export default SecuritySettingsScreen;
