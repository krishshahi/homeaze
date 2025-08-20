import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const BREAK_TYPES = {
  LUNCH: 'lunch',
  REST: 'rest',
  TRAVEL: 'travel',
};

const BREAK_TYPE_LABELS = {
  [BREAK_TYPES.LUNCH]: 'Lunch Break',
  [BREAK_TYPES.REST]: 'Rest Break',
  [BREAK_TYPES.TRAVEL]: 'Travel Time',
};

const DEFAULT_BREAK_DURATIONS = {
  [BREAK_TYPES.LUNCH]: 60,
  [BREAK_TYPES.REST]: 15,
  [BREAK_TYPES.TRAVEL]: 30,
};

const ProviderBreakTime = () => {
  const navigation = useNavigation();
  const [breaks, setBreaks] = useState([
    {
      id: '1',
      type: BREAK_TYPES.LUNCH,
      startTime: '12:00',
      duration: 60,
      daysEnabled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
    },
  ]);

  const addBreak = (type) => {
    const newBreak = {
      id: Date.now().toString(),
      type,
      startTime: '12:00',
      duration: DEFAULT_BREAK_DURATIONS[type],
      daysEnabled: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
    };

    setBreaks((prev) => [...prev, newBreak]);
  };

  const updateBreak = (id, updates) => {
    setBreaks((prev) =>
      prev.map((breakItem) =>
        breakItem.id === id ? { ...breakItem, ...updates } : breakItem
      )
    );
  };

  const deleteBreak = (id) => {
    setBreaks((prev) => prev.filter((breakItem) => breakItem.id !== id));
  };

  const toggleDay = (breakId, day) => {
    setBreaks((prev) =>
      prev.map((breakItem) =>
        breakItem.id === breakId
          ? {
              ...breakItem,
              daysEnabled: {
                ...breakItem.daysEnabled,
                [day]: !breakItem.daysEnabled[day],
              },
            }
          : breakItem
      )
    );
  };

  const renderBreakCard = (breakItem) => (
    <View key={breakItem.id} style={styles.breakCard}>
      <View style={styles.breakHeader}>
        <View style={styles.breakTypeContainer}>
          <Icon
            name={
              breakItem.type === BREAK_TYPES.LUNCH
                ? 'coffee'
                : breakItem.type === BREAK_TYPES.REST
                ? 'battery'
                : 'map'
            }
            size={24}
            color="#2196F3"
          />
          <Text style={styles.breakType}>
            {BREAK_TYPE_LABELS[breakItem.type]}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteBreak(breakItem.id)}
        >
          <Icon name="trash-2" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.breakDetails}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time</Text>
          <TextInput
            style={styles.input}
            value={breakItem.startTime}
            onChangeText={(text) =>
              updateBreak(breakItem.id, { startTime: text })
            }
            placeholder="HH:MM"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={breakItem.duration.toString()}
            onChangeText={(text) =>
              updateBreak(breakItem.id, { duration: parseInt(text, 10) || 0 })
            }
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.daysContainer}>
        <Text style={styles.label}>Apply to days</Text>
        <View style={styles.daysGrid}>
          {Object.entries(breakItem.daysEnabled).map(([day, enabled]) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, enabled && styles.dayButtonActive]}
              onPress={() => toggleDay(breakItem.id, day)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  enabled && styles.dayButtonTextActive,
                ]}
              >
                {day.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
        <Text style={styles.title}>Break Times</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Set your regular break times. These will be blocked out in your
          availability schedule.
        </Text>

        {breaks.map(renderBreakCard)}

        <View style={styles.addBreakSection}>
          <Text style={styles.addBreakTitle}>Add New Break</Text>
          <View style={styles.addBreakButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addBreak(BREAK_TYPES.LUNCH)}
            >
              <Icon name="coffee" size={24} color="#2196F3" />
              <Text style={styles.addButtonText}>Lunch Break</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addBreak(BREAK_TYPES.REST)}
            >
              <Icon name="battery" size={24} color="#2196F3" />
              <Text style={styles.addButtonText}>Rest Break</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addBreak(BREAK_TYPES.TRAVEL)}
            >
              <Icon name="map" size={24} color="#2196F3" />
              <Text style={styles.addButtonText}>Travel Time</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  breakCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    padding: 16,
  },
  breakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  breakTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakType: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
  breakDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  daysContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#2196F3',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  addBreakSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 24,
  },
  addBreakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addBreakButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  addButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
  },
});

export default ProviderBreakTime;
