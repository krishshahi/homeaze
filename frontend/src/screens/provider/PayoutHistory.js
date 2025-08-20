import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import {
  PAYOUT_STATUS,
  PAYOUT_STATUS_COLORS,
  PAYOUT_STATUS_LABELS,
} from '../../constants/provider';

const PayoutHistory = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const mockPayouts = [
    {
      id: 'pay1',
      amount: 850.0,
      date: '2024-02-15',
      time: '14:30',
      status: PAYOUT_STATUS.COMPLETED,
      bankAccount: {
        bankName: 'Chase Bank',
        accountNumber: '****6789',
      },
      reference: 'PAY-2024021501',
    },
    {
      id: 'pay2',
      amount: 650.0,
      date: '2024-02-01',
      time: '15:45',
      status: PAYOUT_STATUS.COMPLETED,
      bankAccount: {
        bankName: 'Chase Bank',
        accountNumber: '****6789',
      },
      reference: 'PAY-2024020101',
    },
    {
      id: 'pay3',
      amount: 450.0,
      date: '2024-01-15',
      time: '11:20',
      status: PAYOUT_STATUS.COMPLETED,
      bankAccount: {
        bankName: 'Bank of America',
        accountNumber: '****4321',
      },
      reference: 'PAY-2024011501',
    },
    {
      id: 'pay4',
      amount: 750.0,
      date: '2024-01-01',
      time: '13:15',
      status: PAYOUT_STATUS.COMPLETED,
      bankAccount: {
        bankName: 'Chase Bank',
        accountNumber: '****6789',
      },
      reference: 'PAY-2024010101',
    },
  ];

  const getFilteredPayouts = () => {
    let filtered = [...mockPayouts];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((payout) => payout.status === selectedFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payout) =>
          payout.reference.toLowerCase().includes(query) ||
          payout.bankAccount.bankName.toLowerCase().includes(query) ||
          payout.date.includes(query)
      );
    }

    return filtered;
  };

  const renderPayoutCard = ({ item: payout }) => (
    <TouchableOpacity
      style={styles.payoutCard}
      onPress={() =>
        navigation.navigate('PayoutDetails', { payoutId: payout.id })
      }
    >
      <View style={styles.payoutHeader}>
        <View>
          <Text style={styles.amount}>${payout.amount.toFixed(2)}</Text>
          <Text style={styles.reference}>{payout.reference}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: PAYOUT_STATUS_COLORS[payout.status] },
          ]}
        >
          <Text style={styles.statusText}>
            {PAYOUT_STATUS_LABELS[payout.status]}
          </Text>
        </View>
      </View>

      <View style={styles.payoutDetails}>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>
            {payout.date} at {payout.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="credit-card" size={16} color="#666" />
          <Text style={styles.detailText}>
            {payout.bankAccount.bankName} ({payout.bankAccount.accountNumber})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
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
        <Text style={styles.title}>Payout History</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('PayoutFilters')}
        >
          <Icon name="sliders" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search payouts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filters}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton(PAYOUT_STATUS.COMPLETED, 'Completed')}
        {renderFilterButton(PAYOUT_STATUS.PENDING, 'Pending')}
        {renderFilterButton(PAYOUT_STATUS.PROCESSING, 'Processing')}
      </View>

      <FlatList
        data={getFilteredPayouts()}
        renderItem={renderPayoutCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  payoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reference: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  payoutDetails: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default PayoutHistory;
