import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProviderProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const bookings = useSelector((state) => state.booking?.bookings || []);
  const notifications = useSelector((state) => state.app?.notifications || []);
  
  const user = auth.user || {
    name: 'Provider Name',
    email: 'provider@example.com',
    phone: '+1 (555) 000-0000',
    address: 'Business Address',
    createdAt: new Date().toISOString(),
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (typeof address === 'string') {
      return address;
    }
    if (typeof address === 'object' && address) {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.zipCode
      ].filter(part => part && part.trim());
      return parts.length > 0 ? parts.join(', ') : 'Business Address';
    }
    return 'Business Address';
  };

  // Helper function to safely get string values
  const safeString = (value, fallback = '') => {
    if (typeof value === 'string') {
      return value;
    }
    if (value !== null && value !== undefined) {
      return String(value);
    }
    return fallback;
  };

  // Calculate dynamic stats
  const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
  const totalBookings = bookings.length;
  const averageRating = user.averageRating || 4.8;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  const joinDate = user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => Alert.alert('Edit Profile', 'Feature coming soon!'),
    },
    {
      id: 'services-pricing',
      title: 'Services & Pricing',
      icon: 'pricetags-outline',
      onPress: () => Alert.alert('Services & Pricing', 'Feature coming soon!'),
    },
    {
      id: 'availability',
      title: 'Availability',
      icon: 'calendar-outline',
      onPress: () => Alert.alert('Availability', 'Feature coming soon!'),
    },
    {
      id: 'payment-settings',
      title: 'Payment Settings',
      icon: 'card-outline',
      onPress: () => Alert.alert('Payment Settings', 'Feature coming soon!'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      onPress: () => Alert.alert('Notifications', 'Feature coming soon!'),
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: 'shield-outline',
      onPress: () => Alert.alert('Security Settings', 'Feature coming soon!'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help & Support', 'Feature coming soon!'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('About', 'HomeAze v1.0.0\nProvider App'),
    },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
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
              
            } catch (error) {
              console.error('❌ Provider Profile logout error:', error);
              dispatch(logout());
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                  {safeString(user.name, 'P').charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{safeString(user.name, 'Provider Name')}</Text>
                <Text style={styles.userEmail}>{safeString(user.email, 'provider@example.com')}</Text>
                <Text style={styles.userJoinDate}>Member since {joinDate}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalBookings || 45}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedBookings || 42}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{safeString(user.phone, '+1 (555) 000-0000')}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{formatAddress(user.address)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon} size={22} color="#3B82F6" />
                  </View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>
                
                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>HomeAze Provider v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  headerSafeArea: {
    backgroundColor: '#3B82F6',
  },
  
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  
  headerContent: {
    paddingHorizontal: 20,
  },
  
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    fontSize: 32,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  userEmail: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  
  userJoinDate: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  
  content: {
    flex: 1,
  },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  
  statValue: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  infoTextContainer: {
    flex: 1,
  },
  
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  menuItemTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ProviderProfileScreen;
