import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import AuthAPI from '../services/authApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  requestPasswordReset, 
  requestPasswordResetSuccess, 
  requestPasswordResetFailure, 
  resetPasswordResetState 
} from '../store/slices/authSlice';

const ForgotPasswordScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  // Get state from Redux
  const { forgotPassword } = useAppSelector((state) => state.auth);
  const { loading, success, error } = forgotPassword;

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    dispatch(requestPasswordReset());
    
    try {
      // Call API service
      await AuthAPI.requestPasswordReset(email.trim());
      
      // Dispatch success action
      dispatch(requestPasswordResetSuccess());
      
      // Show success state
      setIsEmailSent(true);
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Dispatch failure action
      dispatch(requestPasswordResetFailure(error.message));
      
      // Show error alert
      Alert.alert(
        'Error',
        error.message || 'Failed to send password reset email. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    handleResetPassword();
  };

  // Success state when email is sent
  if (isEmailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            </View>

            {/* Success Content */}
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✉️</Text>
              </View>
              
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent a password reset link to{'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
              
              <Text style={styles.instructionText}>
                Check your email and follow the instructions to reset your password.
              </Text>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Back to Login"
                  onPress={handleBackToLogin}
                  fullWidth
                  size="large"
                  style={styles.primaryButton}
                />

                <CustomButton
                  title="Resend Email"
                  onPress={handleResendEmail}
                  variant="outline"
                  fullWidth
                  size="large"
                  style={styles.resendButton}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Main forgot password form
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>🔒</Text>
              </View>
              <Text style={styles.titleText}>Forgot Password?</Text>
              <Text style={styles.subtitleText}>
                Don't worry! Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <CustomInput
              label="Email Address"
              placeholder="Enter your email address"
              value={email}
              onChangeText={handleEmailChange}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
            />

            <CustomButton
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={loading}
              fullWidth
              size="large"
              style={styles.resetButton}
            />
          </View>

          {/* Back to Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.loginLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  backButtonText: {
    fontSize: FONTS.xl,
    color: COLORS.textPrimary,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  logoText: {
    fontSize: 30,
  },
  titleText: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  inputIcon: {
    fontSize: FONTS.md,
  },
  resetButton: {
    marginTop: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  loginText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: FONTS.md,
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
  },
  
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.success + '20',
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: FONTS.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  emailText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
  },
  instructionText: {
    fontSize: FONTS.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryButton: {
    marginBottom: SPACING.sm,
  },
  resendButton: {
    marginTop: SPACING.sm,
  },
});

export default ForgotPasswordScreen;
