import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import theme from '../constants/modernTheme';
import ModernButton from '../components/modern/ModernButton';
import ModernCard from '../components/modern/ModernCard';
import { LoadingOverlay } from '../components/modern/LoadingStates';
import { LongPressMenu } from '../components/modern/MicroInteractions';
import { logout } from '../store/slices/authSlice';

const ModernProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const { bookings } = useSelector(state => state.booking);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const menuItems = [
    { icon: 'person-circle', title: 'Edit Profile', color: theme.colors.primary[500] },
    { icon: 'settings', title: 'Settings', color: theme.colors.text.secondary },
    { icon: 'help-circle', title: 'Help', color: theme.colors.info[500] },
    { icon: 'log-out', title: 'Logout', color: theme.colors.error[500] },
  ];

  const handleMenuAction = (item) => {
    switch (item.title) {
      case 'Edit Profile':
        navigation.navigate('EditProfile');
        break;
      case 'Settings':
        navigation.navigate('SecuritySettings');
        break;
      case 'Help':
        // Navigate to help/support screen
        break;
      case 'Logout':
        handleLogout();
        break;
    }
  };

  const statsData = [
    {
      label: 'Total Bookings',
      value: bookings?.length || 0,
      icon: 'calendar',
      color: theme.colors.primary[500],
    },
    {
      label: 'Completed',
      value: bookings?.filter(b => b.status === 'completed').length || 0,
      icon: 'checkmark-done',
      color: theme.colors.success[500],
    },
    {
      label: 'Pending',
      value: bookings?.filter(b => b.status === 'pending').length || 0,
      icon: 'time',
      color: theme.colors.warning[500],
    },
    {
      label: 'Saved',
      value: 0, // You can add saved services count from store
      icon: 'heart',
      color: theme.colors.error[500],
    },
  ];

  const quickActions = [
    {
      title: 'Edit Profile',
      icon: 'person-circle-outline',
      onPress: () => navigation.navigate('EditProfile'),
      color: theme.colors.primary[500],
    },
    {
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => navigation.navigate('PaymentMethods'),
      color: theme.colors.success[500],
    },
    {
      title: 'Security',
      icon: 'shield-checkmark-outline',
      onPress: () => navigation.navigate('SecuritySettings'),
      color: theme.colors.warning[500],
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
      color: theme.colors.info[500],
    },
  ];

  const otherOptions = [
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => {},
      showArrow: true,
    },
    {
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => {},
      showArrow: true,
    },
    {
      title: 'Terms of Service',
      icon: 'document-text-outline',
      onPress: () => {},
      showArrow: true,
    },
    {
      title: 'Privacy Policy',
      icon: 'lock-closed-outline',
      onPress: () => {},
      showArrow: true,
    },
  ];

  const renderStatsCard = () => (
    <ModernCard style={styles.statsCard} variant="elevated">
      <Text style={styles.statsTitle}>Your Activity</Text>
      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ModernCard>
  );

  const renderQuickActions = () => (
    <ModernCard style={styles.quickActionsCard} variant="elevated">
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickActionItem}
            onPress={action.onPress}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.quickActionLabel}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ModernCard>
  );

  const renderOtherOptions = () => (
    <ModernCard style={styles.optionsCard} variant="elevated">
      <Text style={styles.sectionTitle}>Other</Text>
      {otherOptions.map((option, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.optionItem}
          onPress={option.onPress}
        >
          <View style={styles.optionLeft}>
            <Ionicons 
              name={option.icon} 
              size={20} 
              color={theme.colors.text.secondary} 
            />
            <Text style={styles.optionTitle}>{option.title}</Text>
          </View>
          {option.showArrow && (
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={theme.colors.text.tertiary} 
            />
          )}
        </TouchableOpacity>
      ))}
    </ModernCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <LongPressMenu
          menuItems={menuItems}
          onMenuItemPress={handleMenuAction}
        >
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </LongPressMenu>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <ModernCard style={styles.profileCard} variant="elevated">
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.defaultAvatar]}>
                  <Ionicons name="person" size={40} color={theme.colors.text.secondary} />
                </View>
              )}
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="camera" size={16} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              
              <View style={styles.userBadge}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.success[500]} />
                <Text style={styles.userBadgeText}>Verified Customer</Text>
              </View>
            </View>
          </View>
          
          <ModernButton
            title="Edit Profile"
            variant="outline"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editProfileButton}
          />
        </ModernCard>

        {/* Stats */}
        {renderStatsCard()}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Other Options */}
        {renderOtherOptions()}

        {/* Logout Button */}
        <ModernButton
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          icon="log-out"
          style={styles.logoutButton}
          withHaptic={true}
        />

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>HomeAze v1.0.0</Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} message="Updating profile..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },

  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
  },

  menuButton: {
    padding: theme.spacing[2],
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  },

  profileCard: {
    marginVertical: theme.spacing[4],
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },

  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing[4],
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface.secondary,
  },

  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  editAvatarButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface.primary,
  },

  profileInfo: {
    flex: 1,
  },

  userName: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    marginBottom: theme.spacing[1],
  },

  userEmail: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },

  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },

  userBadgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.success[700],
    marginLeft: theme.spacing[1],
    fontWeight: theme.typography.weight.medium,
  },

  editProfileButton: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },

  // Stats Card
  statsCard: {
    marginBottom: theme.spacing[4],
  },

  statsTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },

  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },

  statValue: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing[1],
  },

  statLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsCard: {
    marginBottom: theme.spacing[4],
  },

  sectionTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing[2],
    paddingBottom: theme.spacing[4],
  },

  quickActionItem: {
    width: '50%',
    alignItems: 'center',
    padding: theme.spacing[2],
  },

  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },

  quickActionLabel: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: theme.typography.weight.medium,
  },

  // Options Card
  optionsCard: {
    marginBottom: theme.spacing[4],
  },

  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.secondary,
  },

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionTitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing[3],
  },

  logoutButton: {
    marginBottom: theme.spacing[4],
  },

  versionInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
  },

  versionText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },
});

export default ModernProfileScreen;
