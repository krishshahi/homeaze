import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch, useAuth } from '../store/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserTypeSelectorScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('customer');

  const handleContinue = async () => {
    try {
      console.log('🔄 Switching to user type:', selectedType);
      
      // Store selected user type
      await AsyncStorage.setItem('userType', selectedType);
      
      // Navigate to appropriate dashboard
      if (selectedType === 'provider') {
        navigation.replace('ProviderNavigator');
      } else {
        navigation.replace('MainNavigator');
      }
      
    } catch (error) {
      console.error('❌ Error switching user type:', error);
    }
  };

  const handleSkipSelection = () => {
    // Default to customer mode
    setSelectedType('customer');
    handleContinue();
  };

  const renderUserTypeCard = (type, title, description, icon, benefits) => (
    <TouchableOpacity
      style={[
        styles.userTypeCard,
        selectedType === type && styles.selectedCard
      ]}
      onPress={() => setSelectedType(type)}
    >
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer,
          selectedType === type && styles.selectedIconContainer
        ]}>
          <Text style={[
            styles.cardIcon,
            selectedType === type && styles.selectedCardIcon
          ]}>
            {icon}
          </Text>
        </View>
        
        <View style={styles.cardHeaderText}>
          <Text style={[
            styles.cardTitle,
            selectedType === type && styles.selectedCardTitle
          ]}>
            {title}
          </Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        
        <View style={[
          styles.radioButton,
          selectedType === type && styles.selectedRadioButton
        ]}>
          {selectedType === type && <View style={styles.radioButtonInner} />}
        </View>
      </View>
      
      <View style={styles.benefitsList}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Choose Your Role</Text>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipSelection}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          Welcome, {user?.name || 'User'}! 👋
        </Text>
        <Text style={styles.welcomeSubtitle}>
          How would you like to use Homeaze today?
        </Text>
      </View>

      {/* User Type Cards */}
      <View style={styles.cardsContainer}>
        {renderUserTypeCard(
          'customer',
          'I need services',
          'Book professional home services',
          '🏠',
          [
            'Browse and book home services',
            'Connect with verified providers',
            'Track your bookings & payments',
            'Leave reviews and ratings'
          ]
        )}
        
        {renderUserTypeCard(
          'provider',
          'I offer services',
          'Provide professional home services',
          '⚡',
          [
            'Create your professional profile',
            'Manage bookings & availability',
            'Track earnings & analytics',
            'Build customer relationships'
          ]
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          💡 You can switch between roles anytime in your profile settings.
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.bottomSection}>
        <CustomButton
          title={`Continue as ${selectedType === 'customer' ? 'Customer' : 'Service Provider'}`}
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
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
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  skipButton: {
    padding: SPACING.sm,
  },
  skipButtonText: {
    fontSize: FONTS.md,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
  
  welcomeSection: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  welcomeSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  cardsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  
  userTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.primary + '20',
  },
  cardIcon: {
    fontSize: FONTS.xxl,
  },
  selectedCardIcon: {
    // Could add different styling for selected state
  },
  
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  selectedCardTitle: {
    color: COLORS.primary,
  },
  cardDescription: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  
  benefitsList: {
    gap: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: FONTS.md,
    color: COLORS.success,
    marginRight: SPACING.sm,
    fontWeight: FONTS.weightBold,
  },
  benefitText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
  
  infoSection: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  infoText: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  bottomSection: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  continueButton: {
    // Custom button styles can be added here
  },
});

export default UserTypeSelectorScreen;
