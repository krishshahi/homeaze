import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import theme from '../constants/modernTheme';
import ModernInput from '../components/modern/ModernInput';
import ModernButton from '../components/modern/ModernButton';
import ModernCard from '../components/modern/ModernCard';
import { useAppDispatch, useAuth } from '../store/hooks';
import { login } from '../store/slices/authSlice';

const ModernLoginScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.duration.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      if (result.success) {
        // Navigation will be handled by App.js based on auth state
        console.log('Login successful:', result);
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert(
      'Social Login',
      `${provider} login integration will be implemented here.`,
      [{ text: 'OK' }]
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={theme.colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View 
          style={[
            styles.logoContainer,
            { transform: [{ scale: logoScale }] }
          ]}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>🏠</Text>
          </View>
          <Text style={styles.appName}>HomeAze</Text>
          <Text style={styles.tagline}>Your trusted home service partner</Text>
        </Animated.View>

        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>
    </Animated.View>
  );

  const renderLoginForm = () => (
    <Animated.View 
      style={[
        styles.formSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <ModernCard
        variant="elevated"
        shadow="lg"
        padding="xl"
        style={styles.formCard}
      >
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>
            Sign in to your account to continue
          </Text>
        </View>

        <View style={styles.formContent}>
          <ModernInput
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={formErrors.email}
            variant="outline"
          />

          <ModernInput
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            leftIcon="lock-closed-outline"
            rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
            rightIconOnPress={() => setShowPassword(!showPassword)}
            error={formErrors.password}
            variant="outline"
          />

          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>
              Forgot your password?
            </Text>
          </TouchableOpacity>

          <ModernButton
            title="Sign In"
            variant="gradient"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleLogin}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <ModernButton
              variant="outline"
              size="md"
              onPress={() => handleSocialLogin('Google')}
              style={styles.socialButton}
            >
              <Ionicons name="logo-google" size={20} color={theme.colors.text.secondary} />
            </ModernButton>

            <ModernButton
              variant="outline"
              size="md"
              onPress={() => handleSocialLogin('Facebook')}
              style={styles.socialButton}
            >
              <Ionicons name="logo-facebook" size={20} color={theme.colors.info[500]} />
            </ModernButton>

            <ModernButton
              variant="outline"
              size="md"
              onPress={() => handleSocialLogin('Apple')}
              style={styles.socialButton}
            >
              <Ionicons name="logo-apple" size={20} color={theme.colors.text.primary} />
            </ModernButton>
          </View>
        </View>
      </ModernCard>
    </Animated.View>
  );

  const renderFooter = () => (
    <Animated.View 
      style={[
        styles.footer,
        { opacity: fadeAnim }
      ]}
    >
      <Text style={styles.footerText}>
        Don't have an account?{' '}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </Text>

      <Text style={styles.termsText}>
        By continuing, you agree to our{' '}
        <Text style={styles.termsLink}>Terms of Service</Text>
        {' '}and{' '}
        <Text style={styles.termsLink}>Privacy Policy</Text>
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary[600]}
        translucent={Platform.OS === 'android'}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderHeader()}
          {renderLoginForm()}
          {renderFooter()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  // Header Styles
  header: {
    position: 'relative',
    overflow: 'hidden',
  },

  headerGradient: {
    paddingTop: theme.spacing[8],
    paddingBottom: theme.spacing[12],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  logoContainer: {
    alignItems: 'center',
    zIndex: 2,
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
    ...theme.shadows.lg,
  },

  logoText: {
    fontSize: 40,
  },

  appName: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weight.extraBold,
    marginBottom: theme.spacing[2],
    letterSpacing: -0.5,
  },

  tagline: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },

  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Form Section
  formSection: {
    flex: 1,
    paddingHorizontal: theme.spacing[5],
    marginTop: -theme.spacing[8],
    paddingBottom: theme.spacing[8],
  },

  formCard: {
    // Card styling handled by ModernCard
  },

  formHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },

  formTitle: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing[2],
  },

  formSubtitle: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.size.sm,
  },

  formContent: {
    // Content styling
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing[2],
    marginBottom: theme.spacing[6],
    padding: theme.spacing[2],
  },

  forgotPasswordText: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.medium,
  },

  loginButton: {
    marginBottom: theme.spacing[6],
    ...theme.shadows.md,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing[6],
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.primary,
  },

  dividerText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.surface.primary,
    fontWeight: theme.typography.weight.medium,
  },

  // Social Buttons
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },

  socialButton: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.xl,
    padding: 0,
    ...theme.shadows.sm,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8],
    paddingBottom: theme.spacing[6],
  },

  footerText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },

  signUpLink: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.semiBold,
  },

  termsText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.size.xs,
  },

  termsLink: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.medium,
  },
});

export default ModernLoginScreen;
