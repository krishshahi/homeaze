import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { PAYOUT_STATUS, PAYOUT_STATUS_COLORS } from '../../constants/provider';

const PaymentSettings = () => {
  const navigation = useNavigation();
  const [selectedAccount, setSelectedAccount] = useState('bank1');
  const [automaticPayouts, setAutomaticPayouts] = useState(true);
  const [minimumPayout, setMinimumPayout] = useState('100');

  const mockData = {
    bankAccounts: [
      {
        id: 'bank1',
        bankName: 'Chase Bank',
        accountType: 'Checking',
        accountNumber: '****6789',
        isDefault: true,
      },
      {
        id: 'bank2',
        bankName: 'Bank of America',
        accountType: 'Savings',
        accountNumber: '****4321',
        isDefault: false,
      },
    ],
    recentPayouts: [
      {
        id: 'pay1',
        amount: 850.00,
        date: '2024-02-15',
        status: PAYOUT_STATUS.COMPLETED,
        accountId: 'bank1',
      },
      {
        id: 'pay2',
        amount: 650.00,
        date: '2024-02-01',
        status: PAYOUT_STATUS.COMPLETED,
        accountId: 'bank1',
      },
      {
        id: 'pay3',
        amount: 450.00,
        date: '2024-01-15',
        status: PAYOUT_STATUS.COMPLETED,
        accountId: 'bank2',
      },
    ],
    balance: {
      available: 580.00,
      pending: 320.00,
    },
  };

  const handleAddBankAccount = () => {
    navigation.navigate('AddBankAccount');
  };

  const handleEditBankAccount = (accountId) => {
    navigation.navigate('EditBankAccount', { accountId });
  };

  const handleRequestPayout = () => {
    navigation.navigate('RequestPayout', {
      availableBalance: mockData.balance.available,
    });
  };

  const renderBankAccount = (account) => (
    <View key={account.id} style={styles.bankAccountCard}>
      <View style={styles.bankAccountHeader}>
        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>{account.bankName}</Text>
          <Text style={styles.accountType}>{account.accountType}</Text>
        </View>
        {account.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.accountDetails}>
        <Text style={styles.accountNumberLabel}>Account Number</Text>
        <Text style={styles.accountNumber}>{account.accountNumber}</Text>
      </View>

      <View style={styles.accountActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditBankAccount(account.id)}
        >
          <Icon name="edit-2" size={16} color="#2196F3" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        {!account.isDefault && (
          <TouchableOpacity
            style={styles.makeDefaultButton}
            onPress={() => setSelectedAccount(account.id)}
          >
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.makeDefaultText}>Make Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderPayout = (payout) => (
    <View key={payout.id} style={styles.payoutCard}>
      <View style={styles.payoutHeader}>
        <View>
          <Text style={styles.payoutAmount}>${payout.amount.toFixed(2)}</Text>
          <Text style={styles.payoutDate}>{payout.date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: PAYOUT_STATUS_COLORS[payout.status] },
          ]}
        >
          <Text style={styles.statusText}>{payout.status}</Text>
        </View>
      </View>

      <View style={styles.payoutDetails}>
        <Text style={styles.payoutAccount}>
          {mockData.bankAccounts.find((acc) => acc.id === payout.accountId)?.bankName}
        </Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </View>
    </View>
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
        <Text style={styles.title}>Payment Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                ${mockData.balance.available.toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Pending Balance</Text>
              <Text style={styles.pendingAmount}>
                ${mockData.balance.pending.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.payoutButton}
              onPress={handleRequestPayout}
            >
              <Text style={styles.payoutButtonText}>Request Payout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Accounts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddBankAccount}
            >
              <Icon name="plus" size={20} color="#2196F3" />
              <Text style={styles.addButtonText}>Add Account</Text>
            </TouchableOpacity>
          </View>
          {mockData.bankAccounts.map(renderBankAccount)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Settings</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="refresh-cw" size={20} color="#666" />
              <Text style={styles.settingText}>Automatic Payouts</Text>
            </View>
            <Switch
              value={automaticPayouts}
              onValueChange={setAutomaticPayouts}
              trackColor={{ false: '#CCCCCC', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="dollar-sign" size={20} color="#666" />
              <Text style={styles.settingText}>Minimum Payout Amount</Text>
            </View>
            <TextInput
              style={styles.amountInput}
              value={minimumPayout}
              onChangeText={setMinimumPayout}
              keyboardType="numeric"
              placeholder="100"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payouts</Text>
          {mockData.recentPayouts.map(renderPayout)}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('PayoutHistory')}
          >
            <Text style={styles.viewAllText}>View All Payouts</Text>
          </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  balanceSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  balanceCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pendingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  payoutButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  payoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  bankAccountCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  bankAccountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  accountDetails: {
    marginBottom: 12,
  },
  accountNumberLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 16,
    color: '#333',
  },
  accountActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
  },
  makeDefaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  makeDefaultText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4CAF50',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  amountInput: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 4,
    width: 80,
    textAlign: 'right',
    fontSize: 16,
  },
  payoutCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  payoutDate: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutAccount: {
    fontSize: 14,
    color: '#666',
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default PaymentSettings;
