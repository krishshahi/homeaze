import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const AddBankAccount = () => {
  const navigation = useNavigation();
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    makeDefault: false,
  });

  const handleInputChange = (field, value) => {
    setBankDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!bankDetails.accountHolderName) {
      Alert.alert('Error', 'Please enter account holder name');
      return false;
    }
    if (!bankDetails.bankName) {
      Alert.alert('Error', 'Please enter bank name');
      return false;
    }
    if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 8) {
      Alert.alert('Error', 'Please enter a valid account number');
      return false;
    }
    if (!bankDetails.routingNumber || bankDetails.routingNumber.length !== 9) {
      Alert.alert('Error', 'Please enter a valid routing number');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically make an API call to add the bank account
      navigation.goBack();
    }
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
        <Text style={styles.title}>Add Bank Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              value={bankDetails.accountHolderName}
              onChangeText={(text) => handleInputChange('accountHolderName', text)}
              placeholder="Enter full name on account"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={bankDetails.bankName}
              onChangeText={(text) => handleInputChange('bankName', text)}
              placeholder="Enter bank name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={bankDetails.accountNumber}
              onChangeText={(text) =>
                handleInputChange('accountNumber', text.replace(/[^0-9]/g, ''))
              }
              placeholder="Enter account number"
              keyboardType="numeric"
              maxLength={17}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Routing Number</Text>
            <TextInput
              style={styles.input}
              value={bankDetails.routingNumber}
              onChangeText={(text) =>
                handleInputChange('routingNumber', text.replace(/[^0-9]/g, ''))
              }
              placeholder="Enter 9-digit routing number"
              keyboardType="numeric"
              maxLength={9}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.accountTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  bankDetails.accountType === 'checking' &&
                    styles.accountTypeButtonActive,
                ]}
                onPress={() => handleInputChange('accountType', 'checking')}
              >
                <Text
                  style={[
                    styles.accountTypeText,
                    bankDetails.accountType === 'checking' &&
                      styles.accountTypeTextActive,
                  ]}
                >
                  Checking
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.accountTypeButton,
                  bankDetails.accountType === 'savings' &&
                    styles.accountTypeButtonActive,
                ]}
                onPress={() => handleInputChange('accountType', 'savings')}
              >
                <Text
                  style={[
                    styles.accountTypeText,
                    bankDetails.accountType === 'savings' &&
                      styles.accountTypeTextActive,
                  ]}
                >
                  Savings
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Icon name="check-circle" size={20} color="#666" />
              <Text style={styles.switchText}>Make Default Account</Text>
            </View>
            <Switch
              value={bankDetails.makeDefault}
              onValueChange={(value) => handleInputChange('makeDefault', value)}
              trackColor={{ false: '#CCCCCC', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Icon name="info" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Your bank account information is secure and encrypted. We use this
            information only for depositing your earnings.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Bank Account</Text>
        </TouchableOpacity>
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
  formSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
    color: '#333',
  },
  accountTypeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  accountTypeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  accountTypeButtonActive: {
    backgroundColor: '#2196F3',
  },
  accountTypeText: {
    fontSize: 16,
    color: '#666',
  },
  accountTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#2196F3',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddBankAccount;
