import { useRoute } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import { COLORS } from '../constants/theme';

const ServiceAnalyticsScreen = () => {
  const route = useRoute();
  const { serviceId } = route.params || {};

  // Placeholder UI. In a follow-up, we can fetch real analytics once the backend route exists
  // e.g., providerServicesAPI.getServiceAnalytics(serviceId)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Service Analytics</Text>
      <Text style={styles.subtitle}>Service ID: {serviceId || 'Unknown'}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming soon</Text>
        <Text style={styles.cardText}>
          We will display bookings trend, revenue, ratings breakdown, and conversion metrics here.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tip</Text>
        <Text style={styles.cardText}>
          Make sure this service has recent bookings to see meaningful analytics.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ServiceAnalyticsScreen;

