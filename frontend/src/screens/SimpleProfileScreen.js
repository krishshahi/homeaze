import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../store/slices/userSlice';
import { fetchUserBookings } from '../store/slices/bookingSlice';
import { logoutUser } from '../store/slices/authSlice';

const SimpleProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const { profile, loading: profileLoading, error: profileError } = useSelector((state) => state.user);
  const { user: authUser, isAuthenticated } = useSelector((state) => state.auth);
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.booking);

  // Combine profile data from both auth and user slices
  const user = {
    name: profile.name || authUser?.name || authUser?.fullName || 'Guest User',
    email: profile.email || authUser?.email || 'user@example.com',
    phone: profile.phone || authUser?.phone || authUser?.phoneNumber || '+1 (555) 123-4567',
    address: profile.address
      ? `${profile.address.street || ''}, ${profile.address.city || ''}, ${profile.address.state || ''} ${profile.address.zipCode || ''}`.trim().replace(/^,|,$/, '')
      : authUser?.address || '123 Main St, City, State 12345',
    joinDate: profile.createdAt 
      ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      : authUser?.createdAt 
      ? new Date(authUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      : 'January 2024',
    avatar: profile.avatar || authUser?.avatar,
  };

  // Calculate booking statistics
  const bookingStats = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return {
        totalBookings: 0,
        completedBookings: 0,
        averageRating: 0,
      };
    }

    const completed = bookings.filter(booking => booking.status === 'completed');
    const totalRatings = completed.reduce((sum, booking) => {
      return sum + (booking.rating || booking.customerRating || 0);
    }, 0);
    const averageRating = completed.length > 0 ? (totalRatings / completed.length) : 0;

    return {
      totalBookings: bookings.length,
      completedBookings: completed.length,
      averageRating: averageRating > 0 ? averageRating.toFixed(1) : '0',
    };
  }, [bookings]);

  // Initialize data on component mount
  useEffect(() => {
    console.log('🔍 Initializing Profile Screen data...');
    if (isAuthenticated) {
      dispatch(fetchProfile());
      dispatch(fetchUserBookings());
    }
  }, [dispatch, isAuthenticated]);

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      badge: 3,
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: 'shield-outline',
      onPress: () => navigation.navigate('SecuritySettings'),
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
      onPress: () => Alert.alert('About', 'HomeAze v1.0.0\nYour trusted home service app'),
    },
  ];

  const handleLogout = () => {
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
              await dispatch(logoutUser()).unwrap();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
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
                {user.avatar ? (
                  <Image 
                    source={{ uri: user.avatar }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userJoinDate}>Member since {user.joinDate}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {profileLoading || bookingsLoading ? (
            <View style={styles.loadingStats}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading stats...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bookingStats.totalBookings}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bookingStats.completedBookings}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bookingStats.averageRating}</Text>
                <Text style={styles.statLabel}>Average Rating</Text>
              </View>
            </>
          )}
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{user.address}</Text>
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
          <Text style={styles.versionText}>HomeAze v1.0.0</Text>
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
  
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  
  loadingStats: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
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

export default SimpleProfileScreen;
