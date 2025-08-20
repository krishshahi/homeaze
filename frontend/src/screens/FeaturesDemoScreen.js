import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth, useAppDispatch } from '../store/hooks';

const FeaturesDemoScreen = ({ navigation }) => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});

  // Test API endpoints
  const testFeature = async (featureName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [featureName]: { status: 'success', data: result }
      }));
      Alert.alert('Success', `${featureName} test completed successfully!`);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [featureName]: { status: 'error', error: error.message }
      }));
      Alert.alert('Error', `${featureName} test failed: ${error.message}`);
    }
    setLoading(false);
  };

  const FeatureCard = ({ title, subtitle, icon, onPress, status }) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View style={styles.featureCardHeader}>
        <View style={styles.featureCardIcon}>
          <Text style={styles.featureCardIconText}>{icon}</Text>
        </View>
        <View style={styles.featureCardInfo}>
          <Text style={styles.featureCardTitle}>{title}</Text>
          <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{getStatusIcon(status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      default: return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  // Demo features
  const demoFeatures = [
    {
      title: 'Security Features',
      subtitle: 'MFA, Sessions, Social Login',
      icon: '🔐',
      onPress: () => navigation.navigate('SecuritySettings'),
      category: 'Security'
    },
    {
      title: 'Services API',
      subtitle: 'Browse and search services',
      icon: '🛠️',
      onPress: () => testFeature('Services API', async () => {
        const result = await fetch('http://192.168.1.129:3001/api/services');
        return await result.json();
      }),
      category: 'API'
    },
    {
      title: 'Real-time Notifications',
      subtitle: 'Push, Email, SMS notifications',
      icon: '🔔',
      onPress: () => testFeature('Notifications', async () => {
        const result = await fetch('http://192.168.1.129:3001/api/notifications');
        return await result.json();
      }),
      category: 'Real-time'
    },
    {
      title: 'Payment System',
      subtitle: 'Multiple gateways, subscriptions',
      icon: '💳',
      onPress: () => testFeature('Payment System', async () => {
        const result = await fetch('http://192.168.1.129:3001/api/payments/stats');
        return await result.json();
      }),
      category: 'Payments'
    },
    {
      title: 'AI Analytics',
      subtitle: 'ML recommendations, insights',
      icon: '🤖',
      onPress: () => testFeature('AI Analytics', async () => {
        const result = await fetch('http://192.168.1.129:3001/api/analytics/overview');
        return await result.json();
      }),
      category: 'AI'
    },
    {
      title: 'Chat System',
      subtitle: 'Real-time messaging',
      icon: '💬',
      onPress: () => testFeature('Chat System', async () => {
        const result = await fetch('http://192.168.1.129:3001/api/chat/conversations');
        return await result.json();
      }),
      category: 'Communication'
    },
    {
      title: 'Location Services',
      subtitle: 'Maps, geocoding, demographics',
      icon: '📍',
      onPress: () => Alert.alert('Location Services', 'Interactive maps and location features available!'),
      category: 'Location'
    },
    {
      title: 'Provider Tools',
      subtitle: 'Business dashboard, analytics',
      icon: '👨‍💼',
      onPress: () => Alert.alert('Provider Tools', 'Advanced provider management features available!'),
      category: 'Business'
    }
  ];

  const SecurityDashboard = () => (
    <View style={styles.securityDashboard}>
      <Text style={styles.sectionTitle}>🔐 Security Status</Text>
      <View style={styles.securityGrid}>
        <View style={styles.securityItem}>
          <Text style={styles.securityIcon}>🛡️</Text>
          <Text style={styles.securityLabel}>MFA</Text>
          <Text style={styles.securityStatus}>Available</Text>
        </View>
        <View style={styles.securityItem}>
          <Text style={styles.securityIcon}>📱</Text>
          <Text style={styles.securityLabel}>Sessions</Text>
          <Text style={styles.securityStatus}>Active</Text>
        </View>
        <View style={styles.securityItem}>
          <Text style={styles.securityIcon}>🔗</Text>
          <Text style={styles.securityLabel}>Social Login</Text>
          <Text style={styles.securityStatus}>Ready</Text>
        </View>
        <View style={styles.securityItem}>
          <Text style={styles.securityIcon}>🚨</Text>
          <Text style={styles.securityLabel}>Monitoring</Text>
          <Text style={styles.securityStatus}>Active</Text>
        </View>
      </View>
    </View>
  );

  const APIStatus = () => (
    <View style={styles.apiStatus}>
      <Text style={styles.sectionTitle}>⚡ Backend Services Status</Text>
      <View style={styles.statusList}>
        {[
          { name: 'Authentication', status: 'active' },
          { name: 'Services', status: 'active' },
          { name: 'Bookings', status: 'active' },
          { name: 'Payments', status: 'active' },
          { name: 'Notifications', status: 'active' },
          { name: 'Analytics', status: 'active' },
          { name: 'Chat', status: 'active' },
          { name: 'Location', status: 'active' },
        ].map((service, index) => (
          <View key={index} style={styles.statusItem}>
            <Text style={styles.statusDot}>🟢</Text>
            <Text style={styles.statusName}>{service.name}</Text>
            <Text style={styles.statusValue}>Running</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Features Demo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>🚀 Enhanced Homeaze Platform</Text>
          <Text style={styles.welcomeSubtitle}>
            Experience all the new features and improvements we've implemented
          </Text>
        </View>

        {/* Security Dashboard */}
        <SecurityDashboard />

        {/* API Status */}
        <APIStatus />

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>🎯 Available Features</Text>
          {demoFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              subtitle={feature.subtitle}
              icon={feature.icon}
              onPress={feature.onPress}
              status={testResults[feature.title]?.status}
            />
          ))}
        </View>

        {/* What's New Section */}
        <View style={styles.whatsNewSection}>
          <Text style={styles.sectionTitle}>✨ What's New</Text>
          <View style={styles.newFeaturesList}>
            {[
              'Multi-factor Authentication (MFA)',
              'Real-time WebSocket notifications',
              'Advanced payment processing',
              'AI-powered recommendations',
              'Interactive maps integration',
              'Session management dashboard',
              'Social login (Google, Facebook)',
              'Professional security features',
              'Enhanced booking system',
              'Provider analytics dashboard'
            ].map((feature, index) => (
              <View key={index} style={styles.newFeatureItem}>
                <Text style={styles.newFeatureIcon}>⭐</Text>
                <Text style={styles.newFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SecuritySettings')}
          >
            <Text style={styles.primaryButtonText}>Explore Security Features</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Services')}
          >
            <Text style={styles.secondaryButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Testing feature...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  welcomeTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  welcomeSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.white + 'CC',
    lineHeight: 22,
  },
  securityDashboard: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  securityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  securityItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
  },
  securityIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  securityLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  securityStatus: {
    fontSize: FONTS.xs,
    color: COLORS.success,
    fontWeight: FONTS.weightBold,
  },
  apiStatus: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  statusList: {
    gap: SPACING.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusDot: {
    fontSize: 12,
  },
  statusName: {
    flex: 1,
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
  },
  statusValue: {
    fontSize: FONTS.xs,
    color: COLORS.success,
    fontWeight: FONTS.weightBold,
  },
  featuresSection: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  featureCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCardIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  featureCardIconText: {
    fontSize: 20,
  },
  featureCardInfo: {
    flex: 1,
  },
  featureCardTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
  },
  featureCardSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
  },
  whatsNewSection: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  newFeaturesList: {
    gap: SPACING.sm,
  },
  newFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  newFeatureIcon: {
    fontSize: 16,
  },
  newFeatureText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
  },
  ctaSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.primary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.white,
  },
});

export default FeaturesDemoScreen;
