import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { AVAILABILITY_SLOTS } from '../../constants/provider';
import ProvidersAPI from '../../services/providersApi';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const ProviderAvailability = () => {
  const navigation = useNavigation();
  const [weeklyAvailability, setWeeklyAvailability] = useState({});
  const [dayEnabled, setDayEnabled] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ProvidersAPI.getProviderAvailability().catch(() => null);
        const availability = res?.data || res || {};
        // Expecting shape similar to { schedule: { monday: { '1': true } ... } }
        if (availability.schedule) {
          setWeeklyAvailability(availability.schedule);
          const enabled = { ...dayEnabled };
          Object.keys(availability.schedule).forEach(d => {
            enabled[d] = Object.values(availability.schedule[d] || {}).some(Boolean);
          });
          setDayEnabled(prev => ({ ...prev, ...enabled }));
        }
      } catch (e) {
        // keep defaults on failure
      }
    };
    load();
  }, []);

  const toggleDayEnabled = (day) => {
    setDayEnabled((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));

    if (weeklyAvailability[day]) {
      // Clear availability when day is disabled
      setWeeklyAvailability((prev) => {
        const updated = { ...prev };
        delete updated[day];
        return updated;
      });
    }
  };

  const toggleTimeSlot = (day, slotId) => {
    if (!dayEnabled[day]) return;

    setWeeklyAvailability((prev) => {
      const daySlots = prev[day] || {};
      const updatedDaySlots = {
        ...daySlots,
        [slotId]: !daySlots[slotId],
      };

      // If all slots are false, remove the day entry
      if (Object.values(updatedDaySlots).every((value) => !value)) {
        const updated = { ...prev };
        delete updated[day];
        return updated;
      }

      return {
        ...prev,
        [day]: updatedDaySlots,
      };
    });
  };

  const copyAvailability = (fromDay) => {
    const availabilityToCopy = weeklyAvailability[fromDay] || {};
    
    DAYS_OF_WEEK.forEach((day) => {
      if (day.id !== fromDay && dayEnabled[day.id]) {
        setWeeklyAvailability((prev) => ({
          ...prev,
          [day.id]: { ...availabilityToCopy },
        }));
      }
    });
  };

  const renderTimeSlot = (day, slot) => {
    const isAvailable = weeklyAvailability[day]?.[slot.id];
    const isDisabled = !dayEnabled[day];

    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.timeSlot,
          isAvailable && styles.timeSlotAvailable,
          isDisabled && styles.timeSlotDisabled,
        ]}
        onPress={() => toggleTimeSlot(day, slot.id)}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.timeSlotText,
            isAvailable && styles.timeSlotTextAvailable,
            isDisabled && styles.timeSlotTextDisabled,
          ]}
        >
          {slot.time}
        </Text>
        <Icon
          name={isAvailable ? 'check-circle' : 'circle'}
          size={20}
          color={
            isDisabled
              ? '#CCCCCC'
              : isAvailable
              ? '#4CAF50'
              : '#666'
          }
        />
      </TouchableOpacity>
    );
  };

  const renderDaySection = (day) => (
    <View key={day.id} style={styles.daySection}>
      <View style={styles.daySectionHeader}>
        <View style={styles.dayTitleContainer}>
          <Text style={styles.dayTitle}>{day.label}</Text>
          <Switch
            value={dayEnabled[day.id]}
            onValueChange={() => toggleDayEnabled(day.id)}
            trackColor={{ false: '#CCCCCC', true: '#4CAF50' }}
            thumbColor="#FFFFFF"
          />
        </View>
        {dayEnabled[day.id] && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyAvailability(day.id)}
          >
            <Icon name="copy" size={16} color="#2196F3" />
            <Text style={styles.copyButtonText}>Copy to Other Days</Text>
          </TouchableOpacity>
        )}
      </View>
      {dayEnabled[day.id] && (
        <View style={styles.timeSlotsList}>
          {AVAILABILITY_SLOTS.map((slot) => renderTimeSlot(day.id, slot))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Weekly Availability</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={async () => {
            try {
              await ProvidersAPI.updateAvailability({ schedule: weeklyAvailability });
              navigation.goBack();
            } catch (e) {
              // optionally show error toast; keeping UX simple
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Set your regular working hours for each day of the week. These hours
          will be used as your default availability.
        </Text>

        {DAYS_OF_WEEK.map(renderDaySection)}
      </ScrollView>
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
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  daySection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  daySectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
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
  timeSlotDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 16,
    color: '#666',
  },
  timeSlotTextAvailable: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  timeSlotTextDisabled: {
    color: '#999',
  },
});

export default ProviderAvailability;
