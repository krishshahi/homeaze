import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import BookingsAPI from '../services/bookingsApi';
import ServicesAPI from '../services/servicesApi';
import { useAppDispatch, useServices, useAuth } from '../store/hooks';
import { createNewBooking } from '../store/slices/bookingSlice';

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

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM'
  ];

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

  const handleBookingSubmit = () => {
    // Validate form
    if (!formData.selectedDate || !formData.selectedTime || !formData.address || !formData.contactPhone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Show booking confirmation
    Alert.alert(
      'Booking Confirmed',
      'Your service booking has been submitted successfully. The provider will contact you shortly to confirm the details.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('BookingsMain')
        }
      ]
    );
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
            <Text style={styles.summaryValue}>House Cleaning</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Provider:</Text>
            <Text style={styles.summaryValue}>CleanPro Services</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Price:</Text>
            <Text style={styles.summaryPrice}>$80</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <CustomInput
            placeholder="Select date (MM/DD/YYYY)"
            value={formData.selectedDate}
            onChangeText={(value) => handleInputChange('selectedDate', value)}
            required={true}
          />
        </View>

        {/* Time Selection */}
        {renderTimeSlots()}

        {/* Address */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <CustomInput
            placeholder="Enter your full address"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            multiline={true}
            numberOfLines={3}
            required={true}
          />
        </View>

        {/* Contact Phone */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Phone</Text>
          <CustomInput
            placeholder="Enter your phone number"
            value={formData.contactPhone}
            onChangeText={(value) => handleInputChange('contactPhone', value)}
            keyboardType="phone-pad"
            required={true}
          />
        </View>

        {/* Special Instructions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <CustomInput
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
          <Text style={styles.totalPrice}>$80</Text>
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
