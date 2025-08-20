import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { EARNINGS_PERIOD } from '../../constants/provider';

const ProviderEarnings = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState(EARNINGS_PERIOD.MONTH);

  const mockData = {
    earnings: {
      [EARNINGS_PERIOD.TODAY]: {
        total: 280,
        services: 3,
        tips: 20,
        platformFee: 28,
      },
      [EARNINGS_PERIOD.WEEK]: {
        total: 1250,
        services: 12,
        tips: 85,
        platformFee: 125,
      },
      [EARNINGS_PERIOD.MONTH]: {
        total: 4800,
        services: 45,
        tips: 320,
        platformFee: 480,
      },
      [EARNINGS_PERIOD.YEAR]: {
        total: 58000,
        services: 540,
        tips: 3800,
        platformFee: 5800,
      },
    },
    recentTransactions: [
      {
        id: '1',
        customer: 'John Smith',
        service: 'Deep Cleaning',
        date: '2024-02-19',
        amount: 120,
        tip: 10,
      },
      {
        id: '2',
        customer: 'Sarah Wilson',
        service: 'Regular Cleaning',
        date: '2024-02-19',
        amount: 80,
        tip: 5,
      },
      {
        id: '3',
        customer: 'Mike Johnson',
        service: 'Deep Cleaning',
        date: '2024-02-18',
        amount: 120,
        tip: 15,
      },
    ],
  };

  const renderPeriodButton = (period, label) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.periodButtonActive,
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.periodButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStatCard = (label, value, icon) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Icon name={icon} size={24} color="#2196F3" />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderTransaction = (transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={styles.transactionCard}
      onPress={() =>
        navigation.navigate('TransactionDetails', { id: transaction.id })
      }
    >
      <View style={styles.transactionHeader}>
        <View>
          <Text style={styles.customerName}>{transaction.customer}</Text>
          <Text style={styles.serviceInfo}>
            {transaction.service} • {transaction.date}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${transaction.amount}</Text>
          {transaction.tip > 0 && (
            <Text style={styles.tipText}>+${transaction.tip} tip</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.title}>Earnings</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('EarningsFilter')}
        >
          <Icon name="sliders" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.periodSelector}>
          {renderPeriodButton(EARNINGS_PERIOD.TODAY, 'Today')}
          {renderPeriodButton(EARNINGS_PERIOD.WEEK, 'This Week')}
          {renderPeriodButton(EARNINGS_PERIOD.MONTH, 'This Month')}
          {renderPeriodButton(EARNINGS_PERIOD.YEAR, 'This Year')}
        </View>

        <View style={styles.earningsCard}>
          <Text style={styles.totalEarningsLabel}>Total Earnings</Text>
          <Text style={styles.totalEarningsAmount}>
            ${mockData.earnings[selectedPeriod].total}
          </Text>
          <View style={styles.earningsDetails}>
            <View style={styles.earningsDetailItem}>
              <Text style={styles.detailLabel}>Services</Text>
              <Text style={styles.detailValue}>
                {mockData.earnings[selectedPeriod].services}
              </Text>
            </View>
            <View style={styles.earningsDetailItem}>
              <Text style={styles.detailLabel}>Tips</Text>
              <Text style={styles.detailValue}>
                ${mockData.earnings[selectedPeriod].tips}
              </Text>
            </View>
            <View style={styles.earningsDetailItem}>
              <Text style={styles.detailLabel}>Platform Fee</Text>
              <Text style={styles.detailValue}>
                ${mockData.earnings[selectedPeriod].platformFee}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {renderStatCard(
            'Avg. per Service',
            `$${(
              mockData.earnings[selectedPeriod].total /
              mockData.earnings[selectedPeriod].services
            ).toFixed(2)}`,
            'dollar-sign'
          )}
          {renderStatCard(
            'Completion Rate',
            '98%',
            'check-circle'
          )}
          {renderStatCard(
            'Avg. Rating',
            '4.8',
            'star'
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionsList')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {mockData.recentTransactions.map(renderTransaction)}
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
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  earningsCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalEarningsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalEarningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  earningsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  earningsDetailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
  },
  transactionCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceInfo: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tipText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
});

export default ProviderEarnings;
