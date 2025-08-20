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
import { useAuth } from '../contexts/AuthContext';

// Components

const EnhancedSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'customer', // 'customer' or 'provider'
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName) errors.push('First name is required');
    if (!formData.lastName) errors.push('Last name is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.phone) errors.push('Phone number is required');
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
        password: formData.password,
        userType: formData.userType,
      };

      const result = await signup(userData);
      if (!result.success) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
                <CustomInput
                  label="First Name"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  style={styles.rowInput}
                />
                <CustomInput
                  label="Last Name"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                  style={styles.rowInput}
                />
              </View>

              <CustomInput
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <CustomInput
                label="Phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
              />

              <CustomInput
                label="Password"
                placeholder="Create password"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                showPasswordToggle
              />

              <CustomInput
                label="Confirm Password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                showPasswordToggle
              />

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
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  subtitle: {
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  card: {
    padding: SPACING.lg,
  },
  form: {
    gap: SPACING.md,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
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
    gap: SPACING.md,
  },
  rowInput: {
    flex: 1,
  },
  signupButton: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
});

export default EnhancedSignupScreen;
