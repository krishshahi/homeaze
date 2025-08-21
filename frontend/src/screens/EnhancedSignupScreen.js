import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

import Badge from '../components/Badge';
import Card from '../components/Card';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Text from '../components/Text';
import { COLORS, SPACING, LAYOUT, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';

// Components

const EnhancedSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    userType: 'customer', // 'customer' or 'provider'
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName) errors.push('First name is required');
    if (!formData.lastName) errors.push('Last name is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.phone) errors.push('Phone number is required');
    if (!formData.address) errors.push('Address is required');
    if (!formData.password) errors.push('Password is required');
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    return errors;
  };

  const handleSignup = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Error', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        userType: formData.userType,
      };

      const result = await dispatch(registerUser(userData)).unwrap();
      
      console.log('Signup successful:', result);
      Alert.alert(
        'Account Created',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="h1" color={COLORS.white} weight="bold">
              Create Account
            </Text>
            <Text variant="body1" color={COLORS.white} style={styles.subtitle}>
              Sign up to get started
            </Text>
          </View>

          <Card variant="default" style={styles.card}>
<View style={styles.form}>
              {/* User Type Selection */}
              <View style={styles.userTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'customer' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => updateFormData('userType', 'customer')}
                >
                  <Text
                    variant="body2"
                    weight="medium"
                    color={formData.userType === 'customer' ? COLORS.white : COLORS.textPrimary}
                  >
                    Customer
                  </Text>
                  {formData.userType === 'customer' && (
                    <Badge variant="dot" status="success" style={styles.userTypeBadge} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === 'provider' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => updateFormData('userType', 'provider')}
                >
                  <Text
                    variant="body2"
                    weight="medium"
                    color={formData.userType === 'provider' ? COLORS.white : COLORS.textPrimary}
                  >
                    Service Provider
                  </Text>
                  {formData.userType === 'provider' && (
                    <Badge variant="dot" status="success" style={styles.userTypeBadge} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.nameInputContainer}>
                  <CustomInput
                    label="First Name"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                  />
                </View>
                <View style={styles.nameInputContainer}>
                  <CustomInput
                    label="Last Name"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                  />
                </View>
              </View>

<View style={styles.inputGroup}>
                <CustomInput
                  label="Email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

<View style={styles.inputGroup}>
                <CustomInput
                  label="Phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>

<View style={styles.inputGroup}>
                <CustomInput
                  label="Address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChangeText={(value) => updateFormData('address', value)}
                  multiline
                  numberOfLines={2}
                />
              </View>

<View style={styles.inputGroup}>
                <CustomInput
                  label="Password"
                  placeholder="Create password"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry
                  showPasswordToggle
                />
              </View>

<View style={styles.inputGroup}>
                <CustomInput
                  label="Confirm Password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry
                  showPasswordToggle
                />
              </View>

              <CustomButton
                title="Sign Up"
                onPress={handleSignup}
                loading={loading}
                style={styles.signupButton}
              />
            </View>
          </Card>

          <View style={styles.footer}>
            <Text variant="body2" color={COLORS.white}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text variant="body2" color={COLORS.white} weight="bold" underline>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  subtitle: {
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  card: {
    padding: SPACING.lg,
  },
  form: {
    marginVertical: SPACING.md,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.backgroundSecondary,
    ...SHADOWS.subtle,
  },
  userTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  userTypeBadge: {
    marginLeft: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  nameInputContainer: {
    flex: 0.48, // Each container takes up 48% of width, leaving 4% for gap
    minWidth: 120, // Ensure minimum width for readability
  },
  rowInput: {
    flex: 0.48, // Each input takes up 48% of width, leaving 4% for gap
    minWidth: 120, // Ensure minimum width for readability
  },
  signupButton: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
});

export default EnhancedSignupScreen;
