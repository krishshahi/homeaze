import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Feather';

import BookingsAPI from '../../services/bookingsApi';
import ProvidersAPI from '../../services/providersApi';

const ProviderCalendar = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedView, setSelectedView] = useState('calendar'); // 'calendar' or 'availability'
  const [availability, setAvailability] = useState({});
  const [bookingsByDate, setBookingsByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await BookingsAPI.getProviderBookings().catch(() => null);
        const list = Array.isArray(res) ? res : (res?.bookings || res?.data || []);
        const grouped = {};
        (list || []).forEach(b => {
          const d = b.date || b.scheduledDate || b.scheduledAt;
          if (!d) return;
          const key = new Date(d).toISOString().slice(0, 10);
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            id: b.id || b._id,
            customer: b.customer?.name || b.customerName || 'Customer',
            service: b.service?.name || b.serviceName || 'Service',
            time: b.time || b.scheduledTime?.start || '',
            duration: b.duration || (b.scheduledTime?.end ? `${b.scheduledTime?.start} - ${b.scheduledTime?.end}` : ''),
            status: b.status || 'confirmed',
          });
        });
        setBookingsByDate(grouped);
      } catch (e) {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load availability for a specific date whenever selectedDate changes
  useEffect(() => {
    const fetchAvailabilityForDate = async () => {
      if (!selectedDate) return;
      try {
        setLoading(true);
        const dateStr = selectedDate;
        const res = await ProvidersAPI.getProviderAvailability(null, dateStr).catch(() => null);
        // Normalize into shape: availability[dateStr] = { [slotId]: boolean }
        let slots = [];
        if (Array.isArray(res)) {
          slots = res;
        } else if (Array.isArray(res?.slots)) {
          slots = res.slots;
        } else if (Array.isArray(res?.data?.slots)) {
          slots = res.data.slots;
        } else if (res?.availability?.[dateStr]?.slots) {
          slots = res.availability[dateStr].slots;
        }
        // Convert to map by slotId (use time string as id)
        const map = {};
        (slots || []).forEach(s => {
          const id = typeof s === 'string' ? s : (s.id || s.time || '');
          if (id) map[id] = true;
        });
        setAvailability(prev => ({
          ...prev,
          [dateStr]: map,
        }));
      } catch (e) {
        // keep existing availability state
      } finally {
        setLoading(false);
      }
    };
    fetchAvailabilityForDate();
  }, [selectedDate]);

  const toggleTimeSlot = (date, slotId) => {
    setAvailability((prev) => {
      const dateSlots = prev[date] || {};
      return {
        ...prev,
        [date]: {
          ...dateSlots,
          [slotId]: !dateSlots[slotId],
        },
      };
    });
  };

  const getMarkedDates = () => {
    const marked = {};
    Object.keys(bookingsByDate).forEach((date) => {
      marked[date] = {
        marked: true,
        dotColor: '#2196F3',
      };
    });
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#2196F3',
      };
    }
    return marked;
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('ServiceDetails', { id: item.id })}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customer}</Text>
          <Text style={styles.serviceType}>{item.service}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'confirmed' ? '#4CAF50' : '#FFC107',
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Icon name="clock" size={16} color="#666" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAvailabilitySlot = ({ item }) => {
    const isAvailable = availability[selectedDate]?.[item.id];
    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          isAvailable && styles.timeSlotAvailable,
        ]}
        onPress={() => toggleTimeSlot(selectedDate, item.id)}
      >
        <Text
          style={[
            styles.timeSlotText,
            isAvailable && styles.timeSlotTextAvailable,
          ]}
        >
          {item.time}
        </Text>
        <Icon
          name={isAvailable ? 'check-circle' : 'circle'}
          size={20}
          color={isAvailable ? '#4CAF50' : '#666'}
        />
      </TouchableOpacity>
    );
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
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === 'calendar' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedView('calendar')}
          >
            <Icon
              name="calendar"
              size={20}
              color={selectedView === 'calendar' ? '#FFFFFF' : '#666'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === 'availability' && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedView('availability')}
          >
            <Icon
              name="clock"
              size={20}
              color={selectedView === 'availability' ? '#FFFFFF' : '#666'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Calendar
        style={styles.calendar}
        markedDates={getMarkedDates()}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          selectedDayBackgroundColor: '#2196F3',
          todayTextColor: '#2196F3',
          arrowColor: '#2196F3',
        }}
      />

      {selectedView === 'calendar' && selectedDate && (
        <View style={styles.bookingsContainer}>
          <Text style={styles.sectionTitle}>Bookings</Text>
          {loading ? (
            <ActivityIndicator color="#2196F3" />
          ) : (
            <FlatList
              data={bookingsByDate[selectedDate] || []}
              renderItem={renderBooking}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No bookings for this date</Text>
              }
              contentContainerStyle={styles.bookingsList}
            />
          )}
        </View>
      )}

      {selectedView === 'availability' && selectedDate && (
        <View style={styles.availabilityContainer}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.sectionTitle}>Set Availability</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={async () => {
                try {
                  const dateStr = selectedDate;
                  const slotsMap = availability[dateStr] || {};
                  const slots = Object.keys(slotsMap).filter(k => slotsMap[k]);
                  await ProvidersAPI.updateAvailability({ date: dateStr, slots });
                } catch (e) {
                  // optionally show toast
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={(() => {
              const dateStr = selectedDate;
              const map = availability[dateStr] || {};
              // Build list of slot objects from known availability keys.
              let slots = Object.keys(map).map(id => ({ id, time: id }));
              if (slots.length === 0) {
                // Fallback to default hourly slots 09:00 - 18:00
                const defaults = ['09:00 AM - 10:00 AM','10:00 AM - 11:00 AM','11:00 AM - 12:00 PM','12:00 PM - 01:00 PM','02:00 PM - 03:00 PM','03:00 PM - 04:00 PM','04:00 PM - 05:00 PM','05:00 PM - 06:00 PM'];
                slots = defaults.map((t, idx) => ({ id: t, time: t }));
              }
              return slots;
            })()}
            renderItem={renderAvailabilitySlot}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.timeSlotsList}
          />
        </View>
      )}
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#2196F3',
  },
  calendar: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  bookingsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  availabilityContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
  },
  bookingsList: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  timeSlotsList: {
    padding: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeSlotAvailable: {
    backgroundColor: '#E8F5E9',
  },
  timeSlotText: {
    fontSize: 16,
    color: '#666',
  },
  timeSlotTextAvailable: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProviderCalendar;
