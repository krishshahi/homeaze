import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatPaymentAmount, getPaymentMethodIcon, getPaymentStatusColor } from '../services/paymentsApi';

const PaymentCard = ({ payment }) => {
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
          <Text style={styles.value}>{getPaymentMethodIcon(payment.paymentMethod.type)} {payment.paymentMethod.type.toUpperCase()}</Text>
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
    marginBottom: SPACING.xs
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightRegular
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium
  }
});

export default PaymentCard;
