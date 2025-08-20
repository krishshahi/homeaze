import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const PaymentScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  // Get booking details from route params if coming from booking flow
  const { bookingId, amount, serviceName } = route.params || {};
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    saveCard: false,
  });

  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const [savedCards, setSavedCards] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Visa, Mastercard, American Express',
      enabled: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🟦',
      description: 'Pay with your PayPal account',
      enabled: true,
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: '📱',
      description: 'Touch ID or Face ID',
      enabled: true,
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: '🌈',
      description: 'Pay with Google',
      enabled: true,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct bank account transfer',
      enabled: false, // Disabled for now
    },
  ];

  useEffect(() => {
    loadSavedCards();
    loadPaymentHistory();
  }, []);

  const loadSavedCards = async () => {
    try {
      // In real app, would fetch from API
      setSavedCards([
        {
          id: '1',
          type: 'visa',
          last4: '1234',
          expiryMonth: 12,
          expiryYear: 2025,
          cardholderName: 'John Doe',
          isDefault: true,
        },
        {
          id: '2',
          type: 'mastercard',
          last4: '5678',
          expiryMonth: 8,
          expiryYear: 2026,
          cardholderName: 'John Doe',
          isDefault: false,
        },
      ]);
    } catch (error) {
      console.error('❌ Error loading saved cards:', error);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      // In real app, would fetch from API
      setPaymentHistory([
        {
          id: '1',
          amount: 75.00,
          currency: 'USD',
          status: 'completed',
          serviceName: 'House Cleaning',
          providerName: 'Sarah Johnson',
          date: '2024-01-15T10:30:00Z',
          paymentMethod: 'Visa ending in 1234',
        },
        {
          id: '2',
          amount: 120.00,
          currency: 'USD',
          status: 'completed',
          serviceName: 'Plumbing Repair',
          providerName: 'Mike Chen',
          date: '2024-01-10T14:45:00Z',
          paymentMethod: 'PayPal',
        },
        {
          id: '3',
          amount: 45.00,
          currency: 'USD',
          status: 'pending',
          serviceName: 'Garden Maintenance',
          providerName: 'Emily Davis',
          date: '2024-01-12T09:15:00Z',
          paymentMethod: 'Apple Pay',
        },
      ]);
    } catch (error) {
      console.error('❌ Error loading payment history:', error);
    }
  };

  const formatCardNumber = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted.substring(0, 19); // Max length: 16 digits + 3 spaces
  };

  const validateCardForm = () => {
    const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = cardForm;
    
    if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }
    
    if (!expiryMonth || !expiryYear) {
      Alert.alert('Error', 'Please enter card expiry date');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }
    
    if (!cardholderName.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return false;
    }
    
    return true;
  };

  const processPayment = async () => {
    try {
      setLoading(true);
      
      // Validate payment method
      if (selectedPaymentMethod === 'card' && savedCards.length === 0) {
        if (!validateCardForm()) {
          setLoading(false);
          return;
        }
      }
      
      // Simulate payment processing
      console.log('💳 Processing payment:', {
        method: selectedPaymentMethod,
        amount,
        bookingId,
      });
      
      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Payment Successful!',
          `Your payment of $${amount} has been processed successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (bookingId) {
                  navigation.navigate('BookingConfirmation', { bookingId });
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      setLoading(false);
      Alert.alert(
        'Payment Failed',
        'There was an issue processing your payment. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const addNewCard = async () => {
    if (!validateCardForm()) return;
    
    try {
      const newCard = {
        id: Date.now().toString(),
        type: getCardType(cardForm.cardNumber),
        last4: cardForm.cardNumber.replace(/\s/g, '').slice(-4),
        expiryMonth: parseInt(cardForm.expiryMonth, 10),
        expiryYear: parseInt(cardForm.expiryYear, 10),
        cardholderName: cardForm.cardholderName,
        isDefault: savedCards.length === 0,
      };
      
      setSavedCards(prev => [...prev, newCard]);
      setShowAddCard(false);
      
      // Reset form
      setCardForm({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        saveCard: false,
      });
      
      Alert.alert('Success', 'Card saved successfully!');
      
    } catch (error) {
      console.error('❌ Error adding card:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
    }
  };

  const getCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    
    return 'unknown';
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'visa': return '💳';
      case 'mastercard': return '🔶';
      case 'amex': return '🔵';
      case 'discover': return '🔷';
      default: return '💳';
    }
  };

  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'failed': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderPaymentMethodSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💳 Payment Method</Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethodCard,
            selectedPaymentMethod === method.id && styles.paymentMethodCardSelected,
            !method.enabled && styles.paymentMethodCardDisabled,
          ]}
          onPress={() => method.enabled && setSelectedPaymentMethod(method.id)}
          disabled={!method.enabled}
        >
          <View style={styles.paymentMethodHeader}>
            <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
            <View style={styles.paymentMethodInfo}>
              <Text style={[
                styles.paymentMethodName,
                !method.enabled && styles.paymentMethodNameDisabled,
              ]}>
                {method.name}
              </Text>
              <Text style={[
                styles.paymentMethodDescription,
                !method.enabled && styles.paymentMethodDescriptionDisabled,
              ]}>
                {method.description}
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              selectedPaymentMethod === method.id && styles.radioButtonSelected,
              !method.enabled && styles.radioButtonDisabled,
            ]}>
              {selectedPaymentMethod === method.id && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </View>
          
          {!method.enabled && (
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSavedCards = () => {
    if (selectedPaymentMethod !== 'card' || savedCards.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💳 Saved Cards</Text>
          <TouchableOpacity onPress={() => setShowAddCard(true)}>
            <Text style={styles.addCardButton}>Add New</Text>
          </TouchableOpacity>
        </View>
        
        {savedCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.savedCardItem,
              card.isDefault && styles.savedCardItemDefault,
            ]}
          >
            <Text style={styles.cardIcon}>{getCardIcon(card.type)}</Text>
            <View style={styles.savedCardInfo}>
              <Text style={styles.savedCardName}>
                {card.type.toUpperCase()} •••• {card.last4}
              </Text>
              <Text style={styles.savedCardExpiry}>
                Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
              </Text>
              {card.isDefault && (
                <Text style={styles.defaultCardLabel}>Default</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCardForm = () => {
    if (selectedPaymentMethod !== 'card' || savedCards.length > 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Card Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput
            style={styles.textInput}
            value={cardForm.cardNumber}
            onChangeText={(text) => setCardForm(prev => ({ 
              ...prev, 
              cardNumber: formatCardNumber(text) 
            }))}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.md }]}>
            <Text style={styles.inputLabel}>Expiry Month</Text>
            <TextInput
              style={styles.textInput}
              value={cardForm.expiryMonth}
              onChangeText={(text) => setCardForm(prev => ({ 
                ...prev, 
                expiryMonth: text.replace(/\D/g, '').substring(0, 2)
              }))}
              placeholder="MM"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.md }]}>
            <Text style={styles.inputLabel}>Expiry Year</Text>
            <TextInput
              style={styles.textInput}
              value={cardForm.expiryYear}
              onChangeText={(text) => setCardForm(prev => ({ 
                ...prev, 
                expiryYear: text.replace(/\D/g, '').substring(0, 4)
              }))}
              placeholder="YYYY"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.textInput}
              value={cardForm.cvv}
              onChangeText={(text) => setCardForm(prev => ({ 
                ...prev, 
                cvv: text.replace(/\D/g, '').substring(0, 4)
              }))}
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cardholder Name</Text>
          <TextInput
            style={styles.textInput}
            value={cardForm.cardholderName}
            onChangeText={(text) => setCardForm(prev => ({ 
              ...prev, 
              cardholderName: text
            }))}
            placeholder="John Doe"
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setCardForm(prev => ({ ...prev, saveCard: !prev.saveCard }))}
        >
          <View style={[styles.checkbox, cardForm.saveCard && styles.checkboxChecked]}>
            {cardForm.saveCard && <Text style={styles.checkboxCheckmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Save card for future payments</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOrderSummary = () => {
    if (!bookingId || !amount) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{serviceName}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${amount}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service Fee</Text>
          <Text style={styles.summaryValue}>$3.99</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${(amount * 0.08).toFixed(2)}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelTotal}>Total</Text>
          <Text style={styles.summaryValueTotal}>
            ${(amount + 3.99 + (amount * 0.08)).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPaymentHistory = () => (
    <Modal
      visible={showTransactionHistory}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowTransactionHistory(false)}>
            <Text style={styles.modalCancelText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Payment History</Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={paymentHistory}
          keyExtractor={(item) => item.id}
          style={styles.modalContent}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyServiceName}>{item.serviceName}</Text>
                <Text style={styles.historyAmount}>
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
              
              <Text style={styles.historyProvider}>by {item.providerName}</Text>
              
              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>
                  {formatTransactionDate(item.date)}
                </Text>
                <View style={[
                  styles.historyStatus,
                  { backgroundColor: getStatusColor(item.status) + '20' }
                ]}>
                  <Text style={[
                    styles.historyStatusText,
                    { color: getStatusColor(item.status) }
                  ]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.historyPaymentMethod}>
                Paid with {item.paymentMethod}
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  const renderAddCardModal = () => (
    <Modal
      visible={showAddCard}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddCard(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add New Card</Text>
          <TouchableOpacity onPress={addNewCard}>
            <Text style={styles.modalApplyText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {renderCardForm()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <TouchableOpacity 
          onPress={() => setShowTransactionHistory(true)}
        >
          <Text style={styles.historyButton}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        {renderOrderSummary()}
        {renderPaymentMethodSelector()}
        {renderSavedCards()}
        {renderCardForm()}
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.paymentButtonContainer}>
        <TouchableOpacity
          style={[styles.paymentButton, loading && styles.paymentButtonDisabled]}
          onPress={processPayment}
          disabled={loading}
        >
          <Text style={styles.paymentButtonText}>
            {loading ? 'Processing...' : `Pay ${amount ? `$${(amount + 3.99 + (amount * 0.08)).toFixed(2)}` : ''}`}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.securityNote}>
          🔒 Your payment information is encrypted and secure
        </Text>
      </View>

      {renderAddCardModal()}
      {renderPaymentHistory()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  historyButton: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  headerSpacer: {
    width: 60,
  },

  // Content
  scrollContent: {
    flex: 1,
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  addCardButton: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },

  // Payment Methods
  paymentMethodCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentMethodCardDisabled: {
    opacity: 0.5,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  paymentMethodNameDisabled: {
    color: COLORS.textMuted,
  },
  paymentMethodDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  paymentMethodDescriptionDisabled: {
    color: COLORS.textMuted,
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
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonDisabled: {
    borderColor: COLORS.textMuted,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  comingSoonText: {
    fontSize: FONTS.xs,
    color: COLORS.warning,
    fontWeight: FONTS.weightMedium,
    marginTop: SPACING.sm,
  },

  // Saved Cards
  savedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  savedCardItemDefault: {
    borderColor: COLORS.primary,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  savedCardInfo: {
    flex: 1,
  },
  savedCardName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  savedCardExpiry: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  defaultCardLabel: {
    fontSize: FONTS.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weightBold,
    marginTop: SPACING.xs,
  },

  // Form Inputs
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxCheckmark: {
    fontSize: FONTS.xs,
    color: COLORS.white,
    fontWeight: FONTS.weightBold,
  },
  checkboxLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },

  // Order Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
  },
  summaryLabelTotal: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  summaryValueTotal: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  // Payment Button
  paymentButtonContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    ...SHADOWS.light,
  },
  paymentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  securityNote: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCancelText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  modalApplyText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },

  // Payment History
  historyItem: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  historyServiceName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  historyAmount: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  historyProvider: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  historyDate: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  historyStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  historyStatusText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
  },
  historyPaymentMethod: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
});

export default PaymentScreen;
