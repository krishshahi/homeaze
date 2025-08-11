import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';
import { useAppDispatch, useAuth } from '../store/hooks';
import ServicesAPI from '../services/servicesApi';

const { width } = Dimensions.get('window');

const EnhancedProviderServiceCreateScreen = ({ route, navigation }) => {
  const { serviceId } = route.params || {};
  const isEditing = !!serviceId;
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    minDuration: '1',
    maxDuration: '8',
    availability: '',
    location: '',
    features: [],
    newFeature: '',
    requirements: '',
    cancellationPolicy: '24 hours',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('🏠');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  // Enhanced categories and icons
  const serviceCategories = [
    { id: 'cleaning', title: 'Cleaning Services', icon: '🧹', color: COLORS.info },
    { id: 'maintenance', title: 'Home Maintenance', icon: '🔧', color: COLORS.warning },
    { id: 'landscaping', title: 'Landscaping & Garden', icon: '🌱', color: COLORS.success },
    { id: 'plumbing', title: 'Plumbing', icon: '🚿', color: COLORS.info },
    { id: 'electrical', title: 'Electrical', icon: '⚡', color: COLORS.warning },
    { id: 'painting', title: 'Painting & Decoration', icon: '🎨', color: COLORS.secondary },
    { id: 'moving', title: 'Moving & Transportation', icon: '📦', color: COLORS.primary },
    { id: 'petcare', title: 'Pet Care', icon: '🐕', color: COLORS.success },
    { id: 'handyman', title: 'Handyman', icon: '🔨', color: COLORS.error },
    { id: 'tutoring', title: 'Tutoring & Education', icon: '📚', color: COLORS.info },
    { id: 'fitness', title: 'Fitness & Wellness', icon: '💪', color: COLORS.success },
    { id: 'photography', title: 'Photography', icon: '📸', color: COLORS.secondary },
  ];

  const availabilityOptions = [
    'Weekdays (Mon-Fri)',
    'Weekends (Sat-Sun)',
    'Full Week (Mon-Sun)',
    'Mornings (8 AM - 12 PM)',
    'Afternoons (12 PM - 6 PM)',
    'Evenings (6 PM - 10 PM)',
    '24/7 Available',
    'By Appointment Only',
  ];

  const cancellationPolicies = [
    { value: '2 hours', label: '2 hours notice' },
    { value: '24 hours', label: '24 hours notice' },
    { value: '48 hours', label: '48 hours notice' },
    { value: '1 week', label: '1 week notice' },
    { value: 'no refund', label: 'No refund policy' },
  ];

  useEffect(() => {
    startAnimations();
    if (isEditing) {
      loadServiceData();
    }
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.timing.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadServiceData = async () => {
    try {
      setLoading(true);
      const response = await ServicesAPI.getServiceById(serviceId);
      const service = response.service || response;

      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || '',
        price: service.price?.toString() || '',
        minDuration: service.minDuration?.toString() || '1',
        maxDuration: service.maxDuration?.toString() || '8',
        availability: service.availability || '',
        location: service.location || '',
        features: service.features || [],
        newFeature: '',
        requirements: service.requirements || '',
        cancellationPolicy: service.cancellationPolicy || '24 hours',
      });

      if (service.icon) {
        setSelectedIcon(service.icon);
      }
    } catch (error) {
      console.error('❌ Error loading service:', error);
      Alert.alert('Error', 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addFeature = () => {
    if (formData.newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, prev.newFeature.trim()],
        newFeature: '',
      }));
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Service name is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!formData.category) {
        newErrors.category = 'Please select a category';
      }
    }

    if (step === 2) {
      const price = parseFloat(formData.price);
      if (!price || price <= 0) {
        newErrors.price = 'Please enter a valid price';
      }
      if (!formData.availability) {
        newErrors.availability = 'Please select availability';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        // Animate step transition
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0.7, duration: 200, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    try {
      setLoading(true);
      console.log(`📝 ${isEditing ? 'Updating' : 'Creating'} service...`);

      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        icon: selectedIcon,
        price: parseFloat(formData.price),
        minDuration: parseInt(formData.minDuration) || 1,
        maxDuration: parseInt(formData.maxDuration) || 8,
        availability: formData.availability,
        location: formData.location.trim() || 'Service area',
        features: formData.features,
        requirements: formData.requirements.trim(),
        cancellationPolicy: formData.cancellationPolicy,
        providerId: user?.id,
        status: 'pending', // Services need approval
      };

      if (isEditing) {
        await ServicesAPI.updateService(serviceId, serviceData);
        Alert.alert(
          'Success!',
          'Service updated successfully! It will be reviewed before going live.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        await ServicesAPI.createService(serviceData);
        Alert.alert(
          'Success!',
          'Service created successfully! It will be reviewed before going live.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('❌ Error saving service:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} service`);
    } finally {
      setLoading(false);
    }
  };

  const IconPicker = () => {
    const icons = ['🏠', '🧹', '🔧', '🌱', '🚿', '⚡', '🎨', '📦', '🐕', '🔨', '📚', '💪', '📸', '🍳', '🚗', '🎵', '💻', '🏋️', '🎭', '🎪'];
    
    return (
      <Modal visible={showIconPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.iconPickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose an Icon</Text>
              <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.iconsGrid}>
              {icons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && styles.selectedIconOption
                  ]}
                  onPress={() => {
                    setSelectedIcon(icon);
                    setShowIconPicker(false);
                  }}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Basic Information</Text>

              <View style={styles.inputContainer}>
                <CustomInput
                  label="Service Name *"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholder="e.g., Professional House Cleaning"
                  variant="outlined"
                  error={errors.name}
                  maxLength={60}
                />
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  label="Description *"
                  value={formData.description}
                  onChangeText={(value) => updateFormData('description', value)}
                  placeholder="Describe your service in detail..."
                  variant="outlined"
                  multiline
                  numberOfLines={4}
                  error={errors.description}
                  maxLength={300}
                />
              </View>

              {/* Category Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {serviceCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        formData.category === category.id && styles.selectedCategoryOption,
                        { borderColor: category.color }
                      ]}
                      onPress={() => updateFormData('category', category.id)}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text style={[
                        styles.categoryText,
                        formData.category === category.id && { color: COLORS.white, fontWeight: FONTS.weightBold }
                      ]}>
                        {category.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>

              {/* Icon Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Service Icon</Text>
                <TouchableOpacity
                  style={styles.iconSelector}
                  onPress={() => setShowIconPicker(true)}
                >
                  <Text style={styles.selectedIcon}>{selectedIcon}</Text>
                  <Text style={styles.iconSelectorText}>Tap to change</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
            {/* Pricing & Availability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Pricing & Availability</Text>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <CustomInput
                    label="Price per Hour *"
                    value={formData.price}
                    onChangeText={(value) => updateFormData('price', value)}
                    placeholder="25.00"
                    variant="outlined"
                    keyboardType="numeric"
                    leftIcon={<Text style={styles.currencySymbol}>$</Text>}
                    error={errors.price}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: SPACING.sm }]}>
                  <CustomInput
                    label="Min Duration (hours)"
                    value={formData.minDuration}
                    onChangeText={(value) => updateFormData('minDuration', value)}
                    variant="outlined"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: SPACING.sm }]}>
                  <CustomInput
                    label="Max Duration (hours)"
                    value={formData.maxDuration}
                    onChangeText={(value) => updateFormData('maxDuration', value)}
                    variant="outlined"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Availability Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Availability *</Text>
                <View style={styles.availabilityGrid}>
                  {availabilityOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.availabilityOption,
                        formData.availability === option && styles.selectedAvailabilityOption
                      ]}
                      onPress={() => updateFormData('availability', option)}
                    >
                      <Text style={[
                        styles.availabilityText,
                        formData.availability === option && styles.selectedAvailabilityText
                      ]}>
                        {option}
                      </Text>
                      {formData.availability === option && (
                        <Ionicons name="checkmark" size={16} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.availability && <Text style={styles.errorText}>{errors.availability}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  label="Service Location"
                  value={formData.location}
                  onChangeText={(value) => updateFormData('location', value)}
                  placeholder="e.g., Downtown area, Within 10 miles"
                  variant="outlined"
                />
              </View>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
            {/* Additional Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚙️ Additional Details</Text>

              {/* Service Features */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Service Features</Text>
                <View style={styles.addFeatureRow}>
                  <CustomInput
                    value={formData.newFeature}
                    onChangeText={(value) => updateFormData('newFeature', value)}
                    placeholder="e.g., Eco-friendly products, Licensed & Insured"
                    variant="outlined"
                    style={{ flex: 1 }}
                  />
                  <CustomButton
                    title="Add"
                    variant="secondary"
                    size="small"
                    onPress={addFeature}
                    style={styles.addFeatureButton}
                  />
                </View>
                {formData.features.length > 0 && (
                  <View style={styles.featuresContainer}>
                    {formData.features.map((feature, index) => (
                      <View key={index} style={styles.featureTag}>
                        <Text style={styles.featureText}>{feature}</Text>
                        <TouchableOpacity
                          onPress={() => removeFeature(index)}
                          style={styles.removeFeatureButton}
                        >
                          <Ionicons name="close" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <CustomInput
                  label="Requirements (Optional)"
                  value={formData.requirements}
                  onChangeText={(value) => updateFormData('requirements', value)}
                  placeholder="Any specific requirements or preparations needed..."
                  variant="outlined"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Cancellation Policy */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Cancellation Policy</Text>
                <View style={styles.policyGrid}>
                  {cancellationPolicies.map((policy) => (
                    <TouchableOpacity
                      key={policy.value}
                      style={[
                        styles.policyOption,
                        formData.cancellationPolicy === policy.value && styles.selectedPolicyOption
                      ]}
                      onPress={() => updateFormData('cancellationPolicy', policy.value)}
                    >
                      <Text style={[
                        styles.policyText,
                        formData.cancellationPolicy === policy.value && styles.selectedPolicyText
                      ]}>
                        {policy.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Enhanced Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <LinearGradient
          colors={COLORS.gradientSecondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {isEditing ? 'Edit Service' : 'Create Service'}
              </Text>
              <Text style={styles.headerSubtitle}>
                Step {currentStep} of 3 - {
                  currentStep === 1 ? 'Basic Info' :
                  currentStep === 2 ? 'Pricing' : 'Details'
                }
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / 3) * 100}%` }
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Form Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {currentStep > 1 && (
          <CustomButton
            title="Previous"
            variant="outline"
            onPress={() => setCurrentStep(currentStep - 1)}
            style={styles.previousButton}
          />
        )}
        <CustomButton
          title={currentStep === 3 ? (isEditing ? 'Update Service' : 'Create Service') : 'Next'}
          variant="primary"
          onPress={handleNext}
          loading={loading}
          style={styles.nextButton}
          icon={currentStep === 3 ? (
            <Ionicons name="checkmark" size={20} color={COLORS.white} />
          ) : (
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          )}
        />
      </View>

      <IconPicker />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Enhanced Header
  headerContainer: {
    overflow: 'hidden',
  },

  headerGradient: {
    paddingBottom: SPACING.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },

  backButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: FONTS.h2,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },

  headerSubtitle: {
    fontSize: FONTS.body2,
    color: COLORS.white + 'CC',
    fontWeight: FONTS.weightMedium,
  },

  // Progress Bar
  progressContainer: {
    paddingHorizontal: SPACING.lg,
  },

  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },

  // Content
  scrollContent: {
    flex: 1,
  },

  stepContent: {
    padding: SPACING.lg,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  inputContainer: {
    marginBottom: SPACING.lg,
  },

  inputLabel: {
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  currencySymbol: {
    fontSize: FONTS.body1,
    fontWeight: FONTS.weightBold,
    color: COLORS.textSecondary,
  },

  errorText: {
    fontSize: FONTS.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },

  // Category Selection
  categoryScroll: {
    marginVertical: SPACING.sm,
  },

  categoryOption: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 120,
    ...SHADOWS.light,
  },

  selectedCategoryOption: {
    backgroundColor: COLORS.primary,
  },

  categoryIcon: {
    fontSize: FONTS.xl,
    marginBottom: SPACING.xs,
  },

  categoryText: {
    fontSize: FONTS.caption,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Icon Selection
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  selectedIcon: {
    fontSize: FONTS.xxl,
    marginRight: SPACING.lg,
  },

  iconSelectorText: {
    flex: 1,
    fontSize: FONTS.body2,
    color: COLORS.textSecondary,
  },

  // Availability Grid
  availabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  availabilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: '47%',
  },

  selectedAvailabilityOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  availabilityText: {
    fontSize: FONTS.body3,
    color: COLORS.textPrimary,
    flex: 1,
  },

  selectedAvailabilityText: {
    color: COLORS.white,
    fontWeight: FONTS.weightSemiBold,
  },

  // Features
  addFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },

  addFeatureButton: {
    paddingHorizontal: SPACING.lg,
  },

  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },

  featureText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weightMedium,
    marginRight: SPACING.sm,
  },

  removeFeatureButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.round,
    padding: 2,
  },

  // Policy Grid
  policyGrid: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  policyOption: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  selectedPolicyOption: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },

  policyText: {
    fontSize: FONTS.body3,
    color: COLORS.textPrimary,
  },

  selectedPolicyText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
    ...SHADOWS.light,
  },

  previousButton: {
    flex: 1,
  },

  nextButton: {
    flex: 2,
  },

  // Icon Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconPickerModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: width * 0.9,
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },

  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },

  iconOption: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  selectedIconOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },

  iconOptionText: {
    fontSize: FONTS.xxl,
  },
});

export default EnhancedProviderServiceCreateScreen;
