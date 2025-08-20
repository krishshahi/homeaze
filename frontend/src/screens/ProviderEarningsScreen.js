import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const ProviderEarningsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [earnings, setEarnings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const periods = [
    { key: 'thisWeek', label: 'This Week' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'last3Months', label: 'Last 3 Months' },
    { key: 'thisYear', label: 'This Year' },
  ];

  useEffect(() => {
    loadEarnings();
  }, [selectedPeriod]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      
      // Mock earnings data
      const mockEarnings = {
        thisWeek: {
          totalEarnings: 850.00,
          completedJobs: 12,
          averageJobValue: 70.83,
          growth: 15.5,
          pendingPayouts: 120.00,
        },
        thisMonth: {
          totalEarnings: 3200.00,
          completedJobs: 45,
          averageJobValue: 71.11,
          growth: 23.8,
          pendingPayouts: 450.00,
        },
        last3Months: {
          totalEarnings: 9600.00,
          completedJobs: 135,
          averageJobValue: 71.11,
          growth: 18.2,
          pendingPayouts: 0.00,
        },
        thisYear: {
          totalEarnings: 28500.00,
          completedJobs: 380,
          averageJobValue: 75.00,
          growth: 25.3,
          pendingPayouts: 450.00,
        },
      };

      const mockTransactions = [
        {
          id: '1',
          type: 'earning',
          amount: 120.00,
          description: 'House Cleaning - Sarah M.',
          date: '2024-01-15T14:30:00Z',
          status: 'completed',
          payoutDate: '2024-01-17T09:00:00Z',
        },
        {
          id: '2',
          type: 'earning',
          amount: 85.00,
          description: 'Plumbing Repair - Mike J.',
          date: '2024-01-14T10:15:00Z',
          status: 'completed',
          payoutDate: '2024-01-16T09:00:00Z',
        },
        {
          id: '3',
          type: 'fee',
          amount: -12.00,
          description: 'Platform Service Fee',
          date: '2024-01-14T10:15:00Z',
          status: 'completed',
          payoutDate: '2024-01-16T09:00:00Z',
        },
        {
          id: '4',
          type: 'earning',
          amount: 200.00,
          description: 'Garden Maintenance - Lisa K.',
          date: '2024-01-13T16:45:00Z',
          status: 'pending',
          payoutDate: null,
        },
        {
          id: '5',
          type: 'bonus',
          amount: 50.00,
          description: 'Customer Satisfaction Bonus',
          date: '2024-01-12T12:00:00Z',
          status: 'completed',
          payoutDate: '2024-01-14T09:00:00Z',
        },
      ];

      setEarnings(mockEarnings[selectedPeriod]);
      setTransactions(mockTransactions);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error loading earnings:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning': return '💰';
      case 'fee': return '📊';
      case 'bonus': return '🎁';
      default: return '💳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'failed': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive,
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEarningsOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📈 Earnings Overview</Text>
      
      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <Text style={styles.earningsAmount}>
            {formatCurrency(earnings.totalEarnings || 0)}
          </Text>
          <View style={[
            styles.growthBadge,
            { backgroundColor: earnings.growth >= 0 ? COLORS.success + '20' : COLORS.error + '20' }
          ]}>
            <Text style={[
              styles.growthText,
              { color: earnings.growth >= 0 ? COLORS.success : COLORS.error }
            ]}>
              {earnings.growth >= 0 ? '+' : ''}{earnings.growth}%
            </Text>
          </View>
        </View>
        
        <Text style={styles.earningsSubtitle}>Total earnings this period</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statValue}>{earnings.completedJobs || 0}</Text>
          <Text style={styles.statLabel}>Completed Jobs</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💵</Text>
          <Text style={styles.statValue}>
            {formatCurrency(earnings.averageJobValue || 0)}
          </Text>
          <Text style={styles.statLabel}>Average Job</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏳</Text>
          <Text style={styles.statValue}>
            {formatCurrency(earnings.pendingPayouts || 0)}
          </Text>
          <Text style={styles.statLabel}>Pending Payouts</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => {/* Navigate to payout settings */}}
        >
          <Text style={styles.actionIcon}>🏦</Text>
          <Text style={styles.actionTitle}>Payout Settings</Text>
          <Text style={styles.actionSubtitle}>Manage bank account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => {/* Navigate to tax documents */}}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionTitle}>Tax Documents</Text>
          <Text style={styles.actionSubtitle}>Download 1099s</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => {/* Navigate to earnings report */}}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionTitle}>Earnings Report</Text>
          <Text style={styles.actionSubtitle}>Export detailed report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => {/* Navigate to pricing tools */}}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionTitle}>Pricing Tools</Text>
          <Text style={styles.actionSubtitle}>Optimize your rates</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransactionHistory = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💳 Recent Transactions</Text>
        <TouchableOpacity onPress={() => {/* Navigate to full history */}}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={transactions.slice(0, 5)}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionIcon}>{getTransactionIcon(item.type)}</Text>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.date)}
            {item.payoutDate && ` • Paid ${formatDate(item.payoutDate)}`}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: item.amount > 0 ? COLORS.success : COLORS.error }
        ]}>
          {item.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(item.amount))}
        </Text>
        <View style={[
          styles.transactionStatus,
          { backgroundColor: getStatusColor(item.status) + '20' }
        ]}>
          <Text style={[
            styles.transactionStatusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {renderPeriodSelector()}
        {renderEarningsOverview()}
        {renderQuickActions()}
        {renderTransactionHistory()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },

  // Content
  scrollContent: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },

  // Period Selector
  periodSelector: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  periodButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textSecondary,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },

  // Earnings Overview
  earningsCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  growthBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  growthText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
  },
  earningsSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Transactions
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  transactionDate: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    marginBottom: SPACING.xs,
  },
  transactionStatus: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  transactionStatusText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
  },
});

export default ProviderEarningsScreen;
