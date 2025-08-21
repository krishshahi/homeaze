import React, { useState, useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearError } from '../store/slices/authSlice';

const SignUpScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(state => state.auth);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Address Information
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Preferences
    userType: 'customer', // customer or provider
    serviceCategories: [],
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    
    // Terms
    agreeToTerms: false,
    agreeToPrivacy: false,
  });
  
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    }
    
    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }
    
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep3()) return;
    dispatch(clearError());

    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
        address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`
      };

      const result = await dispatch(registerUser(userData)).unwrap();
      
      Alert.alert('Welcome to Homeaze!', 'Your account has been created successfully.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error || 'Failed to create account. Please try again.');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, currentStep >= 1 && styles.activeStep]}>
          <Text style={[styles.progressStepText, currentStep >= 1 && styles.activeStepText]}>1</Text>
        </View>
        <View style={[styles.progressLine, currentStep >= 2 && styles.activeLine]} />
        <View style={[styles.progressStep, currentStep >= 2 && styles.activeStep]}>
          <Text style={[styles.progressStepText, currentStep >= 2 && styles.activeStepText]}>2</Text>
        </View>
        <View style={[styles.progressLine, currentStep >= 3 && styles.activeLine]} />
        <View style={[styles.progressStep, currentStep >= 3 && styles.activeStep]}>
          <Text style={[styles.progressStepText, currentStep >= 3 && styles.activeStepText]}>3</Text>
        </View>
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>Personal</Text>
        <Text style={styles.progressLabel}>Address</Text>
        <Text style={styles.progressLabel}>Finish</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Let's get to know you better</Text>

      <View style={styles.rowContainer}>
        <CustomInput
          label="First Name"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
          error={errors.firstName}
          style={styles.halfInput}
        />
        <CustomInput
          label="Last Name"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
          error={errors.lastName}
          style={styles.halfInput}
        />
      </View>

      <CustomInput
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Text style={styles.inputIcon}>📧</Text>}
      />

      <CustomInput
        label="Phone Number"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChangeText={(value) => handleInputChange('phone', value)}
        error={errors.phone}
        keyboardType="phone-pad"
        leftIcon={<Text style={styles.inputIcon}>📱</Text>}
      />

      <CustomInput
        label="Password"
        placeholder="Create a strong password"
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        error={errors.password}
        secureTextEntry={true}
        showPasswordToggle={true}
        leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
      />

      <CustomInput
        label="Confirm Password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChangeText={(value) => handleInputChange('confirmPassword', value)}
        error={errors.confirmPassword}
        secureTextEntry={true}
        showPasswordToggle={true}
        leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Address Information</Text>
      <Text style={styles.stepSubtitle}>Where can we find you?</Text>

      <CustomInput
        label="Street Address"
        placeholder="Enter your street address"
        value={formData.street}
        onChangeText={(value) => handleInputChange('street', value)}
        error={errors.street}
        leftIcon={<Text style={styles.inputIcon}>🏠</Text>}
      />

      <View style={styles.rowContainer}>
        <CustomInput
          label="City"
          placeholder="City"
          value={formData.city}
          onChangeText={(value) => handleInputChange('city', value)}
          error={errors.city}
          style={styles.halfInput}
        />
        <CustomInput
          label="State"
          placeholder="State"
          value={formData.state}
          onChangeText={(value) => handleInputChange('state', value)}
          error={errors.state}
          style={styles.halfInput}
        />
      </View>

      <CustomInput
        label="ZIP Code"
        placeholder="Enter ZIP code"
        value={formData.zipCode}
        onChangeText={(value) => handleInputChange('zipCode', value)}
        error={errors.zipCode}
        keyboardType="numeric"
        leftIcon={<Text style={styles.inputIcon}>📮</Text>}
      />

      <View style={styles.userTypeContainer}>
        <Text style={styles.inputLabel}>I want to:</Text>
        <View style={styles.userTypeButtons}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              formData.userType === 'customer' && styles.selectedUserType,
            ]}
            onPress={() => handleInputChange('userType', 'customer')}
          >
            <Text style={styles.userTypeIcon}>👤</Text>
            <Text style={[
              styles.userTypeText,
              formData.userType === 'customer' && styles.selectedUserTypeText,
            ]}>
              Find Services
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              formData.userType === 'provider' && styles.selectedUserType,
            ]}
            onPress={() => handleInputChange('userType', 'provider')}
          >
            <Text style={styles.userTypeIcon}>🔧</Text>
            <Text style={[
              styles.userTypeText,
              formData.userType === 'provider' && styles.selectedUserTypeText,
            ]}>
              Provide Services
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Almost Done!</Text>
      <Text style={styles.stepSubtitle}>Just a few more details</Text>

      <View style={styles.notificationSection}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('notifications', {
            ...formData.notifications,
            push: !formData.notifications.push
          })}
        >
          <View style={[styles.checkbox, formData.notifications.push && styles.checkedBox]}>
            {formData.notifications.push && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Push notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('notifications', {
            ...formData.notifications,
            email: !formData.notifications.email
          })}
        >
          <View style={[styles.checkbox, formData.notifications.email && styles.checkedBox]}>
            {formData.notifications.email && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Email notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.termsSection}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('agreeToTerms', !formData.agreeToTerms)}
        >
          <View style={[styles.checkbox, formData.agreeToTerms && styles.checkedBox]}>
            {formData.agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the <Text style={styles.linkText}>Terms of Service</Text>
          </Text>
        </TouchableOpacity>
        {errors.agreeToTerms && <Text style={styles.errorText}>{errors.agreeToTerms}</Text>}

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('agreeToPrivacy', !formData.agreeToPrivacy)}
        >
          <View style={[styles.checkbox, formData.agreeToPrivacy && styles.checkedBox]}>
            {formData.agreeToPrivacy && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {errors.agreeToPrivacy && <Text style={styles.errorText}>{errors.agreeToPrivacy}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => currentStep > 1 ? handlePrevious() : navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🏠</Text>
            </View>
            <Text style={styles.welcomeText}>Join Homeaze</Text>
            <Text style={styles.subtitleText}>Create your account</Text>
          </View>
        </View>

        {renderProgressBar()}

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {currentStep < 3 ? (
            <CustomButton
              title="Continue"
              onPress={handleNext}
              fullWidth
              size="large"
            />
          ) : (
            <CustomButton
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              fullWidth
              size="large"
            />
          )}
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
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
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  logoText: {
    fontSize: 25,
  },
  welcomeText: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitleText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  progressStepText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.textMuted,
  },
  activeStepText: {
    color: COLORS.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  activeLine: {
    backgroundColor: COLORS.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  inputIcon: {
    fontSize: FONTS.md,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  userTypeContainer: {
    marginTop: SPACING.lg,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  selectedUserType: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  userTypeIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  userTypeText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  selectedUserTypeText: {
    color: COLORS.primary,
  },
  notificationSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xs,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
  },
  checkboxLabel: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
  termsSection: {
    marginTop: SPACING.lg,
  },
  errorText: {
    fontSize: FONTS.sm,
    color: COLORS.error,
    marginLeft: SPACING.xl,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
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
});

export default SignUpScreen;
