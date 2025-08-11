import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/CustomButton';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    // Optional: Auto-navigate after delay
    // setTimeout(() => {
    //   navigation.replace('Auth');
    // }, 3000);
  }, []);

  const navigateToAuth = () => {
    navigation.navigate('Login');
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>🏠</Text>
          </View>
          <Text style={styles.brandName}>Homeaze</Text>
          <Text style={styles.tagline}>Your Ultimate Home Solution</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeTitle}>Welcome to Homeaze</Text>
        <Text style={styles.welcomeSubtitle}>
          Connect with trusted home service professionals in your area. 
          From cleaning to repairs, we've got you covered.
        </Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <FeatureItem 
            icon="🔍" 
            text="Find trusted professionals" 
          />
          <FeatureItem 
            icon="⚡" 
            text="Quick & easy booking" 
          />
          <FeatureItem 
            icon="🔒" 
            text="Secure payments" 
          />
          <FeatureItem 
            icon="⭐" 
            text="Quality guaranteed" 
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <CustomButton
          title="Get Started"
          onPress={navigateToAuth}
          variant="secondary"
          size="large"
          fullWidth
          style={styles.primaryButton}
        />
        
        <CustomButton
          title="I already have an account"
          onPress={navigateToLogin}
          variant="ghost"
          size="medium"
          fullWidth
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </LinearGradient>
  );
};

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  headerContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadowDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  logoText: {
    fontSize: 40,
  },
  brandName: {
    fontSize: FONTS.xxxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONTS.md,
    color: COLORS.white,
    opacity: 0.9,
    fontWeight: FONTS.weightMedium,
  },
  contentContainer: {
    flex: 0.45,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  welcomeSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    fontSize: FONTS.lg,
    marginRight: SPACING.md,
  },
  featureText: {
    fontSize: FONTS.md,
    color: COLORS.white,
    fontWeight: FONTS.weightMedium,
  },
  actionContainer: {
    flex: 0.2,
    justifyContent: 'center',
    paddingBottom: SPACING.lg,
  },
  primaryButton: {
    marginBottom: SPACING.md,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.white,
  },
  footerContainer: {
    flex: 0.05,
    justifyContent: 'flex-end',
    paddingBottom: SPACING.lg,
  },
  footerText: {
    fontSize: FONTS.xs,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
  },
});

export default WelcomeScreen;
