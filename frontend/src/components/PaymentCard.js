import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatPaymentAmount, getPaymentStatusColor } from '../services/paymentsApi';

const methodIconMap = {
  card: { name: 'credit-card-outline', color: COLORS.textSecondary },
  visa: { name: 'visa', color: COLORS.textSecondary },
  mastercard: { name: 'mastercard', color: COLORS.textSecondary },
  amex: { name: 'credit-card-outline', color: COLORS.textSecondary },
  paypal: { name: 'paypal', color: COLORS.textSecondary },
  razorpay: { name: 'credit-card-wireless-outline', color: COLORS.textSecondary },
  bank: { name: 'bank-outline', color: COLORS.textSecondary },
  cash: { name: 'cash-multiple', color: COLORS.textSecondary },
};

const PaymentCard = ({ payment }) => {
  const methodType = (payment?.paymentMethod?.brand || payment?.paymentMethod?.type || 'card').toLowerCase();
  const methodIcon = methodIconMap[methodType] || methodIconMap.card;
  const methodLabel = (payment?.paymentMethod?.brand || payment?.paymentMethod?.type || 'Card').toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.transactionId}>Transaction ID: {payment.transactionIds.gateway}</Text>
        <Text style={[styles.status, { color: getPaymentStatusColor(payment.status) }]}>
          {payment.status.toUpperCase()}
        </Text>
      </View>
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>{formatPaymentAmount(payment.amount.gross, payment.amount.currency)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Method:</Text>
          <View style={styles.methodValue}>
            <MaterialCommunityIcons name={methodIcon.name} size={18} color={methodIcon.color} style={styles.methodIcon} />
            <Text style={styles.value}>{methodLabel}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date(payment.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  transactionId: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium
  },
  status: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
  },
  details: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  methodValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    marginRight: SPACING.xs,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightRegular,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: FONTS.body1,
    lineHeight: FONTS.body1 * FONTS.lineHeightNormal,
    fontWeight: FONTS.weightMedium,
  }
});

export default PaymentCard;
