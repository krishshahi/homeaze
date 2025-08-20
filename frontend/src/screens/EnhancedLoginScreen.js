import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
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

import Card from '../components/Card';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Text from '../components/Text';
import { COLORS, SPACING, LAYOUT, FONTS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

// Components

WebBrowser.maybeCompleteAuthSession();

const EnhancedLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, socialLogin } = useAuth();

  // Google Auth setup
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  // Facebook Auth setup
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await googlePromptAsync();
      if (result.type === 'success') {
        const { authentication } = result;
        await socialLogin('google', authentication.accessToken);
      }
    } catch (error) {
      Alert.alert('Error', 'Google login failed. Please try again.');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await fbPromptAsync();
      if (result.type === 'success') {
        const { authentication } = result;
        await socialLogin('facebook', authentication.accessToken);
      }
    } catch (error) {
      Alert.alert('Error', 'Facebook login failed. Please try again.');
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
              Welcome Back
            </Text>
            <Text variant="body1" color={COLORS.white} style={styles.subtitle}>
              Login to access your account
            </Text>
          </View>

          <Card variant="default" style={styles.card}>
            <View style={styles.form}>
              <CustomInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <CustomInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                showPasswordToggle
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPassword}
              >
                <Text variant="body2" color={COLORS.primary} weight="medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <CustomButton
                title="Login"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text variant="body2" color={COLORS.textSecondary} style={styles.orText}>
                  OR
                </Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialButtons}>
                <CustomButton
                  title="Google"
                  variant="outline"
                  onPress={handleGoogleLogin}
                  icon="google"
                  style={styles.socialButton}
                />
                <CustomButton
                  title="Facebook"
                  variant="outline"
                  onPress={handleFacebookLogin}
                  icon="facebook"
                  style={styles.socialButton}
                />
              </View>
            </View>
          </Card>

          <View style={styles.footer}>
            <Text variant="body2" color={COLORS.white}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text variant="body2" color={COLORS.white} weight="bold" underline>
                Sign up
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.sm,
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    marginHorizontal: SPACING.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
});

export default EnhancedLoginScreen;
