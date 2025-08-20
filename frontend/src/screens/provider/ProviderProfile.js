import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ProviderProfile = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [instantBookingEnabled, setInstantBookingEnabled] = useState(false);

  const mockData = {
    profile: {
      name: "John's Cleaning Service",
      rating: 4.8,
      reviews: 245,
      completedJobs: 1240,
      memberSince: 'January 2023',
      verificationStatus: {
        identity: true,
        background: true,
        insurance: true,
        professional: true,
      },
    },
    stats: {
      responseRate: '98%',
      completionRate: '96%',
      onTimeRate: '95%',
      satisfaction: '4.9',
    },
  };

  const menuItems = [
    {
      id: 'business',
      title: 'Business Information',
      icon: 'briefcase',
      screen: 'BusinessInfo',
    },
    {
      id: 'services',
      title: 'Services & Pricing',
      icon: 'tag',
      screen: 'ServicesManagement',
    },
    {
      id: 'availability',
      title: 'Availability',
      icon: 'calendar',
      screen: 'ProviderAvailability',
    },
    {
      id: 'documents',
      title: 'Documents & Licenses',
      icon: 'file-text',
      screen: 'Documents',
    },
    {
      id: 'bank',
      title: 'Bank & Payments',
      icon: 'credit-card',
      screen: 'PaymentSettings',
    },
    {
      id: 'reviews',
      title: 'Reviews & Ratings',
      icon: 'star',
      screen: 'Reviews',
      badge: '2 new',
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: 'bell',
      screen: 'NotificationSettings',
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle',
      screen: 'Support',
    },
  ];

  const renderVerificationBadge = (title, isVerified) => (
    <View
      style={[
        styles.verificationBadge,
        isVerified ? styles.verifiedBadge : styles.unverifiedBadge,
      ]}
    >
      <Icon
        name={isVerified ? 'check-circle' : 'alert-circle'}
        size={16}
        color={isVerified ? '#4CAF50' : '#FFC107'}
      />
      <Text
        style={[
          styles.verificationText,
          isVerified ? styles.verifiedText : styles.unverifiedText,
        ]}
      >
        {title}
      </Text>
    </View>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.menuItemLeft}>
        <Icon name={item.icon} size={24} color="#666" />
        <Text style={styles.menuItemTitle}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.badge && <Text style={styles.badge}>{item.badge}</Text>}
        <Icon name="chevron-right" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Icon name="edit-2" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image
              source={require('../../assets/images/profile-placeholder.jpg')}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{mockData.profile.name}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFC107" />
                <Text style={styles.rating}>{mockData.profile.rating}</Text>
                <Text style={styles.reviews}>
                  ({mockData.profile.reviews} reviews)
                </Text>
              </View>
              <Text style={styles.memberSince}>
                Member since {mockData.profile.memberSince}
              </Text>
            </View>
          </View>

          <View style={styles.verificationSection}>
            <Text style={styles.sectionTitle}>Verifications</Text>
            <View style={styles.verificationBadges}>
              {renderVerificationBadge(
                'ID Verified',
                mockData.profile.verificationStatus.identity
              )}
              {renderVerificationBadge(
                'Background Check',
                mockData.profile.verificationStatus.background
              )}
              {renderVerificationBadge(
                'Insurance',
                mockData.profile.verificationStatus.insurance
              )}
              {renderVerificationBadge(
                'Professional License',
                mockData.profile.verificationStatus.professional
              )}
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {mockData.stats.responseRate}
                </Text>
                <Text style={styles.statLabel}>Response Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {mockData.stats.completionRate}
                </Text>
                <Text style={styles.statLabel}>Completion Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mockData.stats.onTimeRate}</Text>
                <Text style={styles.statLabel}>On-time Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {mockData.stats.satisfaction}
                </Text>
                <Text style={styles.statLabel}>Satisfaction</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickSettings}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="bell" size={20} color="#666" />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#CCCCCC', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="zap" size={20} color="#666" />
                <Text style={styles.settingText}>Instant Booking</Text>
              </View>
              <Switch
                value={instantBookingEnabled}
                onValueChange={setInstantBookingEnabled}
                trackColor={{ false: '#CCCCCC', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            // Handle logout
          }}
        >
          <Icon name="log-out" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviews: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
  },
  verificationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  verificationBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
  },
  unverifiedBadge: {
    backgroundColor: '#FFF8E1',
  },
  verificationText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  verifiedText: {
    color: '#4CAF50',
  },
  unverifiedText: {
    color: '#FFC107',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statItem: {
    width: '50%',
    padding: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  quickSettings: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#2196F3',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 24,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default ProviderProfile;
