import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import ServiceFlowTester from '../utils/testServiceFlow';

const ServiceFlowTestButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await ServiceFlowTester.runFullTest();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        success: false,
        message: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearData = async () => {
    Alert.alert(
      'Clear Test Data',
      'This will remove all test data from storage. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await ServiceFlowTester.clearTestData();
            setTestResults(null);
            Alert.alert('Success', 'Test data cleared successfully');
          }
        }
      ]
    );
  };

  const seedDataOnly = async () => {
    setIsRunning(true);
    try {
      const result = await ServiceFlowTester.seedTestData();
      Alert.alert(
        result.success ? 'Success' : 'Error',
        result.message
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.testButtonText}>🧪 Test Service Flow</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Service Flow Testing</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={runTests}
                disabled={isRunning}
              >
                <Text style={styles.actionButtonText}>
                  {isRunning ? '🔄 Running Tests...' : '🚀 Run Full Test Suite'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={seedDataOnly}
                disabled={isRunning}
              >
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                  🌱 Seed Test Data Only
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={clearData}
                disabled={isRunning}
              >
                <Text style={styles.actionButtonText}>
                  🧹 Clear Test Data
                </Text>
              </TouchableOpacity>
            </View>

            {testResults && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>
                  {testResults.success ? '✅ Test Results' : '❌ Test Failed'}
                </Text>
                
                {testResults.success ? (
                  <View style={styles.successResults}>
                    <Text style={styles.resultText}>
                      📊 Providers: {testResults.totalProviders}
                    </Text>
                    <Text style={styles.resultText}>
                      👥 Customers: {testResults.totalCustomers}
                    </Text>
                    <Text style={styles.resultText}>
                      🛍️ Total Services: {testResults.totalServices}
                    </Text>
                    <Text style={styles.resultText}>
                      ✅ Active Services: {testResults.activeServices}
                    </Text>
                    <Text style={styles.resultText}>
                      👁️ Service Visibility: {testResults.serviceVisibility}
                    </Text>
                    <Text style={styles.resultText}>
                      📂 Categories: {testResults.categories}
                    </Text>
                    <Text style={styles.resultText}>
                      💰 Price Range: ${testResults.priceRange.min} - ${testResults.priceRange.max}
                    </Text>

                    <View style={styles.successBadge}>
                      <Text style={styles.successBadgeText}>
                        🎉 All provider services are available to customers!
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.errorResults}>
                    <Text style={styles.errorText}>{testResults.message}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>📋 What this test does:</Text>
              <Text style={styles.infoText}>
                • Seeds the app with mock provider and customer data
              </Text>
              <Text style={styles.infoText}>
                • Creates 4 sample services from 3 providers
              </Text>
              <Text style={styles.infoText}>
                • Tests provider login and service management
              </Text>
              <Text style={styles.infoText}>
                • Tests customer login and service browsing
              </Text>
              <Text style={styles.infoText}>
                • Verifies services are visible across user types
              </Text>
              <Text style={styles.infoText}>
                • Tests search, filtering, and discovery features
              </Text>
            </View>

            <View style={styles.warningSection}>
              <Text style={styles.warningTitle}>⚠️ Important Notes:</Text>
              <Text style={styles.warningText}>
                • This adds mock data to your app storage
              </Text>
              <Text style={styles.warningText}>
                • Use "Clear Test Data" when done testing
              </Text>
              <Text style={styles.warningText}>
                • Test data will persist until manually cleared
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  testButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
    zIndex: 1000,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },

  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },

  buttonGroup: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },

  resultsContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  resultsTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  successResults: {
    gap: SPACING.sm,
  },
  resultText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  successBadge: {
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  successBadgeText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.successDark,
    textAlign: 'center',
  },
  errorResults: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  errorText: {
    fontSize: FONTS.md,
    color: COLORS.errorDark,
  },

  infoSection: {
    backgroundColor: COLORS.infoLight + '20',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  warningSection: {
    backgroundColor: COLORS.warningLight + '20',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  warningTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});

export default ServiceFlowTestButton;
