import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';

import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { updateProfile, uploadAvatarThunk } from '../store/slices/userSlice';

const EditProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const { profile, loading: profileLoading, error: profileError } = useSelector((state) => state.user);
  const { user: authUser, isAuthenticated } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });
  const [errors, setErrors] = useState({});

  // Load user data from Redux state and route params
  useEffect(() => {
    const userData = route.params?.user || {};
    const combinedData = {
      ...profile,
      ...authUser,
      ...userData
    };
    
    // Parse name into first and last name if needed
    let firstName = combinedData.firstName || '';
    let lastName = combinedData.lastName || '';
    
    if (!firstName && !lastName && combinedData.name) {
      const nameParts = combinedData.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Parse address string if it's not an object
    let addressObj = { street: '', city: '', state: '', zipCode: '' };
    if (combinedData.address) {
      if (typeof combinedData.address === 'string') {
        const addressParts = combinedData.address.split(', ');
        addressObj.street = addressParts[0] || '';
        addressObj.city = addressParts[1] || '';
        if (addressParts[2]) {
          const stateZip = addressParts[2].split(' ');
          addressObj.state = stateZip[0] || '';
          addressObj.zipCode = stateZip[1] || '';
        }
      } else if (typeof combinedData.address === 'object') {
        addressObj = { ...addressObj, ...combinedData.address };
      }
    }
    
    setFormData({
      name: combinedData.name || `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email: combinedData.email || '',
      phone: combinedData.phone || combinedData.phoneNumber || '',
      bio: combinedData.bio || '',
      address: addressObj,
    });
    
    setAvatarUri(combinedData.avatar || null);
  }, [profile, authUser, route.params]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image picker functions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera roll permissions to let you upload profile pictures.'
      );
      return false;
    }
    return true;
  };

  const showImagePicker = () => {
    const options = [
      'Take Photo',
      'Choose from Library',
      'Cancel'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
        },
        handleImagePickerResponse
      );
    } else {
      Alert.alert(
        'Select Image',
        'Choose how you want to select a profile picture',
        [
          { text: 'Take Photo', onPress: () => handleImagePickerResponse(0) },
          { text: 'Choose from Library', onPress: () => handleImagePickerResponse(1) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleImagePickerResponse = async (buttonIndex) => {
    if (buttonIndex === 2) return; // Cancel

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    try {
      let result;
      if (buttonIndex === 0) {
        // Take photo
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        // Choose from library
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setAvatarUri(imageUri);
        
        // Upload avatar immediately
        try {
          setLoading(true);
          await dispatch(uploadAvatarThunk(imageUri)).unwrap();
          Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error) {
          console.error('Avatar upload error:', error);
          Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
          setAvatarUri(null); // Reset on error
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare profile data
      const profileUpdateData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
      };
      
      console.log('🔄 Updating profile with data:', profileUpdateData);
      
      // API call to update profile
      const response = await dispatch(updateProfile(profileUpdateData)).unwrap();
      
      console.log('✅ Profile updated successfully:', response);
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Profile update error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    // Handle nested address fields
    if (['street', 'city', 'state', 'zipCode'].includes(field)) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getFieldValue = (field) => {
    if (['street', 'city', 'state', 'zipCode'].includes(field)) {
      return formData.address[field] || '';
    }
    return formData[field] || '';
  };

  const InputField = ({ 
    label, 
    field, 
    placeholder, 
    multiline = false, 
    keyboardType = 'default',
    icon 
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {icon && <Ionicons name={icon} size={16} color={COLORS.primary} />} {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          errors[field] && styles.inputError
        ]}
        placeholder={placeholder}
        value={getFieldValue(field)}
        onChangeText={(value) => updateField(field, value)}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        placeholderTextColor={COLORS.textMuted}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: avatarUri || profile.avatar || authUser?.avatar || 'https://via.placeholder.com/120'
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton} onPress={showImagePicker}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <InputField
                label="First Name"
                field="firstName"
                placeholder="Enter first name"
                icon="person-outline"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
              <InputField
                label="Last Name"
                field="lastName"
                placeholder="Enter last name"
                icon="person-outline"
              />
            </View>
          </View>

          <InputField
            label="Email"
            field="email"
            placeholder="Enter email address"
            keyboardType="email-address"
            icon="mail-outline"
          />

          <InputField
            label="Phone Number"
            field="phone"
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            icon="call-outline"
          />

          <InputField
            label="Bio"
            field="bio"
            placeholder="Tell us about yourself..."
            multiline
            icon="create-outline"
          />
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          
          <InputField
            label="Street Address"
            field="street"
            placeholder="Enter street address"
            icon="location-outline"
          />

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <InputField
                label="City"
                field="city"
                placeholder="City"
                icon="business-outline"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
              <InputField
                label="State"
                field="state"
                placeholder="State"
                icon="map-outline"
              />
            </View>
          </View>

          <InputField
            label="ZIP Code"
            field="zipCode"
            placeholder="ZIP Code"
            keyboardType="numeric"
            icon="pin-outline"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={[styles.button, { marginRight: 10 }]}
          />
          <CustomButton
            title="Save Changes"
            onPress={handleSave}
            style={[styles.button, { marginLeft: 10 }]}
            disabled={loading}
          />
        </View>
      </ScrollView>

      {loading && <LoadingSpinner />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changePhotoText: {
    marginTop: 12,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 10,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 20,
  },
  button: {
    flex: 1,
  },
});

export default EditProfileScreen;
