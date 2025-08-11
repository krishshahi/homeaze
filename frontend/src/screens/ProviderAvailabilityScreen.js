import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const ProviderAvailabilityScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [loading, setLoading] = useState(true);

  const daysOfWeek = [
    { key: 'monday', name: 'Monday', short: 'Mon' },
    { key: 'tuesday', name: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', name: 'Wednesday', short: 'Wed' },
    { key: 'thursday', name: 'Thursday', short: 'Thu' },
    { key: 'friday', name: 'Friday', short: 'Fri' },
    { key: 'saturday', name: 'Saturday', short: 'Sat' },
    { key: 'sunday', name: 'Sunday', short: 'Sun' },
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
  ];

  useEffect(() => {
    loadAvailability();
    loadWeeklySchedule();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      
      // Mock availability data
      const mockAvailability = {
        '2024-01-15': {
          available: true,
          slots: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'],
          bookedSlots: ['11:00 AM', '1:00 PM'],
        },
        '2024-01-16': {
          available: true,
          slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
          bookedSlots: ['2:00 PM'],
        },
        '2024-01-17': {
          available: false,
          slots: [],
          bookedSlots: [],
          reason: 'Personal day off',
        },
      };

      setAvailability(mockAvailability);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error loading availability:', error);
      setLoading(false);
    }
  };

  const loadWeeklySchedule = async () => {
    try {
      // Mock weekly schedule
      const mockSchedule = {
        monday: { enabled: true, startTime: '8:00 AM', endTime: '6:00 PM', breakStart: '12:00 PM', breakEnd: '1:00 PM' },
        tuesday: { enabled: true, startTime: '8:00 AM', endTime: '6:00 PM', breakStart: '12:00 PM', breakEnd: '1:00 PM' },
        wednesday: { enabled: true, startTime: '8:00 AM', endTime: '6:00 PM', breakStart: '12:00 PM', breakEnd: '1:00 PM' },
        thursday: { enabled: true, startTime: '8:00 AM', endTime: '6:00 PM', breakStart: '12:00 PM', breakEnd: '1:00 PM' },
        friday: { enabled: true, startTime: '8:00 AM', endTime: '5:00 PM', breakStart: '12:00 PM', breakEnd: '1:00 PM' },
        saturday: { enabled: true, startTime: '9:00 AM', endTime: '4:00 PM', breakStart: null, breakEnd: null },
        sunday: { enabled: false, startTime: null, endTime: null, breakStart: null, breakEnd: null },
      };

      setWeeklySchedule(mockSchedule);
      
    } catch (error) {
      console.error('❌ Error loading weekly schedule:', error);
    }
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date,
        day,
        dateString,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
        availability: availability[dateString],
      });
    }
    
    return days;
  };

  const toggleDaySchedule = (dayKey) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
      }
    }));
  };

  const updateAvailabilityForDate = (dateString, isAvailable) => {
    setAvailability(prev => ({
      ...prev,
      [dateString]: {
        ...prev[dateString],
        available: isAvailable,
        slots: isAvailable ? timeSlots.slice(0, 6) : [],
      }
    }));
  };

  const saveAvailability = async () => {
    try {
      // In real app, would save to API
      console.log('💾 Saving availability:', { weeklySchedule, availability });
      Alert.alert('Success', 'Your availability has been updated!');
    } catch (error) {
      console.error('❌ Error saving availability:', error);
      Alert.alert('Error', 'Failed to save availability. Please try again.');
    }
  };

  const renderCalendarHeader = () => (
    <View style={styles.calendarHeader}>
      <Text style={styles.monthTitle}>
        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Text>
      <View style={styles.weekDaysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekDayLabel}>{day}</Text>
        ))}
      </View>
    </View>
  );

  const renderCalendarDay = ({ item }) => {
    if (!item) {
      return <View style={styles.emptyCalendarDay} />;
    }

    const { day, isToday, isSelected, availability } = item;
    const hasAvailability = availability?.available;
    const isBooked = availability?.bookedSlots?.length > 0;

    return (
      <TouchableOpacity
        style={[
          styles.calendarDay,
          isToday && styles.todayCalendarDay,
          isSelected && styles.selectedCalendarDay,
          hasAvailability && styles.availableCalendarDay,
        ]}
        onPress={() => setSelectedDate(item.date)}
      >
        <Text style={[
          styles.calendarDayText,
          isToday && styles.todayCalendarDayText,
          isSelected && styles.selectedCalendarDayText,
        ]}>
          {day}
        </Text>
        {hasAvailability && (
          <View style={[
            styles.availabilityDot,
            isBooked && styles.bookedDot,
          ]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderWeeklySchedule = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📅 Weekly Schedule</Text>
      
      {daysOfWeek.map((day) => {
        const schedule = weeklySchedule[day.key];
        if (!schedule) return null;

        return (
          <View key={day.key} style={styles.scheduleItem}>
            <View style={styles.scheduleHeader}>
              <Text style={styles.dayName}>{day.name}</Text>
              <Switch
                value={schedule.enabled}
                onValueChange={() => toggleDaySchedule(day.key)}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
                thumbColor={schedule.enabled ? COLORS.primary : COLORS.textMuted}
              />
            </View>
            
            {schedule.enabled && (
              <View style={styles.scheduleDetails}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Work Hours:</Text>
                  <Text style={styles.timeValue}>
                    {schedule.startTime} - {schedule.endTime}
                  </Text>
                </View>
                {schedule.breakStart && schedule.breakEnd && (
                  <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>Break:</Text>
                    <Text style={styles.timeValue}>
                      {schedule.breakStart} - {schedule.breakEnd}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderSelectedDateAvailability = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const dayAvailability = availability[dateString];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🕐 {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <View style={styles.availabilityToggle}>
          <Text style={styles.availabilityLabel}>Available for bookings</Text>
          <Switch
            value={dayAvailability?.available || false}
            onValueChange={(value) => updateAvailabilityForDate(dateString, value)}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={dayAvailability?.available ? COLORS.primary : COLORS.textMuted}
          />
        </View>

        {dayAvailability?.available && (
          <>
            <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((slot) => {
                const isAvailable = dayAvailability.slots?.includes(slot);
                const isBooked = dayAvailability.bookedSlots?.includes(slot);
                
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlot,
                      isAvailable && styles.availableTimeSlot,
                      isBooked && styles.bookedTimeSlot,
                    ]}
                    disabled={isBooked}
                    onPress={() => {
                      const updatedSlots = isAvailable
                        ? dayAvailability.slots.filter(s => s !== slot)
                        : [...(dayAvailability.slots || []), slot];
                      
                      setAvailability(prev => ({
                        ...prev,
                        [dateString]: {
                          ...prev[dateString],
                          slots: updatedSlots,
                        }
                      }));
                    }}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      isAvailable && styles.availableTimeSlotText,
                      isBooked && styles.bookedTimeSlotText,
                    ]}>
                      {slot}
                    </Text>
                    {isBooked && <Text style={styles.bookedLabel}>Booked</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {dayAvailability?.reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason:</Text>
            <Text style={styles.reasonText}>{dayAvailability.reason}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            // Set next 7 days as available
            const today = new Date();
            const updates = {};
            for (let i = 0; i < 7; i++) {
              const date = new Date(today);
              date.setDate(today.getDate() + i);
              const dateString = date.toISOString().split('T')[0];
              updates[dateString] = {
                available: true,
                slots: timeSlots.slice(0, 6),
                bookedSlots: availability[dateString]?.bookedSlots || [],
              };
            }
            setAvailability(prev => ({ ...prev, ...updates }));
          }}
        >
          <Text style={styles.actionButtonText}>📅 Set Next Week Available</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Block Time Off',
              'This feature will allow you to block multiple days for vacation or time off.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.actionButtonText}>🏖️ Block Time Off</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Copy Schedule',
              'This feature will allow you to copy your schedule to other weeks.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.actionButtonText}>📋 Copy This Week</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Auto-Availability',
              'This feature will automatically manage your availability based on your preferences.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.actionButtonText}>🤖 Auto-Availability</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading availability...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Availability</Text>
        <TouchableOpacity onPress={saveAvailability}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Calendar */}
        <View style={styles.section}>
          {renderCalendarHeader()}
          <FlatList
            data={generateCalendarDays()}
            renderItem={renderCalendarDay}
            keyExtractor={(item, index) => index.toString()}
            numColumns={7}
            scrollEnabled={false}
            style={styles.calendar}
          />
        </View>

        {renderSelectedDateAvailability()}
        {renderWeeklySchedule()}
        {renderQuickActions()}
      </ScrollView>
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
  saveButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },

  // Content
  scrollContent: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  // Calendar
  calendarHeader: {
    marginBottom: SPACING.lg,
  },
  monthTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  weekDayLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  calendar: {
    marginBottom: SPACING.lg,
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  emptyCalendarDay: {
    width: 40,
    height: 40,
    margin: 2,
  },
  todayCalendarDay: {
    backgroundColor: COLORS.primary + '20',
  },
  selectedCalendarDay: {
    backgroundColor: COLORS.primary,
  },
  availableCalendarDay: {
    backgroundColor: COLORS.success + '10',
  },
  calendarDayText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
  },
  todayCalendarDayText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightBold,
  },
  selectedCalendarDayText: {
    color: COLORS.white,
    fontWeight: FONTS.weightBold,
  },
  availabilityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.success,
    position: 'absolute',
    bottom: 4,
  },
  bookedDot: {
    backgroundColor: COLORS.warning,
  },

  // Weekly Schedule
  scheduleItem: {
    marginBottom: SPACING.lg,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dayName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  scheduleDetails: {
    paddingLeft: SPACING.lg,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  timeLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  timeValue: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weightMedium,
  },

  // Selected Date Availability
  availabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  availabilityLabel: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  timeSlotsTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeSlot: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
  },
  availableTimeSlot: {
    backgroundColor: COLORS.success + '20',
    borderColor: COLORS.success,
  },
  bookedTimeSlot: {
    backgroundColor: COLORS.warning + '20',
    borderColor: COLORS.warning,
    opacity: 0.7,
  },
  timeSlotText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  availableTimeSlotText: {
    color: COLORS.success,
    fontWeight: FONTS.weightMedium,
  },
  bookedTimeSlotText: {
    color: COLORS.warning,
  },
  bookedLabel: {
    fontSize: 8,
    color: COLORS.warning,
    marginTop: 2,
  },

  // Reason
  reasonContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  reasonLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  reasonText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },

  // Actions Grid
  actionsGrid: {
    gap: SPACING.sm,
  },
  actionButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
});

export default ProviderAvailabilityScreen;
