import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const BusinessInfo = () => {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    name: "John's Cleaning Service",
    type: 'Cleaning & Maintenance',
    description:
      'Professional cleaning service with over 5 years of experience. We specialize in residential and commercial cleaning, using eco-friendly products and state-of-the-art equipment.',
    registrationNumber: 'BUS123456789',
    address: {
      street: '123 Business Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
    },
    phone: '+1 (555) 123-4567',
    email: 'contact@johnscleaningservice.com',
    website: 'www.johnscleaningservice.com',
    yearsInBusiness: 5,
    employeeCount: 10,
    serviceArea: 'San Francisco Bay Area',
    workingHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed',
    },
  });

  const handleSave = () => {
    // Save business info
    setIsEditing(false);
  };

  const renderInfoField = (label, value, field) => (
    <View style={styles.infoField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) =>
            setBusinessInfo((prev) => ({
              ...prev,
              [field]: text,
            }))
          }
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  const renderAddressFields = () => (
    <View style={styles.addressSection}>
      <Text style={styles.sectionTitle}>Business Address</Text>
      {isEditing ? (
        <View>
          <TextInput
            style={styles.input}
            value={businessInfo.address.street}
            onChangeText={(text) =>
              setBusinessInfo((prev) => ({
                ...prev,
                address: { ...prev.address, street: text },
              }))
            }
            placeholder="Street Address"
          />
          <View style={styles.addressRow}>
            <TextInput
              style={[styles.input, styles.cityInput]}
              value={businessInfo.address.city}
              onChangeText={(text) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  address: { ...prev.address, city: text },
                }))
              }
              placeholder="City"
            />
            <TextInput
              style={[styles.input, styles.stateInput]}
              value={businessInfo.address.state}
              onChangeText={(text) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  address: { ...prev.address, state: text },
                }))
              }
              placeholder="State"
            />
            <TextInput
              style={[styles.input, styles.zipInput]}
              value={businessInfo.address.zipCode}
              onChangeText={(text) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  address: { ...prev.address, zipCode: text },
                }))
              }
              placeholder="ZIP Code"
              keyboardType="numeric"
            />
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.fieldValue}>{businessInfo.address.street}</Text>
          <Text style={styles.fieldValue}>
            {businessInfo.address.city}, {businessInfo.address.state}{' '}
            {businessInfo.address.zipCode}
          </Text>
        </View>
      )}
    </View>
  );

  const renderWorkingHours = () => (
    <View style={styles.workingHoursSection}>
      <Text style={styles.sectionTitle}>Working Hours</Text>
      {Object.entries(businessInfo.workingHours).map(([day, hours]) => (
        <View key={day} style={styles.workingHourRow}>
          <Text style={styles.dayLabel}>
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </Text>
          {isEditing ? (
            <TextInput
              style={styles.hoursInput}
              value={hours}
              onChangeText={(text) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, [day]: text },
                }))
              }
            />
          ) : (
            <Text style={styles.hoursText}>{hours}</Text>
          )}
        </View>
      ))}
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
        <Text style={styles.title}>Business Information</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageSection}>
          <Image
            source={require('../../assets/images/business-placeholder.jpg')}
            style={styles.businessImage}
          />
          {isEditing && (
            <TouchableOpacity style={styles.changeImageButton}>
              <Icon name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoSection}>
          {renderInfoField('Business Name', businessInfo.name, 'name')}
          {renderInfoField('Business Type', businessInfo.type, 'type')}
          {renderInfoField(
            'Description',
            businessInfo.description,
            'description'
          )}
          {renderInfoField(
            'Registration Number',
            businessInfo.registrationNumber,
            'registrationNumber'
          )}
          {renderAddressFields()}
          {renderInfoField('Phone Number', businessInfo.phone, 'phone')}
          {renderInfoField('Email', businessInfo.email, 'email')}
          {renderInfoField('Website', businessInfo.website, 'website')}
          {renderInfoField(
            'Years in Business',
            businessInfo.yearsInBusiness.toString(),
            'yearsInBusiness'
          )}
          {renderInfoField(
            'Number of Employees',
            businessInfo.employeeCount.toString(),
            'employeeCount'
          )}
          {renderInfoField('Service Area', businessInfo.serviceArea, 'serviceArea')}
          {renderWorkingHours()}
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
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  businessImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  infoField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  addressSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cityInput: {
    flex: 2,
    marginRight: 8,
  },
  stateInput: {
    flex: 1,
    marginRight: 8,
  },
  zipInput: {
    flex: 1,
  },
  workingHoursSection: {
    marginTop: 16,
  },
  workingHourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 16,
    color: '#333',
    width: 100,
  },
  hoursInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    fontSize: 16,
    marginLeft: 16,
  },
  hoursText: {
    fontSize: 16,
    color: '#333',
  },
});

export default BusinessInfo;
