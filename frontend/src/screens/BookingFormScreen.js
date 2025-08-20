import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
// import CustomInput from '../components/CustomInput';

// Temporary simple input to bypass JSX error
const SimpleInput = ({ placeholder, value, onChangeText, multiline, numberOfLines, keyboardType, style }) => {
  return (
    <TextInput
      style={[{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
        fontSize: 16
      }, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType}
    />
  );
};
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import BookingsAPI from '../services/bookingsApi';
import ServicesAPI from '../services/servicesApi';
import { useAppDispatch, useServices, useAuth } from '../store/hooks';
import { addBooking } from '../store/slices/bookingSlice';

const BookingFormScreen = ({ navigation, route }) => {
  const { serviceId } = route.params;
  const dispatch = useAppDispatch();
  const { services } = useServices();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    selectedDate: '',
    selectedTime: '',
    address: '',
    contactPhone: user?.phone || '',
    specialInstructions: '',
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Generate time slots based on service availability
  const getTimeSlots = () => {
    if (!service?.availability?.workingHours) {
      // Default time slots if no availability info
      return [
        '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
        '04:00 PM', '05:00 PM'
      ];
    }

    const { start, end } = service.availability.workingHours;
    const timeSlots = [];
    
    // Convert start and end times to 24-hour format
    const [startHour] = start.split(':').map(Number);
    const [endHour] = end.split(':').map(Number);
    
    // Generate hourly slots from start to end
    for (let hour = startHour; hour < endHour; hour++) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';
      timeSlots.push(`${hour12.toString().padStart(2, '0')}:00 ${period}`);
    }
    
    return timeSlots;
  };

  const timeSlots = getTimeSlots();

  // Load service details on component mount
  useEffect(() => {
    const loadServiceDetails = async () => {
      try {
        console.log('📋 Loading service details for ID:', serviceId);
        
        // First try to find service in Redux state
        const foundService = services.find(s => s.id === serviceId);
        if (foundService) {
          setService(foundService);
          console.log('✅ Service found in Redux state:', foundService);
        } else {
          // If not in Redux, fetch from API
          const serviceData = await ServicesAPI.getServiceById(serviceId);
          setService(serviceData);
          console.log('✅ Service fetched from API:', serviceData);
        }
      } catch (error) {
        console.error('❌ Error loading service details:', error);
        // Use fallback service data
        setService({
          id: serviceId,
          title: 'House Cleaning',
          startingPrice: 80,
          provider: { name: 'CleanPro Services' }
        });
      }
    };

    loadServiceDetails();
  }, [serviceId, services]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeSlotSelect = (time) => {
    setSelectedTimeSlot(time);
    handleInputChange('selectedTime', time);
  };

  const handleBookingSubmit = async () => {
    // Validate form
    if (!formData.selectedDate || !formData.selectedTime || !formData.address || !formData.contactPhone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Debug service structure to understand provider ID
      console.log('🔍 Service object structure:', JSON.stringify(service, null, 2));
      
      // Try multiple ways to extract provider ID
      let providerId = service?.providerId || 
                      service?.provider?.id || 
                      service?.provider?._id || 
                      service?.userId ||
                      service?.createdBy ||
                      service?.ownerId;
      
      // Handle case where provider is just a string (provider name)
      if (!providerId && typeof service?.provider === 'string') {
        // Generate a consistent ID based on the provider name
        providerId = 'provider-' + service.provider.toLowerCase().replace(/\s+/g, '-');
        console.log('🔍 Generated provider ID from name:', providerId);
      }
      
      console.log('🔍 Detected provider ID:', providerId);
      
      // If still no provider ID, create a more meaningful fallback
      const finalProviderId = providerId || `fallback-${serviceId.slice(-8)}`;
      
      // Convert time format to match backend expectations
      const convertTimeFormat = (timeStr) => {
        // Convert "10:00 AM" to "10:00"
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        
        if (period === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minutes}`;
      };
      
      const startTime = convertTimeFormat(formData.selectedTime);
      const [hours, minutes] = startTime.split(':').map(Number);
      const endTime = `${(hours + 2).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`; // Default 2 hour service
      
      // Convert date from MM/DD/YYYY to ISO8601 format
      const convertToISODate = (dateStr) => {
        const [month, day, year] = dateStr.split('/');
        return new Date(year, month - 1, day).toISOString().split('T')[0];
      };
      
      // Parse address into components (basic parsing)
      const parseAddress = (fullAddress) => {
        // Simple address parsing - in a real app, you'd use a geocoding service
        const parts = fullAddress.split(',').map(p => p.trim());
        return {
          street: parts[0] || fullAddress,
          city: parts[1] || 'Unknown',
          state: parts[2] || 'Unknown',
          zipCode: parts[3] || '00000'
        };
      };
      
      const addressComponents = parseAddress(formData.address);
      const isoDate = convertToISODate(formData.selectedDate);
      
      // First, check available time slots for the selected date
      console.log('🕐 Checking available slots for date:', isoDate);
      try {
        const availableSlotsResponse = await BookingsAPI.getAvailableSlots(serviceId, isoDate);
        console.log('🕐 Available slots:', availableSlotsResponse);
        
        // Check if our selected time is in the available slots
        const selectedTime24h = startTime;
        const isTimeAvailable = availableSlotsResponse?.data?.availableSlots?.some(slot => 
          slot.startTime === selectedTime24h
        );
        
        if (!isTimeAvailable) {
          console.log('⚠️ Selected time not available. Available slots:', availableSlotsResponse?.data?.availableSlots);
          Alert.alert(
            'Time Slot Not Available',
            'The selected time slot is not available. Please choose a different time.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }
      } catch (slotError) {
        console.log('⚠️ Could not check available slots:', slotError.message);
        // Continue with booking attempt even if slot check fails
      }
      
      // Prepare booking data to match backend schema exactly
      // Note: providerId is NOT sent - backend determines it from the service
      const bookingData = {
        serviceId,
        scheduledDate: isoDate,
        scheduledTime: {
          start: startTime,
          end: endTime
        },
        location: {
          address: {
            street: addressComponents.street,
            city: addressComponents.city,
            state: addressComponents.state,
            zipCode: addressComponents.zipCode
          }
        },
        serviceRequirements: formData.specialInstructions,
        payment: {
          method: 'credit_card' // Use valid payment method from backend enum
        }
      };
      
      console.log('📋 Creating booking with data:', bookingData);
      
      // Create booking via API
      console.log('📡 Calling BookingsAPI.createBooking with data:', bookingData);
      const createdBooking = await BookingsAPI.createBooking(bookingData);
      
      console.log('✅ Booking created successfully:', createdBooking);
      
      // Update Redux state with the booking data
      const bookingForRedux = {
        id: createdBooking?.data?.booking?._id || createdBooking?.data?.booking?.id,
        bookingNumber: createdBooking?.data?.bookingNumber,
        serviceTitle: service?.title,
        serviceIcon: service?.icon,
        providerName: typeof service?.provider === 'string' ? service?.provider : service?.provider?.name,
        status: createdBooking?.data?.booking?.status || 'pending',
        scheduledDate: createdBooking?.data?.booking?.scheduledDate,
        totalCost: createdBooking?.data?.booking?.pricing?.estimatedCost || service?.price || 35,
        location: formData.address,
        hasReview: false,
        ...createdBooking?.data?.booking
      };
      
      console.log('📋 Adding booking to Redux:', bookingForRedux);
      dispatch(addBooking(bookingForRedux));
      
      // Extract booking ID from the response
      const bookingId = createdBooking?.data?.booking?._id || 
                       createdBooking?.data?.booking?.id || 
                       createdBooking?.booking?._id || 
                       createdBooking?.booking?.id || 
                       createdBooking?.id || 
                       createdBooking?._id;
      
      console.log('🆔 Extracted booking ID:', bookingId);
      
      // Extract amount from booking response or fallback to service price
      const bookingAmount = createdBooking?.data?.booking?.pricing?.estimatedCost || 
                           createdBooking?.data?.booking?.pricing?.totalAmount ||
                           service?.price || 
                           parseFloat(service?.startingPrice?.replace(/[^0-9.]/g, '')) || 
                           35;
      
      console.log('💰 Extracted amount:', bookingAmount, 'Type:', typeof bookingAmount);
      
      const navigationParams = {
        bookingId: bookingId,
        amount: bookingAmount,
        serviceName: service?.title || service?.name || 'Service',
      };
      
      console.log('🧭 Navigating to Payment with params:', navigationParams);
      
      setLoading(false);
      
      try {
        // Navigate to payment screen
        navigation.navigate('Payment', navigationParams);
        console.log('✅ Navigation to Payment screen successful');
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        // Show success message even if navigation fails
        Alert.alert(
          'Booking Created!',
          `Your booking has been created successfully. Booking number: ${createdBooking?.data?.bookingNumber || 'N/A'}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
      
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      setLoading(false);
      
      // Show detailed error information
      let errorMessage = 'Failed to create booking. Please try again.';
      if (error.message) {
        if (error.message.includes('Validation failed')) {
          errorMessage = 'Please check your booking details and try again.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Booking Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  const renderTimeSlots = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Select Time</Text>
      <View style={styles.timeSlotsContainer}>
        {timeSlots.map((time, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeSlotButton,
              selectedTimeSlot === time && styles.selectedTimeSlot
            ]}
            onPress={() => handleTimeSlotSelect(time)}
          >
            <Text 
              style={[
                styles.timeSlotText,
                selectedTimeSlot === time && styles.selectedTimeSlotText
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Book Service</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Summary */}
        <View style={styles.serviceSummary}>
          <Text style={styles.summaryTitle}>Service Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service:</Text>
            <Text style={styles.summaryValue}>{service?.title || service?.name || 'Loading...'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Provider:</Text>
            <Text style={styles.summaryValue}>
              {typeof service?.provider === 'string' 
                ? service.provider 
                : service?.provider?.name || service?.provider?.businessName || 'Loading...'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Price:</Text>
            <Text style={styles.summaryPrice}>
              ${service?.startingPrice || service?.price || '0'}
            </Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <SimpleInput
            placeholder="Select date (MM/DD/YYYY)"
            value={formData.selectedDate}
            onChangeText={(value) => handleInputChange('selectedDate', value)}
          />
          <Text style={styles.helperText}>
            Please book at least {service?.availability?.advanceBookingDays || 1} day(s) in advance
          </Text>
          {service?.availability?.workingDays && (
            <Text style={styles.helperText}>
              Available: {service.availability.workingDays.map(day => 
                day.charAt(0).toUpperCase() + day.slice(1)
              ).join(', ')}
            </Text>
          )}
        </View>

        {/* Time Selection */}
        {renderTimeSlots()}

        {/* Address */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <SimpleInput
            placeholder="Enter your full address"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            multiline={true}
            numberOfLines={3}
          />
        </View>

        {/* Contact Phone */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Phone</Text>
          <SimpleInput
            placeholder="Enter your phone number"
            value={formData.contactPhone}
            onChangeText={(value) => handleInputChange('contactPhone', value)}
            keyboardType="phone-pad"
          />
        </View>

        {/* Special Instructions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <SimpleInput
            placeholder="Any specific requirements or instructions..."
            value={formData.specialInstructions}
            onChangeText={(value) => handleInputChange('specialInstructions', value)}
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Estimate</Text>
          <Text style={styles.totalPrice}>
            ${service?.startingPrice || service?.price || '0'}
          </Text>
        </View>
        
        <CustomButton
          title="Confirm Booking"
          onPress={handleBookingSubmit}
          style={styles.confirmButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.xl,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  
  // Service Summary
  serviceSummary: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  summaryTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  summaryPrice: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  
  // Sections
  sectionContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  helperText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  
  // Time Slots
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeSlotButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weightMedium,
  },
  selectedTimeSlotText: {
    color: COLORS.white,
  },
  
  // Bottom Bar
  bottomBar: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  totalPrice: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  confirmButton: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default BookingFormScreen;
