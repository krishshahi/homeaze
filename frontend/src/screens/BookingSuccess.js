import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { bookingsAPI } from '../services/api';

const { width } = Dimensions.get('window');

const BookingSuccess = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bookingsAPI.getBookingDetails(bookingId);

      if (response.success) {
        setBooking(response.data);
      } else {
        setError('Failed to load booking details');
      }
    } catch (error) {
      console.error('Load booking details error:', error);
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBooking = () => {
    navigation.navigate('BookingDetails', { id: bookingId });
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="alert-triangle" size={80} color="#FF6B6B" />
          </View>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.message}>
            {error || 'Something went wrong while loading booking details'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadBookingDetails}
          >
            <Icon name="refresh-cw" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.message}>
          Your service has been booked successfully. We've sent a confirmation
          email with all the details.
        </Text>

        <View style={styles.bookingInfo}>
          <Text style={styles.bookingLabel}>Booking ID</Text>
          <Text style={styles.bookingId}>{booking.id}</Text>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceLabel}>Service</Text>
            <Text style={styles.serviceValue}>{booking.service.name}</Text>
            <Text style={styles.serviceLabel}>Provider</Text>
            <Text style={styles.serviceValue}>{booking.service.provider.name}</Text>
            <Text style={styles.serviceLabel}>Scheduled For</Text>
            <Text style={styles.serviceValue}>
              {new Date(booking.scheduledTime).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>What's Next?</Text>
          <View style={styles.instruction}>
            <View style={styles.instructionIcon}>
              <Icon name="bell" size={24} color="#2196F3" />
            </View>
            <Text style={styles.instructionText}>
              You'll receive notifications about your service provider's arrival
            </Text>
          </View>
          <View style={styles.instruction}>
            <View style={styles.instructionIcon}>
              <Icon name="message-circle" size={24} color="#2196F3" />
            </View>
            <Text style={styles.instructionText}>
              You can chat with your service provider for any specific requirements
            </Text>
          </View>
          <View style={styles.instruction}>
            <View style={styles.instructionIcon}>
              <Icon name="star" size={24} color="#2196F3" />
            </View>
            <Text style={styles.instructionText}>
              After the service, you can rate and review your experience
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.viewBookingButton}
          onPress={handleViewBooking}
        >
          <Text style={styles.viewBookingText}>View Booking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleBackToHome}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  bookingInfo: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
    width: width - 48,
  },
  bookingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionsContainer: {
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 36,
  },
  viewBookingButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewBookingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  homeButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceDetails: {
    width: '100%',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  serviceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  serviceValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingSuccess;
