export const SERVICE_CATEGORIES = [
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: 'cleaning',
    description: 'Professional home cleaning services',
    color: '#4CAF50',
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: 'plumbing',
    description: 'Expert plumbing repair and installation',
    color: '#2196F3',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: 'electrical',
    description: 'Electrical repair and maintenance',
    color: '#FFC107',
  },
  {
    id: 'handyman',
    name: 'Handyman',
    icon: 'handyman',
    description: 'General repairs and maintenance',
    color: '#FF5722',
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: 'painting',
    description: 'Interior and exterior painting',
    color: '#9C27B0',
  },
  {
    id: 'gardening',
    name: 'Gardening',
    icon: 'gardening',
    description: 'Lawn care and landscaping',
    color: '#8BC34A',
  },
  {
    id: 'appliance',
    name: 'Appliance',
    icon: 'appliance',
    description: 'Appliance repair and maintenance',
    color: '#3F51B5',
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    icon: 'pest-control',
    description: 'Pest inspection and control',
    color: '#795548',
  },
];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: '#FFC107',
  [BOOKING_STATUS.CONFIRMED]: '#2196F3',
  [BOOKING_STATUS.IN_PROGRESS]: '#673AB7',
  [BOOKING_STATUS.COMPLETED]: '#4CAF50',
  [BOOKING_STATUS.CANCELLED]: '#F44336',
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'Pending',
  [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
  [BOOKING_STATUS.IN_PROGRESS]: 'In Progress',
  [BOOKING_STATUS.COMPLETED]: 'Completed',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled',
};

export const SERVICE_AVAILABILITY = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  UNAVAILABLE: 'unavailable',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
  BANK_TRANSFER: 'bank_transfer',
};

export const RATING_CRITERIA = {
  QUALITY: 'Quality of Service',
  PUNCTUALITY: 'Punctuality',
  PROFESSIONALISM: 'Professionalism',
  VALUE: 'Value for Money',
  CLEANLINESS: 'Cleanliness',
};
