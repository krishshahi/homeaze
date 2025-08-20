import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const AddService = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categories, onServiceAdded } = route.params;

  const [serviceData, setServiceData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    basePrice: '',
    priceUnit: 'per visit',
    duration: '',
    available: true,
    customizable: false,
    options: [],
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOption, setNewOption] = useState({
    name: '',
    price: '',
    unit: 'per item',
  });

  const priceUnits = [
    'per visit',
    'per hour',
    'per day',
    'per week',
    'per month',
    'per square foot',
  ];

  const optionUnits = [
    'per item',
    'per room',
    'per hour',
    'per visit',
    'per square foot',
  ];

  const validateForm = () => {
    if (!serviceData.name.trim()) {
      Alert.alert('Error', 'Please enter a service name');
      return false;
    }
    if (!serviceData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!serviceData.subcategory) {
      Alert.alert('Error', 'Please select a subcategory');
      return false;
    }
    if (!serviceData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!serviceData.basePrice || isNaN(serviceData.basePrice)) {
      Alert.alert('Error', 'Please enter a valid base price');
      return false;
    }
    if (!serviceData.duration.trim()) {
      Alert.alert('Error', 'Please enter service duration');
      return false;
    }
    return true;
  };

  const handleAddOption = () => {
    if (!newOption.name.trim() || !newOption.price || isNaN(newOption.price)) {
      Alert.alert('Error', 'Please enter valid option details');
      return;
    }

    const option = {
      id: Date.now().toString(),
      ...newOption,
      price: parseFloat(newOption.price),
    };

    setServiceData({
      ...serviceData,
      options: [...serviceData.options, option],
    });

    setNewOption({
      name: '',
      price: '',
      unit: 'per item',
    });
    setShowAddOption(false);
  };

  const handleRemoveOption = (optionId) => {
    setServiceData({
      ...serviceData,
      options: serviceData.options.filter((opt) => opt.id !== optionId),
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Here you would typically send the service data to your backend
      const newService = {
        id: Date.now().toString(),
        ...serviceData,
        basePrice: parseFloat(serviceData.basePrice),
      };

      // Call the callback from the route params
      onServiceAdded(newService);
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add service');
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
        <Text style={styles.title}>Add New Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Name</Text>
            <TextInput
              style={styles.input}
              value={serviceData.name}
              onChangeText={(text) =>
                setServiceData({ ...serviceData, name: text })
              }
              placeholder="Enter service name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={serviceData.category}
                onValueChange={(value) => {
                  setServiceData({
                    ...serviceData,
                    category: value,
                    subcategory: '',
                  });
                  setSelectedCategory(categories.find((c) => c.id === value));
                }}
              >
                <Picker.Item label="Select a category" value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {selectedCategory && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subcategory</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={serviceData.subcategory}
                  onValueChange={(value) =>
                    setServiceData({ ...serviceData, subcategory: value })
                  }
                >
                  <Picker.Item label="Select a subcategory" value="" />
                  {selectedCategory.subcategories.map((subcategory) => (
                    <Picker.Item
                      key={subcategory}
                      label={subcategory}
                      value={subcategory}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={serviceData.description}
              onChangeText={(text) =>
                setServiceData({ ...serviceData, description: text })
              }
              placeholder="Describe your service"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Duration</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Base Price ($)</Text>
            <TextInput
              style={styles.input}
              value={serviceData.basePrice}
              onChangeText={(text) =>
                setServiceData({ ...serviceData, basePrice: text })
              }
              placeholder="Enter base price"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Unit</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={serviceData.priceUnit}
                onValueChange={(value) =>
                  setServiceData({ ...serviceData, priceUnit: value })
                }
              >
                {priceUnits.map((unit) => (
                  <Picker.Item key={unit} label={unit} value={unit} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (e.g., "2-3 hours")</Text>
            <TextInput
              style={styles.input}
              value={serviceData.duration}
              onChangeText={(text) =>
                setServiceData({ ...serviceData, duration: text })
              }
              placeholder="Enter service duration"
            />
          </View>

          <View style={styles.switchGroup}>
            <View>
              <Text style={styles.switchLabel}>Available</Text>
              <Text style={styles.switchDescription}>
                Make this service visible to customers
              </Text>
            </View>
            <Switch
              value={serviceData.available}
              onValueChange={(value) =>
                setServiceData({ ...serviceData, available: value })
              }
              trackColor={{ false: '#CCCCCC', true: '#90CAF9' }}
              thumbColor={serviceData.available ? '#2196F3' : '#F5F5F5'}
            />
          </View>

          <View style={styles.switchGroup}>
            <View>
              <Text style={styles.switchLabel}>Customizable</Text>
              <Text style={styles.switchDescription}>
                Allow additional service options
              </Text>
            </View>
            <Switch
              value={serviceData.customizable}
              onValueChange={(value) =>
                setServiceData({ ...serviceData, customizable: value })
              }
              trackColor={{ false: '#CCCCCC', true: '#90CAF9' }}
              thumbColor={serviceData.customizable ? '#2196F3' : '#F5F5F5'}
            />
          </View>
        </View>

        {serviceData.customizable && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Additional Options</Text>
              <TouchableOpacity
                style={styles.addOptionButton}
                onPress={() => setShowAddOption(true)}
              >
                <Icon name="plus" size={20} color="#2196F3" />
                <Text style={styles.addOptionButtonText}>Add Option</Text>
              </TouchableOpacity>
            </View>

            {showAddOption && (
              <View style={styles.newOptionForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Option Name</Text>
                  <TextInput
                    style={styles.input}
                    value={newOption.name}
                    onChangeText={(text) =>
                      setNewOption({ ...newOption, name: text })
                    }
                    placeholder="Enter option name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Price ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={newOption.price}
                    onChangeText={(text) =>
                      setNewOption({ ...newOption, price: text })
                    }
                    placeholder="Enter option price"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Unit</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newOption.unit}
                      onValueChange={(value) =>
                        setNewOption({ ...newOption, unit: value })
                      }
                    >
                      {optionUnits.map((unit) => (
                        <Picker.Item key={unit} label={unit} value={unit} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.optionActions}>
                  <TouchableOpacity
                    style={[styles.optionButton, styles.cancelButton]}
                    onPress={() => setShowAddOption(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.optionButton, styles.saveButton]}
                    onPress={handleAddOption}
                  >
                    <Text style={styles.saveButtonText}>Save Option</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {serviceData.options.map((option) => (
              <View key={option.id} style={styles.optionItem}>
                <View>
                  <Text style={styles.optionName}>{option.name}</Text>
                  <Text style={styles.optionPrice}>
                    ${option.price} {option.unit}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveOption(option.id)}
                >
                  <Icon name="trash-2" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Service</Text>
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
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666666',
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 4,
  },
  addOptionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  newOptionForm: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  optionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 12,
    color: '#666666',
  },
  removeButton: {
    padding: 8,
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

export default AddService;
