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
import { fetchProfile } from '../../store/slices/userSlice';
import { fetchUserBookings } from '../../store/slices/bookingSlice';
import { logoutUser } from '../../store/slices/authSlice';

const ProfileScreen = ({ navigation }) => {
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
      onPress: () => navigation.navigate('EditProfile', { user }),
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

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuItemIcon}>
                    <Ionicons name={item.icon} size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                
                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  
  userEmail: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
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
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  loadingStats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  menuItemText: {
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  logoutContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default ProfileScreen;
