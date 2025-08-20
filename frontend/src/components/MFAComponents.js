import * as Clipboard from 'expo-clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  Share
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

/**
 * MFA Setup Component
 */
export const MFASetupScreen = ({ visible, onClose, onSetupComplete }) => {
  const [step, setStep] = useState(1); // 1: Setup, 2: QR Code, 3: Verify, 4: Backup Codes
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  
  const handleSetupMFA = async () => {
    try {
      setLoading(true);
      // API call to initiate MFA setup
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQrCodeUrl(data.data.qrCodeUrl);
        setBackupCodes(data.data.backupCodes);
        setSecret(data.data.secret);
        setStep(2);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/auth/mfa/verify-setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await SecureStore.getItemAsync('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: verificationCode
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(4);
      } else {
        Alert.alert('Error', data.message);
        setVerificationCode('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify MFA setup');
    } finally {
      setLoading(false);
    }
  };
  
  const copySecret = async () => {
    await Clipboard.setStringAsync(secret);
    Alert.alert('Copied', 'Secret key copied to clipboard');
  };
  
  const copyBackupCodes = async () => {
    const codesText = backupCodes.join('\n');
    await Clipboard.setStringAsync(codesText);
    Alert.alert('Copied', 'Backup codes copied to clipboard');
  };
  
  const shareBackupCodes = async () => {
    const codesText = `Homeaze MFA Backup Codes:\n\n${backupCodes.join('\n')}\n\nKeep these codes safe and secure!`;
    await Share.share({
      message: codesText,
      title: 'Homeaze MFA Backup Codes'
    });
  };
  
  const finishSetup = () => {
    onSetupComplete && onSetupComplete();
    onClose();
    setStep(1);
    setVerificationCode('');
  };
  
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>🔐 Enable Two-Factor Authentication</Text>
      <Text style={styles.description}>
        Add an extra layer of security to your account. You'll need an authenticator app like Google Authenticator or Authy.
      </Text>
      
      <View style={styles.benefitsList}>
        <Text style={styles.benefitItem}>✅ Protect against unauthorized access</Text>
        <Text style={styles.benefitItem}>✅ Secure your sensitive data</Text>
        <Text style={styles.benefitItem}>✅ Peace of mind</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleSetupMFA}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Setup MFA</Text>
        )}
      </TouchableOpacity>
    </View>
  );
  
  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>📱 Scan QR Code</Text>
      <Text style={styles.description}>
        Use your authenticator app to scan this QR code:
      </Text>
      
      <View style={styles.qrContainer}>
        <QRCode
          value={qrCodeUrl}
          size={200}
          backgroundColor={COLORS.white}
          color={COLORS.black}
        />
      </View>
      
      <Text style={styles.orText}>Or enter this code manually:</Text>
      
      <View style={styles.secretContainer}>
        <Text style={styles.secretText}>{secret}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copySecret}>
          <Text style={styles.copyButtonText}>Copy</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => setStep(3)}
      >
        <Text style={styles.buttonText}>I've Added It</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>🔢 Verify Setup</Text>
      <Text style={styles.description}>
        Enter the 6-digit code from your authenticator app:
      </Text>
      
      <TextInput
        style={styles.codeInput}
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="000000"
        placeholderTextColor={COLORS.textSecondary}
        keyboardType="numeric"
        maxLength={6}
        autoFocus
      />
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleVerifySetup}
        disabled={loading || verificationCode.length !== 6}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Verify & Enable</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.secondaryButtonText}>Back to QR Code</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderStep4 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>✅ MFA Enabled Successfully!</Text>
      <Text style={styles.description}>
        Save these backup codes in a secure location. Each code can only be used once.
      </Text>
      
      <View style={styles.backupCodesContainer}>
        {backupCodes.map((code, index) => (
          <Text key={index} style={styles.backupCode}>{code}</Text>
        ))}
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { flex: 1, marginRight: 8 }]}
          onPress={copyBackupCodes}
        >
          <Text style={styles.secondaryButtonText}>Copy Codes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { flex: 1, marginLeft: 8 }]}
          onPress={shareBackupCodes}
        >
          <Text style={styles.secondaryButtonText}>Share Codes</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={finishSetup}
      >
        <Text style={styles.buttonText}>Finish Setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.stepIndicator}>
            {[1, 2, 3, 4].map((stepNum) => (
              <View
                key={stepNum}
                style={[
                  styles.stepDot,
                  stepNum <= step && styles.activeStepDot
                ]}
              />
            ))}
          </View>
        </View>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </SafeAreaView>
    </Modal>
  );
};

/**
 * MFA Verification Component (for login)
 */
export const MFAVerificationModal = ({ visible, onClose, onVerify, tempToken }) => {
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
  useEffect(() => {
    checkBiometricAvailability();
  }, []);
  
  const checkBiometricAvailability = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(hasHardware && isEnrolled);
  };
  
  const handleVerify = async () => {
    const verificationData = useBackupCode
      ? { backupCode: backupCode.trim() }
      : { mfaToken: code };
    
    try {
      setLoading(true);
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tempToken,
          ...verificationData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onVerify(data.data);
        resetForm();
        onClose();
      } else {
        Alert.alert('Error', data.message);
        resetForm();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify MFA code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometrics',
        fallbackLabel: 'Use passcode',
      });
      
      if (result.success) {
        // In a real app, you might have a stored MFA code or use biometrics as a second factor
        Alert.alert('Biometric Authentication', 'Please still enter your MFA code');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };
  
  const resetForm = () => {
    setCode('');
    setBackupCode('');
    setUseBackupCode(false);
  };
  
  const isValid = useBackupCode 
    ? backupCode.trim().length > 0
    : code.length === 6;
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>🔐 Two-Factor Authentication</Text>
          <Text style={styles.modalDescription}>
            Enter your authentication code to continue
          </Text>
          
          {!useBackupCode ? (
            <>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
              
              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricAuth}
                >
                  <Text style={styles.biometricButtonText}>👆 Use Biometric</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <TextInput
              style={styles.codeInput}
              value={backupCode}
              onChangeText={setBackupCode}
              placeholder="Enter backup code"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="characters"
              autoFocus
            />
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, !isValid && styles.disabledButton]}
            onPress={handleVerify}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setUseBackupCode(!useBackupCode)}
          >
            <Text style={styles.switchModeText}>
              {useBackupCode ? 'Use authenticator code' : 'Use backup code'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              resetForm();
              onClose();
            }}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Password Strength Indicator
 */
export const PasswordStrengthIndicator = ({ password, onStrengthChange }) => {
  const [strength, setStrength] = useState({ score: 0, level: 'Very Weak', errors: [] });
  
  useEffect(() => {
    if (password) {
      checkPasswordStrength(password);
    } else {
      setStrength({ score: 0, level: 'Very Weak', errors: [] });
    }
  }, [password]);
  
  const checkPasswordStrength = async (pwd) => {
    try {
      const response = await fetch('/api/auth/validate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: pwd })
      });
      
      const data = await response.json();
      if (data.success) {
        setStrength(data.data.strength);
        onStrengthChange && onStrengthChange(data.data);
      }
    } catch (error) {
      console.error('Password strength check failed:', error);
    }
  };
  
  const getStrengthColor = () => {
    switch (strength.level) {
      case 'Very Strong': return COLORS.success;
      case 'Strong': return COLORS.primary;
      case 'Good': return COLORS.warning;
      case 'Fair': return COLORS.orange;
      default: return COLORS.error;
    }
  };
  
  if (!password) return null;
  
  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBar}>
        <View
          style={[
            styles.strengthFill,
            {
              width: `${strength.percentage || 0}%`,
              backgroundColor: getStrengthColor()
            }
          ]}
        />
      </View>
      
      <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
        {strength.level} ({strength.percentage || 0}%)
      </Text>
      
      {strength.errors && strength.errors.length > 0 && (
        <View style={styles.errorsContainer}>
          {strength.errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.text,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: COLORS.primary,
  },
  stepContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  benefitsList: {
    marginBottom: SPACING.xl,
  },
  benefitItem: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  orText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  secretText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: COLORS.text,
  },
  copyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  copyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  codeInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.lg,
    fontSize: 24,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 4,
  },
  backupCodesContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  backupCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
  },
  button: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  biometricButton: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  biometricButtonText: {
    color: COLORS.text,
    fontSize: 16,
  },
  switchModeButton: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  switchModeText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  
  // Password strength styles
  strengthContainer: {
    marginTop: SPACING.sm,
  },
  strengthBar: {
    height: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  errorsContainer: {
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 2,
  },
});

export default {
  MFASetupScreen,
  MFAVerificationModal,
  PasswordStrengthIndicator
};
