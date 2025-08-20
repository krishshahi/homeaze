import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const PaymentMethodsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);

  // Mock data - replace with actual API calls
  const mockPaymentMethods = [
    {
      id: '1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      brand: 'mastercard',
      last4: '8888',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
    {
      id: '3',
      type: 'paypal',
      email: 'user@example.com',
      isDefault: false,
    },
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      // API call to load payment methods
      // const response = await getPaymentMethods();
      setPaymentMethods(mockPaymentMethods);
      setDefaultPaymentMethod(mockPaymentMethods.find(method => method.isDefault));
    } catch (error) {
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose a payment method to add',
      [
        { text: 'Credit/Debit Card', onPress: () => addCard() },
        { text: 'PayPal', onPress: () => addPayPal() },
        { text: 'Apple Pay', onPress: () => addApplePay() },
        { text: 'Google Pay', onPress: () => addGooglePay() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const addCard = () => {
    Alert.alert('Info', 'Card addition flow would be implemented here');
  };

  const addPayPal = () => {
    Alert.alert('Info', 'PayPal integration would be implemented here');
  };

  const addApplePay = () => {
    Alert.alert('Info', 'Apple Pay setup would be implemented here');
  };

  const addGooglePay = () => {
    Alert.alert('Info', 'Google Pay setup would be implemented here');
  };

  const setDefaultMethod = (methodId) => {
    Alert.alert(
      'Set Default',
      'Set this payment method as default?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              // API call to set default payment method
              // await setDefaultPaymentMethod(methodId);
              
              const updatedMethods = paymentMethods.map(method => ({
                ...method,
                isDefault: method.id === methodId,
              }));
              setPaymentMethods(updatedMethods);
              setDefaultPaymentMethod(updatedMethods.find(method => method.id === methodId));
            } catch (error) {
              Alert.alert('Error', 'Failed to set default payment method');
            }
          },
        },
      ]
    );
  };

  const removePaymentMethod = (methodId, isDefault) => {
    if (isDefault && paymentMethods.length > 1) {
      Alert.alert(
        'Cannot Remove',
        'Please set another payment method as default before removing this one.'
      );
      return;
    }

    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // API call to remove payment method
              // await removePaymentMethod(methodId);
              
              const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
              setPaymentMethods(updatedMethods);
              
              if (isDefault && updatedMethods.length > 0) {
                setDefaultPaymentMethod(updatedMethods[0]);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method');
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (brand) => {
    const icons = {
      visa: 'card',
      mastercard: 'card',
      american_express: 'card',
      discover: 'card',
    };
    return icons[brand] || 'card';
  };

  const getPaymentMethodIcon = (method) => {
    if (method.type === 'card') {
      return getCardIcon(method.brand);
    } else if (method.type === 'paypal') {
      return 'logo-paypal';
    } else if (method.type === 'apple_pay') {
      return 'logo-apple';
    } else if (method.type === 'google_pay') {
      return 'logo-google';
    }
    return 'card';
  };

  const formatPaymentMethod = (method) => {
    if (method.type === 'card') {
      return {
        title: `${method.brand.toUpperCase()} ****${method.last4}`,
        subtitle: `Expires ${method.expiryMonth}/${method.expiryYear}`,
      };
    } else if (method.type === 'paypal') {
      return {
        title: 'PayPal',
        subtitle: method.email,
      };
    }
    return {
      title: method.type,
      subtitle: '',
    };
  };

  const PaymentMethodCard = ({ method }) => {
    const formattedMethod = formatPaymentMethod(method);
    
    return (
      <View style={[styles.paymentCard, method.isDefault && styles.defaultCard]}>
        <View style={styles.paymentCardContent}>
          <View style={styles.paymentCardLeft}>
            <View style={[styles.paymentIcon, method.isDefault && styles.defaultIcon]}>
              <Ionicons 
                name={getPaymentMethodIcon(method)} 
                size={24} 
                color={method.isDefault ? COLORS.white : COLORS.primary}
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>{formattedMethod.title}</Text>
              <Text style={styles.paymentSubtitle}>{formattedMethod.subtitle}</Text>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.paymentActions}>
            {!method.isDefault && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setDefaultMethod(method.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => removePaymentMethod(method.id, method.isDefault)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Payment Method */}
        <View style={styles.section}>
          <CustomButton
            title="Add Payment Method"
            onPress={addPaymentMethod}
            icon={<Ionicons name="add-circle-outline" size={20} color={COLORS.white} />}
            style={styles.addButton}
          />
        </View>

        {/* Payment Methods List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
              <Text style={styles.emptyStateText}>
                Add a payment method to start booking services
              </Text>
            </View>
          ) : (
            <FlatList
              data={paymentMethods}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <PaymentMethodCard method={item} />}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Security Info */}
        <View style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
            <Text style={styles.securityTitle}>Secure & Protected</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment information is encrypted and securely stored. We never share your 
            financial details with service providers.
          </Text>
        </View>

        {/* Billing Address */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuItemText}>Billing Address</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && <LoadingSpinner />}
    </SafeAreaView>
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
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 10,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  addButton: {
    marginBottom: 0,
  },
  paymentCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  defaultCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  defaultIcon: {
    backgroundColor: COLORS.primary,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  defaultBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  securitySection: {
    backgroundColor: COLORS.successLight,
    marginBottom: 10,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default PaymentMethodsScreen;
