// QuoteForm Component - Quote Creation and Editing Form
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const QuoteForm = ({
  quote = null, // For editing existing quote
  service,
  provider,
  customer,
  onSubmit,
  onCancel,
  loading = false,
  style
}) => {
  // Form state
  const [formData, setFormData] = useState({
    // Service details
    serviceTitle: '',
    serviceDescription: '',
    serviceCategory: '',
    
    // Pricing
    basePrice: '',
    materialsCost: '',
    laborCost: '',
    additionalCharges: [],
    discountAmount: '',
    discountType: 'amount', // 'amount' or 'percentage'
    taxAmount: '',
    
    // Timeline
    estimatedDuration: '',
    preferredStartDate: new Date(),
    estimatedCompletionDate: new Date(),
    availableStartDate: new Date(),
    availableEndDate: new Date(),
    
    // Terms and conditions
    paymentTerms: 'full_upfront', // 'full_upfront', 'partial_upfront', 'on_completion'
    paymentSchedule: [],
    warrantyPeriod: '',
    cancellationPolicy: '',
    additionalTerms: '',
    
    // Validity
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    
    // Notes
    providerNotes: '',
    internalNotes: '',
    
    // Flags
    isFixedPrice: true,
    includesTax: false,
    requiresDeposit: false,
    requiresInsurance: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(null);
  const [additionalChargeModal, setAdditionalChargeModal] = useState(false);
  const [newCharge, setNewCharge] = useState({ description: '', amount: '' });
  const [errors, setErrors] = useState({});

  // Initialize form with existing quote data
  useEffect(() => {
    if (quote) {
      setFormData({
        serviceTitle: quote.serviceDetails?.title || '',
        serviceDescription: quote.serviceDetails?.description || '',
        serviceCategory: quote.serviceDetails?.category || '',
        
        basePrice: quote.pricing?.basePrice?.toString() || '',
        materialsCost: quote.pricing?.materialsCost?.toString() || '',
        laborCost: quote.pricing?.laborCost?.toString() || '',
        additionalCharges: quote.pricing?.additionalCharges || [],
        discountAmount: quote.pricing?.discountAmount?.toString() || '',
        discountType: quote.pricing?.discountType || 'amount',
        taxAmount: quote.pricing?.taxAmount?.toString() || '',
        
        estimatedDuration: quote.timeline?.estimatedDuration || '',
        preferredStartDate: quote.timeline?.preferredStartDate ? new Date(quote.timeline.preferredStartDate) : new Date(),
        estimatedCompletionDate: quote.timeline?.estimatedCompletionDate ? new Date(quote.timeline.estimatedCompletionDate) : new Date(),
        availableStartDate: quote.timeline?.availableStartDate ? new Date(quote.timeline.availableStartDate) : new Date(),
        availableEndDate: quote.timeline?.availableEndDate ? new Date(quote.timeline.availableEndDate) : new Date(),
        
        paymentTerms: quote.terms?.paymentTerms || 'full_upfront',
        paymentSchedule: quote.terms?.paymentSchedule || [],
        warrantyPeriod: quote.terms?.warrantyPeriod || '',
        cancellationPolicy: quote.terms?.cancellationPolicy || '',
        additionalTerms: quote.terms?.additionalTerms || '',
        
        validUntil: quote.validUntil ? new Date(quote.validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        
        providerNotes: quote.notes?.filter(n => n.type === 'provider')[0]?.content || '',
        internalNotes: quote.notes?.filter(n => n.type === 'internal')[0]?.content || '',
        
        isFixedPrice: quote.pricing?.isFixedPrice !== false,
        includesTax: quote.pricing?.includesTax || false,
        requiresDeposit: quote.terms?.requiresDeposit || false,
        requiresInsurance: quote.terms?.requiresInsurance || false,
      });
    } else if (service) {
      // Pre-fill from service data
      setFormData(prev => ({
        ...prev,
        serviceTitle: service.title || '',
        serviceDescription: service.description || '',
        serviceCategory: service.category || '',
        basePrice: service.basePrice?.toString() || '',
        estimatedDuration: service.estimatedDuration || '',
      }));
    }
  }, [quote, service]);

  // Calculate total amount
  const calculateTotal = () => {
    const basePrice = parseFloat(formData.basePrice) || 0;
    const materialsCost = parseFloat(formData.materialsCost) || 0;
    const laborCost = parseFloat(formData.laborCost) || 0;
    const additionalChargesTotal = formData.additionalCharges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
    
    let subtotal = basePrice + materialsCost + laborCost + additionalChargesTotal;
    
    // Apply discount
    if (formData.discountAmount) {
      const discount = parseFloat(formData.discountAmount) || 0;
      if (formData.discountType === 'percentage') {
        subtotal -= (subtotal * discount / 100);
      } else {
        subtotal -= discount;
      }
    }
    
    // Add tax
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    const total = subtotal + taxAmount;
    
    return { subtotal, total };
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.serviceTitle.trim()) {
      newErrors.serviceTitle = 'Service title is required';
    }

    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Valid base price is required';
    }

    if (!formData.estimatedDuration.trim()) {
      newErrors.estimatedDuration = 'Estimated duration is required';
    }

    if (formData.preferredStartDate >= formData.estimatedCompletionDate) {
      newErrors.estimatedCompletionDate = 'Completion date must be after start date';
    }

    if (formData.validUntil <= new Date()) {
      newErrors.validUntil = 'Valid until date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    const { subtotal, total } = calculateTotal();
    
    const quoteData = {
      serviceDetails: {
        title: formData.serviceTitle,
        description: formData.serviceDescription,
        category: formData.serviceCategory,
      },
      
      pricing: {
        basePrice: parseFloat(formData.basePrice),
        materialsCost: parseFloat(formData.materialsCost) || 0,
        laborCost: parseFloat(formData.laborCost) || 0,
        additionalCharges: formData.additionalCharges,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        discountType: formData.discountType,
        taxAmount: parseFloat(formData.taxAmount) || 0,
        subtotal,
        totalAmount: total,
        isFixedPrice: formData.isFixedPrice,
        includesTax: formData.includesTax,
      },
      
      timeline: {
        estimatedDuration: formData.estimatedDuration,
        preferredStartDate: formData.preferredStartDate.toISOString(),
        estimatedCompletionDate: formData.estimatedCompletionDate.toISOString(),
        availableStartDate: formData.availableStartDate.toISOString(),
        availableEndDate: formData.availableEndDate.toISOString(),
      },
      
      terms: {
        paymentTerms: formData.paymentTerms,
        paymentSchedule: formData.paymentSchedule,
        warrantyPeriod: formData.warrantyPeriod,
        cancellationPolicy: formData.cancellationPolicy,
        additionalTerms: formData.additionalTerms,
        requiresDeposit: formData.requiresDeposit,
        requiresInsurance: formData.requiresInsurance,
      },
      
      validUntil: formData.validUntil.toISOString(),
      
      notes: [
        ...(formData.providerNotes ? [{
          type: 'provider',
          content: formData.providerNotes,
          author: provider?.id,
          timestamp: new Date().toISOString()
        }] : []),
        ...(formData.internalNotes ? [{
          type: 'internal',
          content: formData.internalNotes,
          author: provider?.id,
          timestamp: new Date().toISOString()
        }] : []),
      ],
    };

    onSubmit && onSubmit(quoteData);
  };

  // Handle additional charge addition
  const handleAddCharge = () => {
    if (!newCharge.description.trim() || !newCharge.amount) {
      Alert.alert('Error', 'Please provide both description and amount for the additional charge.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      additionalCharges: [...prev.additionalCharges, {
        description: newCharge.description,
        amount: parseFloat(newCharge.amount),
        id: Date.now().toString()
      }]
    }));

    setNewCharge({ description: '', amount: '' });
    setAdditionalChargeModal(false);
  };

  // Remove additional charge
  const handleRemoveCharge = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalCharges: prev.additionalCharges.filter((_, i) => i !== index)
    }));
  };

  // Handle date picker
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData[showDatePicker];
    
    setFormData(prev => ({
      ...prev,
      [showDatePicker]: currentDate
    }));
    
    setShowDatePicker(null);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const { subtotal, total } = calculateTotal();

  return (
    <View style={[styles.container, style]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primary + 'CC']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>
            {quote ? 'Edit Quote' : 'Create Quote'}
          </Text>
          {service && (
            <Text style={styles.headerSubtitle}>
              for {service.title}
            </Text>
          )}
        </LinearGradient>

        {/* Service Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Service Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Service Title *</Text>
            <TextInput
              style={[styles.textInput, errors.serviceTitle && styles.errorInput]}
              value={formData.serviceTitle}
              onChangeText={(text) => setFormData(prev => ({ ...prev, serviceTitle: text }))}
              placeholder="Enter service title"
            />
            {errors.serviceTitle && <Text style={styles.errorText}>{errors.serviceTitle}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Service Description</Text>
            <TextInput
              style={[styles.textAreaInput]}
              value={formData.serviceDescription}
              onChangeText={(text) => setFormData(prev => ({ ...prev, serviceDescription: text }))}
              placeholder="Describe the service details..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.textInput}
              value={formData.serviceCategory}
              onChangeText={(text) => setFormData(prev => ({ ...prev, serviceCategory: text }))}
              placeholder="Service category"
            />
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pricing</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Fixed Price Quote</Text>
            <Switch
              value={formData.isFixedPrice}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isFixedPrice: value }))}
              trackColor={{ false: COLORS.textMuted, true: COLORS.primary }}
              thumbColor={formData.isFixedPrice ? COLORS.white : COLORS.backgroundSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Base Price * ($)</Text>
            <TextInput
              style={[styles.textInput, errors.basePrice && styles.errorInput]}
              value={formData.basePrice}
              onChangeText={(text) => setFormData(prev => ({ ...prev, basePrice: text }))}
              placeholder="0.00"
              keyboardType="numeric"
            />
            {errors.basePrice && <Text style={styles.errorText}>{errors.basePrice}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Materials Cost ($)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.materialsCost}
                onChangeText={(text) => setFormData(prev => ({ ...prev, materialsCost: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Labor Cost ($)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.laborCost}
                onChangeText={(text) => setFormData(prev => ({ ...prev, laborCost: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Additional Charges */}
          <View style={styles.inputGroup}>
            <View style={styles.chargeHeader}>
              <Text style={styles.inputLabel}>Additional Charges</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setAdditionalChargeModal(true)}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            
            {formData.additionalCharges.map((charge, index) => (
              <View key={index} style={styles.chargeItem}>
                <View style={styles.chargeInfo}>
                  <Text style={styles.chargeDescription}>{charge.description}</Text>
                  <Text style={styles.chargeAmount}>{formatCurrency(charge.amount)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveCharge(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Discount */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.twoThirds]}>
              <Text style={styles.inputLabel}>Discount Amount</Text>
              <TextInput
                style={styles.textInput}
                value={formData.discountAmount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, discountAmount: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.oneThird]}>
              <Text style={styles.inputLabel}>Type</Text>
              <TouchableOpacity
                style={styles.discountTypeButton}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  discountType: prev.discountType === 'amount' ? 'percentage' : 'amount' 
                }))}
              >
                <Text style={styles.discountTypeText}>
                  {formData.discountType === 'amount' ? '$' : '%'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tax */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Tax Amount ($)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.taxAmount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, taxAmount: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Tax Included</Text>
                <Switch
                  value={formData.includesTax}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, includesTax: value }))}
                  trackColor={{ false: COLORS.textMuted, true: COLORS.primary }}
                  thumbColor={formData.includesTax ? COLORS.white : COLORS.backgroundSecondary}
                />
              </View>
            </View>
          </View>

          {/* Pricing Summary */}
          <View style={styles.pricingSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Timeline</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estimated Duration *</Text>
            <TextInput
              style={[styles.textInput, errors.estimatedDuration && styles.errorInput]}
              value={formData.estimatedDuration}
              onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedDuration: text }))}
              placeholder="e.g., 2-3 hours, 1 day, 1 week"
            />
            {errors.estimatedDuration && <Text style={styles.errorText}>{errors.estimatedDuration}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Preferred Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker('preferredStartDate')}
              >
                <Text style={styles.dateButtonText}>
                  {formData.preferredStartDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Estimated Completion</Text>
              <TouchableOpacity
                style={[styles.dateButton, errors.estimatedCompletionDate && styles.errorInput]}
                onPress={() => setShowDatePicker('estimatedCompletionDate')}
              >
                <Text style={styles.dateButtonText}>
                  {formData.estimatedCompletionDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {errors.estimatedCompletionDate && <Text style={styles.errorText}>{errors.estimatedCompletionDate}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quote Valid Until</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.validUntil && styles.errorInput]}
              onPress={() => setShowDatePicker('validUntil')}
            >
              <Text style={styles.dateButtonText}>
                {formData.validUntil.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {errors.validUntil && <Text style={styles.errorText}>{errors.validUntil}</Text>}
          </View>
        </View>

        {/* Terms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Terms & Conditions</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Terms</Text>
            <View style={styles.paymentTermsContainer}>
              {[
                { key: 'full_upfront', label: 'Full Payment Upfront' },
                { key: 'partial_upfront', label: 'Partial Payment Upfront' },
                { key: 'on_completion', label: 'Payment on Completion' }
              ].map(term => (
                <TouchableOpacity
                  key={term.key}
                  style={[
                    styles.paymentTermButton,
                    formData.paymentTerms === term.key && styles.activePaymentTerm
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, paymentTerms: term.key }))}
                >
                  <Text style={[
                    styles.paymentTermText,
                    formData.paymentTerms === term.key && styles.activePaymentTermText
                  ]}>
                    {term.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Requires Deposit</Text>
              <Switch
                value={formData.requiresDeposit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, requiresDeposit: value }))}
                trackColor={{ false: COLORS.textMuted, true: COLORS.primary }}
                thumbColor={formData.requiresDeposit ? COLORS.white : COLORS.backgroundSecondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Insurance Required</Text>
              <Switch
                value={formData.requiresInsurance}
                onValueChange={(value) => setFormData(prev => ({ ...prev, requiresInsurance: value }))}
                trackColor={{ false: COLORS.textMuted, true: COLORS.primary }}
                thumbColor={formData.requiresInsurance ? COLORS.white : COLORS.backgroundSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Warranty Period</Text>
            <TextInput
              style={styles.textInput}
              value={formData.warrantyPeriod}
              onChangeText={(text) => setFormData(prev => ({ ...prev, warrantyPeriod: text }))}
              placeholder="e.g., 30 days, 6 months, 1 year"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cancellation Policy</Text>
            <TextInput
              style={styles.textAreaInput}
              value={formData.cancellationPolicy}
              onChangeText={(text) => setFormData(prev => ({ ...prev, cancellationPolicy: text }))}
              placeholder="Describe cancellation terms..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Terms</Text>
            <TextInput
              style={styles.textAreaInput}
              value={formData.additionalTerms}
              onChangeText={(text) => setFormData(prev => ({ ...prev, additionalTerms: text }))}
              placeholder="Any additional terms and conditions..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notes</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Provider Notes</Text>
            <TextInput
              style={styles.textAreaInput}
              value={formData.providerNotes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, providerNotes: text }))}
              placeholder="Notes visible to customer..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Internal Notes</Text>
            <TextInput
              style={styles.textAreaInput}
              value={formData.internalNotes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, internalNotes: text }))}
              placeholder="Internal notes (not visible to customer)..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : (quote ? 'Update Quote' : 'Create Quote')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData[showDatePicker]}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={showDatePicker === 'validUntil' ? new Date() : undefined}
        />
      )}

      {/* Additional Charge Modal */}
      <Modal
        visible={additionalChargeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAdditionalChargeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Additional Charge</Text>
            
            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textInput}
                value={newCharge.description}
                onChangeText={(text) => setNewCharge(prev => ({ ...prev, description: text }))}
                placeholder="Charge description"
              />
            </View>
            
            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>Amount ($)</Text>
              <TextInput
                style={styles.textInput}
                value={newCharge.amount}
                onChangeText={(text) => setNewCharge(prev => ({ ...prev, amount: text }))}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setAdditionalChargeModal(false);
                  setNewCharge({ description: '', amount: '' });
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddCharge}
              >
                <Text style={styles.modalAddText}>Add Charge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.white + 'CC',
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONTS.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  oneThird: {
    flex: 1,
  },
  twoThirds: {
    flex: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  switchLabel: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  chargeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  chargeInfo: {
    flex: 1,
  },
  chargeDescription: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  chargeAmount: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
  removeButton: {
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  discountTypeButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  discountTypeText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  pricingSummary: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  paymentTermsContainer: {
    gap: SPACING.sm,
  },
  paymentTermButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  activePaymentTerm: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentTermText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  activePaymentTermText: {
    color: COLORS.white,
    fontWeight: FONTS.weightMedium,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textMuted,
  },
  submitButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
  },
  submitButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.textPrimary + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.lg,
    width: '90%',
    ...SHADOWS.heavy,
  },
  modalTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalInputGroup: {
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FONTS.md,
    color: COLORS.textMuted,
  },
  modalAddButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalAddText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
});

export default QuoteForm;
