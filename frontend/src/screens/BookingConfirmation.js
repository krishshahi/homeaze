import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { PAYMENT_METHODS } from '../constants/services';
import { bookingsAPI, paymentsAPI } from '../services/api';

const BookingConfirmation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingDetails } = route.params;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await paymentsAPI.getPaymentMethods();
      if (response.success) {
        setSavedPaymentMethods(response.data);
      } else {
        Alert.alert('Error', 'Failed to load payment methods');
      }
    } catch (error) {
      console.error('Load payment methods error:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!isPaymentValid()) return;

    try {
      setIsLoading(true);

      // Create a payment intent
      const paymentData = {
        amount: bookingDetails.total,
        currency: 'USD',
        paymentMethodType: selectedPaymentMethod,
        bookingDetails,
      };

      if (selectedPaymentMethod === PAYMENT_METHODS.CARD) {
        paymentData.card = {
          number: cardNumber,
          expiryDate,
          cvv,
          name: cardName,
        };
      }

      const intentResponse = await paymentsAPI.createPaymentIntent(paymentData);

      if (!intentResponse.success) {
        Alert.alert('Error', intentResponse.error.message);
        return;
      }

      // Confirm the payment
      const confirmResponse = await paymentsAPI.confirmPayment(
        intentResponse.data.paymentIntentId,
        { paymentMethodType: selectedPaymentMethod }
      );

      if (!confirmResponse.success) {
        Alert.alert('Error', confirmResponse.error.message);
        return;
      }

      // Create the booking
      const bookingResponse = await bookingsAPI.createBooking({
        ...bookingDetails,
        paymentIntentId: intentResponse.data.paymentIntentId,
      });

      if (!bookingResponse.success) {
        Alert.alert('Error', bookingResponse.error.message);
        return;
      }

      navigation.navigate('BookingSuccess', {
        bookingId: bookingResponse.data.bookingId,
      });
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPaymentValid = () => {
    if (selectedPaymentMethod === PAYMENT_METHODS.CARD) {
      return (
        cardNumber.length === 16 &&
        expiryDate.length === 5 &&
        cvv.length === 3 &&
        cardName.length > 0
      );
    }
    return selectedPaymentMethod !== '';
  };

  const formatExpiryDate = (text) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    if (cleanText.length >= 2) {
      return cleanText.slice(0, 2) + '/' + cleanText.slice(2, 4);
    }
    return cleanText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Booking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>
                {bookingDetails.service.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Provider</Text>
              <Text style={styles.summaryValue}>
                {bookingDetails.service.provider.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date & Time</Text>
              <Text style={styles.summaryValue}>
                {bookingDetails.date.toLocaleDateString()} at{' '}
                {bookingDetails.time}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>
                {bookingDetails.address.street}, {bookingDetails.address.city}
              </Text>
            </View>
          </View>
        </View>

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : (
            <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === PAYMENT_METHODS.CARD &&
                  styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedPaymentMethod(PAYMENT_METHODS.CARD)}
            >
              <Icon
                name="credit-card"
                size={24}
                color={
                  selectedPaymentMethod === PAYMENT_METHODS.CARD
                    ? '#FFFFFF'
                    : '#666'
                }
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  selectedPaymentMethod === PAYMENT_METHODS.CARD &&
                    styles.paymentMethodTextSelected,
                ]}
              >
                Credit/Debit Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === PAYMENT_METHODS.WALLET &&
                  styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedPaymentMethod(PAYMENT_METHODS.WALLET)}
            >
              <Icon
                name="wallet"
                size={24}
                color={
                  selectedPaymentMethod === PAYMENT_METHODS.WALLET
                    ? '#FFFFFF'
                    : '#666'
                }
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  selectedPaymentMethod === PAYMENT_METHODS.WALLET &&
                    styles.paymentMethodTextSelected,
                ]}
              >
                Wallet
              </Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedPaymentMethod === PAYMENT_METHODS.CARD && (
            <View style={styles.cardForm}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={16}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => {
                    const formatted = formatExpiryDate(text);
                    if (formatted.length <= 5) {
                      setExpiryDate(formatted);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Name on Card"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Charge</Text>
              <Text style={styles.priceValue}>
                ${bookingDetails.service.price}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Platform Fee</Text>
              <Text style={styles.priceValue}>$5</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ${bookingDetails.service.price + 5}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <TouchableOpacity
              style={[styles.payButton, !isPaymentValid() && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={!isPaymentValid() || isLoading}
            >
              <Text style={styles.payButtonText}>
                Pay ${bookingDetails.service.price + 5}
              </Text>
            </TouchableOpacity>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  paymentMethodSelected: {
    backgroundColor: '#2196F3',
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  paymentMethodTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardForm: {
    gap: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  priceBreakdown: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  payButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingConfirmation;
