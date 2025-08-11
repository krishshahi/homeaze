import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';
import { useAppDispatch, useAuth, useProfile } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { fetchProfile } from '../store/slices/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProviderProfileScreen = () => {
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
  const [availabilityEnabled, setAvailabilityEnabled] = useState(true);
  const [profileStats, setProfileStats] = useState({
    completedServices: 0,
    totalEarnings: 0,
    averageRating: 0,
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
        
        // Load provider statistics
        setProfileStats({
          completedServices: user?.completedServices || 24,
          totalEarnings: user?.totalEarnings || 3250,
          averageRating: user?.averageRating || 4.8,
          memberSince: user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2024',
        });
      }
    } catch (error) {
      console.error('❌ Error loading provider profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process from Provider Profile...');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('userData');
      console.log('📱 AsyncStorage cleared from Provider Profile');
      
      // Clear Redux auth state
      dispatch(logout());
      console.log('🔄 Redux state cleared from Provider Profile');
      
      setShowLogoutModal(false);
      
    } catch (error) {
      console.error('❌ Provider Profile logout error:', error);
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
            <Text style={styles.userName}>{user?.name || 'Provider Name'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'provider@example.com'}</Text>
            <View style={styles.membershipBadge}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.membershipText}>Provider since {profileStats.memberSince}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Provider Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileStats.completedServices}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${profileStats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profileStats.averageRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
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

  const renderProviderHeader = () => (
    <View style={styles.providerHeader}>
      <View style={styles.providerImageContainer}>
        <View style={styles.providerAvatar}>
          <Text style={styles.providerAvatarText}>
            {provider.name.charAt(0)}
          </Text>
        </View>
        
        {/* Verification Badge */}
        <View style={styles.verificationBadge}>
          <Text style={styles.verificationIcon}>✓</Text>
        </View>
      </View>
      
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{provider.name}</Text>
        <Text style={styles.providerTitle}>Professional Service Provider</Text>
        
        <View style={styles.providerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{provider.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statValue}>{provider.reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>3+</Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <CustomButton
            title="Message"
            onPress={handleMessageProvider}
            style={styles.messageButton}
            variant="outline"
          />
          
          <CustomButton
            title="Call"
            onPress={handleCallProvider}
            style={styles.callButton}
          />
        </View>
      </View>
    </View>
  );

  const renderVerificationSection = () => (
    <View style={styles.verificationSection}>
      <Text style={styles.sectionTitle}>Verification & Trust</Text>
      
      <View style={styles.verificationItems}>
        <View style={styles.verificationItem}>
          <Text style={styles.verificationIcon}>✅</Text>
          <View style={styles.verificationDetails}>
            <Text style={styles.verificationTitle}>Identity Verified</Text>
            <Text style={styles.verificationDescription}>Government ID confirmed</Text>
          </View>
        </View>
        
        <View style={styles.verificationItem}>
          <Text style={styles.verificationIcon}>✅</Text>
          <View style={styles.verificationDetails}>
            <Text style={styles.verificationTitle}>Background Check</Text>
            <Text style={styles.verificationDescription}>Passed security screening</Text>
          </View>
        </View>
        
        <View style={styles.verificationItem}>
          <Text style={styles.verificationIcon}>✅</Text>
          <View style={styles.verificationDetails}>
            <Text style={styles.verificationTitle}>Licensed & Insured</Text>
            <Text style={styles.verificationDescription}>Professional credentials verified</Text>
          </View>
        </View>
        
        <View style={styles.verificationItem}>
          <Text style={styles.verificationIcon}>✅</Text>
          <View style={styles.verificationDetails}>
            <Text style={styles.verificationTitle}>Homeaze Pro</Text>
            <Text style={styles.verificationDescription}>Top-rated professional</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.aboutSection}>
      <Text style={styles.sectionTitle}>About {provider.name}</Text>
      <Text style={styles.aboutText}>
        With over 3 years of experience in professional home services, I pride myself on 
        delivering exceptional quality work. I'm fully licensed, insured, and committed to 
        customer satisfaction. My goal is to make your home maintenance needs stress-free 
        and affordable.
      </Text>
      
      <View style={styles.specialtiesContainer}>
        <Text style={styles.specialtiesTitle}>Specialties:</Text>
        <View style={styles.specialtyTags}>
          <View style={styles.specialtyTag}>
            <Text style={styles.specialtyTagText}>Same-day Service</Text>
          </View>
          <View style={styles.specialtyTag}>
            <Text style={styles.specialtyTagText}>Emergency Repairs</Text>
          </View>
          <View style={styles.specialtyTag}>
            <Text style={styles.specialtyTagText}>Quality Guarantee</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            {providerServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceRow}
                onPress={() => handleServicePress(service)}
              >
                <View style={styles.serviceRowIcon}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                </View>
                <View style={styles.serviceRowInfo}>
                  <Text style={styles.serviceRowTitle}>{service.title}</Text>
                  <Text style={styles.serviceRowDescription}>{service.description}</Text>
                  <View style={styles.serviceRowBottom}>
                    <View style={styles.serviceRowRating}>
                      <Text style={styles.ratingIcon}>⭐</Text>
                      <Text style={styles.ratingText}>{service.rating}</Text>
                    </View>
                    <Text style={styles.serviceRowPrice}>From ${service.startingPrice}</Text>
                  </View>
                </View>
                <Text style={styles.chevronIcon}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            
            {/* Rating Summary */}
            <View style={styles.ratingSummary}>
              <View style={styles.overallRating}>
                <Text style={styles.overallRatingNumber}>{provider.rating}</Text>
                <View style={styles.overallRatingStars}>
                  {[...Array(5)].map((_, i) => (
                    <Text key={i} style={styles.ratingStar}>
                      {i < Math.floor(provider.rating) ? '⭐' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text style={styles.totalReviews}>({provider.reviewCount} reviews)</Text>
              </View>
              
              <View style={styles.ratingBreakdown}>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <View key={stars} style={styles.ratingRow}>
                    <Text style={styles.ratingRowStars}>{stars}★</Text>
                    <View style={styles.ratingBar}>
                      <View 
                        style={[
                          styles.ratingBarFill, 
                          { width: `${Math.random() * 80 + 20}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.ratingRowCount}>{Math.floor(Math.random() * 50)}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Individual Reviews */}
            {mockProviderReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerAvatarText}>
                      {review.customerName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.customerName}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Text key={i} style={styles.reviewStar}>
                          {i < review.rating ? '⭐' : '☆'}
                        </Text>
                      ))}
                    </View>
                    <Text style={styles.reviewService}>• {review.service}</Text>
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ProfileHeader />

        {/* Provider Information */}
        <ProfileSection title="Provider Information" icon="business-outline">
          <ProfileMenuItem
            icon="card-outline"
            label="Business Details"
            value="View and edit your business information"
            onPress={() => navigation.navigate('BusinessProfile')}
          />
          <ProfileMenuItem
            icon="location-outline"
            label="Service Area"
            value={formatAddress(user?.serviceArea)}
            onPress={() => navigation.navigate('ServiceArea')}
          />
          <ProfileMenuItem
            icon="call-outline"
            label="Business Phone"
            value={user?.businessPhone || 'Add business phone'}
            onPress={() => navigation.navigate('EditBusinessPhone')}
          />
          <ProfileMenuItem
            icon="globe-outline"
            label="Website"
            value={user?.website || 'Add website'}
            onPress={() => navigation.navigate('EditWebsite')}
          />
        </ProfileSection>

        {/* Services & Pricing */}
        <ProfileSection title="Services & Pricing" icon="construct-outline">
          <ProfileMenuItem
            icon="hammer-outline"
            label="My Services"
            value="Manage your service offerings"
            onPress={() => navigation.navigate('ManageServices')}
          />
          <ProfileMenuItem
            icon="pricetag-outline"
            label="Pricing"
            value="Update service rates"
            onPress={() => navigation.navigate('ServicePricing')}
          />
          <ProfileMenuItem
            icon="time-outline"
            label="Availability"
            value="Set your working hours"
            onPress={() => navigation.navigate('Availability')}
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
            label="Payment & Banking"
            value="Manage payout methods"
            onPress={() => navigation.navigate('PayoutMethods')}
          />
        </ProfileSection>

        {/* Business Tools */}
        <ProfileSection title="Business Tools" icon="analytics-outline">
          <ProfileMenuItem
            icon="stats-chart-outline"
            label="Analytics"
            value="View your performance metrics"
            onPress={() => navigation.navigate('ProviderAnalytics')}
          />
          <ProfileMenuItem
            icon="receipt-outline"
            label="Invoicing"
            value="Manage invoices and receipts"
            onPress={() => navigation.navigate('Invoicing')}
          />
          <ProfileMenuItem
            icon="calendar-outline"
            label="Calendar"
            value="Manage your schedule"
            onPress={() => navigation.navigate('ProviderCalendar')}
          />
          <ProfileMenuItem
            icon="chatbubbles-outline"
            label="Customer Reviews"
            value="View and respond to reviews"
            onPress={() => navigation.navigate('ReviewManagement')}
          />
        </ProfileSection>

        {/* App Preferences */}
        <ProfileSection title="Preferences" icon="settings-outline">
          <ToggleMenuItem
            icon="notifications-outline"
            label="Push Notifications"
            description="Receive booking requests and updates"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <ToggleMenuItem
            icon="apps-outline"
            label="Available for Work"
            description="Show your availability to customers"
            value={availabilityEnabled}
            onToggle={setAvailabilityEnabled}
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
        </ProfileSection>

        {/* Support & Legal */}
        <ProfileSection title="Support & Legal" icon="help-circle-outline">
          <ProfileMenuItem
            icon="headset-outline"
            label="Help & Support"
            value="Get help and contact us"
            onPress={() => navigation.navigate('ProviderSupport')}
          />
          <ProfileMenuItem
            icon="chatbox-outline"
            label="Feedback"
            value="Share your thoughts"
            onPress={() => navigation.navigate('Feedback')}
          />
          <ProfileMenuItem
            icon="school-outline"
            label="Training & Resources"
            value="Improve your skills"
            onPress={() => navigation.navigate('ProviderTraining')}
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
            icon="pause-outline"
            label="Deactivate Account"
            value="Temporarily disable your account"
            onPress={() => navigation.navigate('DeactivateAccount')}
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
          <Text style={styles.versionText}>Homeaze Provider v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built for professional service providers</Text>
        </Animated.View>
      </ScrollView>

      <LogoutModal />
    </SafeAreaView>
  );
};

// Mock provider reviews data
const mockProviderReviews = [
  {
    id: '1',
    customerName: 'Jennifer Smith',
    rating: 5,
    date: '3 days ago',
    service: 'House Cleaning',
    comment: 'Amazing work! Very thorough and professional. My house has never looked better.',
  },
  {
    id: '2',
    customerName: 'David Wilson',
    rating: 5,
    date: '1 week ago',
    service: 'Plumbing',
    comment: 'Fixed my leak quickly and at a fair price. Highly recommend!',
  },
  {
    id: '3',
    customerName: 'Maria Garcia',
    rating: 4,
    date: '2 weeks ago',
    service: 'Electrical',
    comment: 'Good work overall. Arrived on time and completed the job efficiently.',
  },
  {
    id: '4',
    customerName: 'Robert Johnson',
    rating: 5,
    date: '3 weeks ago',
    service: 'House Cleaning',
    comment: 'Excellent service! Very reliable and trustworthy. Will book again.',
  },
];

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.xl,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
  },
  favoriteButton: {
    padding: SPACING.sm,
  },
  favoriteIcon: {
    fontSize: FONTS.lg,
    color: COLORS.textMuted,
  },
  content: {
    flex: 1,
  },
  
  // Provider Header
  providerHeader: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  providerImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  providerAvatar: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  providerAvatarText: {
    fontSize: 40,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verificationIcon: {
    fontSize: FONTS.sm,
    color: COLORS.white,
    fontWeight: FONTS.weightBold,
  },
  providerInfo: {
    alignItems: 'center',
    width: '100%',
  },
  providerName: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  providerTitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: FONTS.lg,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  messageButton: {
    flex: 1,
  },
  callButton: {
    flex: 1,
  },
  
  // Verification Section
  verificationSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  verificationItems: {
    gap: SPACING.md,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationIcon: {
    fontSize: FONTS.lg,
    marginRight: SPACING.sm,
  },
  verificationDetails: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  verificationDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  
  // About Section
  aboutSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  aboutText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  specialtiesContainer: {
    marginTop: SPACING.sm,
  },
  specialtiesTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  specialtyTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  specialtyTagText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
  
  // Tabs
  tabsContainer: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
  },
  
  // Tab Content
  tabContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  
  // Services Tab
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  serviceRowIcon: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceRowInfo: {
    flex: 1,
  },
  serviceRowTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  serviceRowDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  serviceRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceRowRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: FONTS.sm,
    marginRight: SPACING.xs,
  },
  ratingText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  serviceRowPrice: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  chevronIcon: {
    fontSize: FONTS.xl,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
  
  // Reviews Tab
  ratingSummary: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  overallRating: {
    flex: 1,
    alignItems: 'center',
  },
  overallRatingNumber: {
    fontSize: 48,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  overallRatingStars: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  ratingStar: {
    fontSize: FONTS.md,
    color: COLORS.warning,
    marginRight: 2,
  },
  totalReviews: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  ratingBreakdown: {
    flex: 1,
    paddingLeft: SPACING.lg,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingRowStars: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    width: 30,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.xs,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
  },
  ratingRowCount: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    width: 25,
    textAlign: 'right',
  },
  
  // Review Cards
  reviewCard: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  reviewerAvatarText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  reviewStar: {
    fontSize: FONTS.sm,
    color: COLORS.warning,
    marginRight: 2,
  },
  reviewService: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  reviewDate: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  reviewText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  // Bottom Bar
  bottomBar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  bookButton: {
    width: '100%',
  },
  
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProviderProfileScreen;
