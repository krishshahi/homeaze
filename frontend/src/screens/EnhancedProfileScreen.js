import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  StatusBar,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAuth, useProfile } from '../store/hooks';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';
import { logout } from '../store/slices/authSlice';
import { fetchProfile } from '../store/slices/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';

const EnhancedProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const profile = useProfile();
  const user = auth.user;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [profileStats, setProfileStats] = useState({
    completedBookings: 0,
    totalSpent: 0,
    savedAmount: 0,
    memberSince: '',
  });

  useEffect(() => {
    loadProfileData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.timing.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadProfileData = async () => {
    try {
      if (auth.isAuthenticated && auth.token) {
        await dispatch(fetchProfile());
        
        // Load profile statistics
        setProfileStats({
          completedBookings: user?.completedBookings || 12,
          totalSpent: user?.totalSpent || 1250,
          savedAmount: user?.savedAmount || 320,
          memberSince: user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2024',
        });
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process from Enhanced Profile...');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('userData');
      console.log('📱 AsyncStorage cleared from Enhanced Profile');
      
      // Clear Redux auth state
      dispatch(logout());
      console.log('🔄 Redux state cleared from Enhanced Profile');
      
      setShowLogoutModal(false);
      
    } catch (error) {
      console.error('❌ Enhanced Profile logout error:', error);
      dispatch(logout());
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Add address';
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode
    ].filter(part => part && part.trim());
    
    return parts.length > 0 ? parts.join(', ') : 'Add address';
  };

  const ProfileHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <LinearGradient
        colors={COLORS.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.white} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.membershipBadge}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.membershipText}>Member since {profileStats.memberSince}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileStats.completedBookings}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${profileStats.totalSpent}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${profileStats.savedAmount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const ProfileSection = ({ title, children, icon }) => (
    <Animated.View
      style={[
        styles.section,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </Animated.View>
  );

  const ProfileMenuItem = ({ icon, label, value, onPress, showArrow = true, rightComponent }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemLabel}>{label}</Text>
          {value && <Text style={styles.menuItemValue}>{value}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {rightComponent}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const ToggleMenuItem = ({ icon, label, value, onToggle, description }) => (
    <View style={styles.toggleMenuItem}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemLabel}>{label}</Text>
          {description && <Text style={styles.menuItemDescription}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
        thumbColor={value ? COLORS.primary : COLORS.backgroundSecondary}
      />
    </View>
  );

  const LogoutModal = () => (
    <Modal visible={showLogoutModal} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.logoutModal}>
          <View style={styles.logoutModalHeader}>
            <Ionicons name="log-out-outline" size={48} color={COLORS.error} />
            <Text style={styles.logoutModalTitle}>Sign Out</Text>
            <Text style={styles.logoutModalSubtitle}>
              Are you sure you want to sign out of your account?
            </Text>
          </View>

          <View style={styles.logoutModalActions}>
            <CustomButton
              title="Cancel"
              variant="outline"
              onPress={() => setShowLogoutModal(false)}
              style={styles.cancelButton}
            />
            <CustomButton
              title="Sign Out"
              variant="danger"
              onPress={handleLogout}
              style={styles.signOutButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ProfileHeader />

        {/* Personal Information */}
        <ProfileSection title="Personal Information" icon="person-outline">
          <ProfileMenuItem
            icon="card-outline"
            label="Personal Details"
            value="View and edit your information"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <ProfileMenuItem
            icon="location-outline"
            label="Address"
            value={formatAddress(user?.address)}
            onPress={() => navigation.navigate('EditAddress')}
          />
          <ProfileMenuItem
            icon="call-outline"
            label="Phone Number"
            value={user?.phone || 'Add phone number'}
            onPress={() => navigation.navigate('EditPhone')}
          />
        </ProfileSection>

        {/* Account & Security */}
        <ProfileSection title="Account & Security" icon="shield-checkmark-outline">
          <ProfileMenuItem
            icon="key-outline"
            label="Change Password"
            value="Update your password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <ProfileMenuItem
            icon="finger-print-outline"
            label="Biometric Login"
            value="Face ID / Touch ID"
            onPress={() => navigation.navigate('BiometricSettings')}
          />
          <ProfileMenuItem
            icon="shield-outline"
            label="Two-Factor Authentication"
            value="Add extra security"
            onPress={() => navigation.navigate('TwoFactorAuth')}
          />
          <ProfileMenuItem
            icon="card-outline"
            label="Payment Methods"
            value="Manage cards and payment"
            onPress={() => navigation.navigate('PaymentMethods')}
          />
        </ProfileSection>

        {/* App Preferences */}
        <ProfileSection title="Preferences" icon="settings-outline">
          <ToggleMenuItem
            icon="notifications-outline"
            label="Push Notifications"
            description="Receive booking updates and offers"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <ToggleMenuItem
            icon="moon-outline"
            label="Dark Mode"
            description="Switch to dark theme"
            value={darkModeEnabled}
            onToggle={setDarkModeEnabled}
          />
          <ProfileMenuItem
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => navigation.navigate('LanguageSettings')}
          />
          <ProfileMenuItem
            icon="location-outline"
            label="Location Services"
            value="Always allow"
            onPress={() => navigation.navigate('LocationSettings')}
          />
        </ProfileSection>

        {/* Support & Legal */}
        <ProfileSection title="Support & Legal" icon="help-circle-outline">
          <ProfileMenuItem
            icon="headset-outline"
            label="Help & Support"
            value="Get help and contact us"
            onPress={() => navigation.navigate('HelpSupport')}
          />
          <ProfileMenuItem
            icon="chatbox-outline"
            label="Feedback"
            value="Share your thoughts"
            onPress={() => navigation.navigate('Feedback')}
          />
          <ProfileMenuItem
            icon="star-outline"
            label="Rate the App"
            value="Leave a review"
            onPress={() => navigation.navigate('RateApp')}
          />
          <ProfileMenuItem
            icon="document-text-outline"
            label="Terms & Conditions"
            value=""
            onPress={() => navigation.navigate('Terms')}
          />
          <ProfileMenuItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            value=""
            onPress={() => navigation.navigate('Privacy')}
          />
        </ProfileSection>

        {/* Account Actions */}
        <ProfileSection title="Account" icon="person-circle-outline">
          <ProfileMenuItem
            icon="download-outline"
            label="Export Data"
            value="Download your information"
            onPress={() => navigation.navigate('ExportData')}
          />
          <ProfileMenuItem
            icon="trash-outline"
            label="Delete Account"
            value="Permanently remove account"
            onPress={() => navigation.navigate('DeleteAccount')}
          />
        </ProfileSection>

        {/* Logout Button */}
        <Animated.View
          style={[
            styles.logoutSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <CustomButton
            title="Sign Out"
            variant="danger"
            icon={<Ionicons name="log-out-outline" size={20} color={COLORS.white} />}
            onPress={() => setShowLogoutModal(true)}
            style={styles.logoutButton}
          />
        </Animated.View>

        {/* App Version */}
        <Animated.View
          style={[
            styles.versionContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={styles.versionText}>Homeaze v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with ❤️ for your home</Text>
        </Animated.View>
      </ScrollView>

      <LogoutModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  scrollContainer: {
    flex: 1,
  },

  // Header
  headerContainer: {
    overflow: 'hidden',
  },

  headerGradient: {
    paddingBottom: SPACING.xl,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },

  avatarContainer: {
    position: 'relative',
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  profileInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },

  userName: {
    fontSize: FONTS.h2,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },

  userEmail: {
    fontSize: FONTS.body3,
    color: COLORS.white + 'CC',
    marginBottom: SPACING.sm,
  },

  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },

  membershipText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weightSemiBold,
    marginLeft: SPACING.xs,
  },

  editProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.md,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },

  statLabel: {
    fontSize: FONTS.caption,
    color: COLORS.white + 'CC',
    fontWeight: FONTS.weightMedium,
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.md,
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.medium,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  sectionTitle: {
    fontSize: FONTS.body1,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },

  sectionContent: {
    paddingBottom: SPACING.sm,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },

  menuItemContent: {
    flex: 1,
  },

  menuItemLabel: {
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  menuItemValue: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
  },

  menuItemDescription: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: FONTS.caption * FONTS.lineHeightNormal,
  },

  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  // Toggle Items
  toggleMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },

  logoutButton: {
    marginTop: SPACING.lg,
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },

  versionText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },

  versionSubtext: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Logout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },

  logoutModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 350,
  },

  logoutModalHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  logoutModalTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  logoutModalSubtitle: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.body3 * FONTS.lineHeightNormal,
  },

  logoutModalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  cancelButton: {
    flex: 1,
  },

  signOutButton: {
    flex: 1,
  },
});

export default EnhancedProfileScreen;
