export const PROVIDER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
};

export const PROVIDER_STATUS_LABELS = {
  [PROVIDER_STATUS.ONLINE]: 'Online',
  [PROVIDER_STATUS.OFFLINE]: 'Offline',
  [PROVIDER_STATUS.BUSY]: 'Busy',
};

export const PROVIDER_STATUS_COLORS = {
  [PROVIDER_STATUS.ONLINE]: '#4CAF50',
  [PROVIDER_STATUS.OFFLINE]: '#9E9E9E',
  [PROVIDER_STATUS.BUSY]: '#FFC107',
};

export const EARNINGS_PERIOD = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

export const SERVICE_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const SERVICE_STATUS_LABELS = {
  [SERVICE_STATUS.SCHEDULED]: 'Scheduled',
  [SERVICE_STATUS.IN_PROGRESS]: 'In Progress',
  [SERVICE_STATUS.COMPLETED]: 'Completed',
  [SERVICE_STATUS.CANCELLED]: 'Cancelled',
};

export const SERVICE_STATUS_COLORS = {
  [SERVICE_STATUS.SCHEDULED]: '#2196F3',
  [SERVICE_STATUS.IN_PROGRESS]: '#673AB7',
  [SERVICE_STATUS.COMPLETED]: '#4CAF50',
  [SERVICE_STATUS.CANCELLED]: '#F44336',
};

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const PAYOUT_STATUS_LABELS = {
  [PAYOUT_STATUS.PENDING]: 'Pending',
  [PAYOUT_STATUS.PROCESSING]: 'Processing',
  [PAYOUT_STATUS.COMPLETED]: 'Completed',
  [PAYOUT_STATUS.FAILED]: 'Failed',
};

export const PAYOUT_STATUS_COLORS = {
  [PAYOUT_STATUS.PENDING]: '#FFC107',
  [PAYOUT_STATUS.PROCESSING]: '#2196F3',
  [PAYOUT_STATUS.COMPLETED]: '#4CAF50',
  [PAYOUT_STATUS.FAILED]: '#F44336',
};

export const NOTIFICATION_TYPES = {
  NEW_BOOKING: 'new_booking',
  BOOKING_CANCELLED: 'booking_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  PAYOUT_SENT: 'payout_sent',
  SERVICE_REMINDER: 'service_reminder',
  CUSTOMER_MESSAGE: 'customer_message',
  REVIEW_RECEIVED: 'review_received',
};

export const AVAILABILITY_SLOTS = [
  { id: '1', time: '09:00 AM - 10:00 AM' },
  { id: '2', time: '10:00 AM - 11:00 AM' },
  { id: '3', time: '11:00 AM - 12:00 PM' },
  { id: '4', time: '12:00 PM - 01:00 PM' },
  { id: '5', time: '02:00 PM - 03:00 PM' },
  { id: '6', time: '03:00 PM - 04:00 PM' },
  { id: '7', time: '04:00 PM - 05:00 PM' },
  { id: '8', time: '05:00 PM - 06:00 PM' },
];
