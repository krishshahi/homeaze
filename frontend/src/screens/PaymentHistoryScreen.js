import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, FONTS, SPACING, LAYOUT } from '../constants/theme';
import {
  getPaymentHistory,
  selectPaymentHistory,
  selectPaymentLoading,
  selectPaymentError,
  clearPaymentError,
} from '../store/slices/paymentSlice';
import { selectAuthToken } from '../store/slices/authSlice';
import PaymentCard from '../components/PaymentCard';

const PaymentHistoryScreen = () => {
  const dispatch = useDispatch();
  const paymentHistory = useSelector(selectPaymentHistory);
  const loading = useSelector(selectPaymentLoading);  
  const error = useSelector(selectPaymentError);
  const authToken = useSelector(selectAuthToken);
  
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  useEffect(() => {
    if (error.history) {
      Alert.alert('Error', error.history);
      dispatch(clearPaymentError('history'));
    }
  }, [error.history]);

  const loadPaymentHistory = async (pageNumber = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    }

    try {
      await dispatch(getPaymentHistory({
        params: { page: pageNumber, limit: 10 },
        token: authToken,
      })).unwrap();
      
      setPage(pageNumber);
    } catch (err) {
      console.error('Failed to load payment history:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadPaymentHistory(1, true);
  };

  const handleLoadMore = () => {
    if (page < paymentHistory.pagination.pages && !loading.history) {
      loadPaymentHistory(page + 1);
    }
  };

  const renderPaymentItem = ({ item }) => (
    <PaymentCard payment={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>💳</Text>
      <Text style={styles.emptyStateTitle}>No Payment History</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your payment transactions will appear here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading.history || page === 1) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading more payments...</Text>
      </View>
    );
  };

  if (loading.history && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment History</Text>
        <Text style={styles.subtitle}>
          {paymentHistory.pagination.total} transactions found
        </Text>
      </View>

      <FlatList
        data={paymentHistory.payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.paymentId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default PaymentHistoryScreen;
