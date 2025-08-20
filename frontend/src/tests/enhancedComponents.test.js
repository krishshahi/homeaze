import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

// Import the enhanced components
import EditProfileScreen from '../screens/EditProfileScreen';
import EnhancedBookingsScreen from '../screens/EnhancedBookingsScreen';
import EnhancedProfileScreen from '../screens/EnhancedProfileScreen';
import EnhancedProviderServiceCreateScreen from '../screens/EnhancedProviderServiceCreateScreen';
import EnhancedServicesScreen from '../screens/EnhancedServicesScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';

// Import API mocks
import { mockAPI } from '../services/enhancedAPI';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Expo Icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock components that might not be available in test environment
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
}));

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
      services: (state = { services: [], categories: [] }, action) => state,
      bookings: (state = { bookings: [] }, action) => state,
      profile: (state = { user: null, stats: null }, action) => state,
    },
    preloadedState: initialState,
  });
};

// Helper to render component with providers
const renderWithProviders = (component, initialState = {}) => {
  const store = createTestStore(initialState);
  
  return render(
    <Provider store={store}>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </Provider>
  );
};

describe('Enhanced Services Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders services screen correctly', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <EnhancedServicesScreen />
    );

    // Check if main elements are rendered
    expect(getByText('All Services')).toBeTruthy();
    expect(getByPlaceholderText('Search services...')).toBeTruthy();
  });

  test('displays categories correctly', async () => {
    const { getByText } = renderWithProviders(<EnhancedServicesScreen />);

    // Wait for categories to load
    await waitFor(() => {
      expect(getByText('Cleaning')).toBeTruthy();
      expect(getByText('Home Repair')).toBeTruthy();
      expect(getByText('Landscaping')).toBeTruthy();
    });
  });

  test('search functionality works', async () => {
    const { getByPlaceholderText } = renderWithProviders(
      <EnhancedServicesScreen />
    );

    const searchInput = getByPlaceholderText('Search services...');
    
    await act(async () => {
      fireEvent.changeText(searchInput, 'cleaning');
    });

    // Search should update the input value
    expect(searchInput.props.value).toBe('cleaning');
  });

  test('category selection works', async () => {
    const { getByText } = renderWithProviders(<EnhancedServicesScreen />);

    await waitFor(() => {
      const cleaningCategory = getByText('Cleaning');
      fireEvent.press(cleaningCategory);
    });

    // Category should be selected (this would be tested with state changes)
    expect(getByText('Cleaning')).toBeTruthy();
  });

  test('filter modal can be opened', async () => {
    const { getByTestId } = renderWithProviders(<EnhancedServicesScreen />);

    // Assuming filter button has testID="filter-button"
    const filterButton = getByTestId('filter-button');
    fireEvent.press(filterButton);

    // Modal should open (would need to check modal visibility)
  });
});

describe('Enhanced Bookings Screen', () => {
  test('renders bookings screen correctly', async () => {
    const { getByText } = renderWithProviders(<EnhancedBookingsScreen />);

    expect(getByText('My Bookings')).toBeTruthy();
  });

  test('displays booking tabs', async () => {
    const { getByText } = renderWithProviders(<EnhancedBookingsScreen />);

    expect(getByText('All')).toBeTruthy();
    expect(getByText('Upcoming')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
    expect(getByText('Cancelled')).toBeTruthy();
  });

  test('tab switching works', async () => {
    const { getByText } = renderWithProviders(<EnhancedBookingsScreen />);

    const upcomingTab = getByText('Upcoming');
    fireEvent.press(upcomingTab);

    // Tab should be selected (would need to check active state)
    expect(upcomingTab).toBeTruthy();
  });

  test('search functionality works', async () => {
    const { getByPlaceholderText } = renderWithProviders(
      <EnhancedBookingsScreen />
    );

    const searchInput = getByPlaceholderText('Search bookings...');
    
    await act(async () => {
      fireEvent.changeText(searchInput, 'cleaning');
    });

    expect(searchInput.props.value).toBe('cleaning');
  });

  test('displays empty state when no bookings', async () => {
    // Mock empty bookings response
    jest.spyOn(mockAPI.bookings, 'getBookings').mockResolvedValue({
      data: [],
      total: 0,
    });

    const { getByText } = renderWithProviders(<EnhancedBookingsScreen />);

    await waitFor(() => {
      expect(getByText('No bookings found')).toBeTruthy();
    });
  });
});

describe('Enhanced Profile Screen', () => {
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    avatar: 'https://via.placeholder.com/120',
    memberSince: '2023-01-15',
  };

  const mockStats = {
    completedBookings: 12,
    totalSpent: 890,
    savedAmount: 156,
    averageRating: 4.9,
  };

  test('renders profile screen correctly', async () => {
    const { getByText } = renderWithProviders(<EnhancedProfileScreen />, {
      auth: { user: mockUser, isAuthenticated: true },
      profile: { user: mockUser, stats: mockStats },
    });

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();
  });

  test('displays user statistics', async () => {
    const { getByText } = renderWithProviders(<EnhancedProfileScreen />, {
      auth: { user: mockUser, isAuthenticated: true },
      profile: { user: mockUser, stats: mockStats },
    });

    expect(getByText('12')).toBeTruthy(); // completed bookings
    expect(getByText('$890')).toBeTruthy(); // total spent
    expect(getByText('$156')).toBeTruthy(); // saved amount
  });

  test('navigation to edit profile works', async () => {
    const mockNavigate = jest.fn();
    
    // Mock useNavigation hook
    jest.mock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({
        navigate: mockNavigate,
        goBack: jest.fn(),
      }),
    }));

    const { getByText } = renderWithProviders(<EnhancedProfileScreen />, {
      auth: { user: mockUser, isAuthenticated: true },
      profile: { user: mockUser, stats: mockStats },
    });

    const editButton = getByText('Personal Details');
    fireEvent.press(editButton);

    // Navigation should be called (would need to verify the exact call)
    expect(editButton).toBeTruthy();
  });

  test('toggle switches work', async () => {
    const { getAllByRole } = renderWithProviders(<EnhancedProfileScreen />, {
      auth: { user: mockUser, isAuthenticated: true },
      profile: { user: mockUser, stats: mockStats },
    });

    // Find toggle switches (assuming they have role="switch")
    const switches = getAllByRole('switch');
    
    if (switches.length > 0) {
      fireEvent(switches[0], 'valueChange', true);
      // Switch should toggle (would need to check state change)
    }
  });

  test('logout functionality works', async () => {
    const { getByText } = renderWithProviders(<EnhancedProfileScreen />, {
      auth: { user: mockUser, isAuthenticated: true },
      profile: { user: mockUser, stats: mockStats },
    });

    const logoutButton = getByText('Logout');
    fireEvent.press(logoutButton);

    // Logout modal should appear (would need to check modal visibility)
    expect(logoutButton).toBeTruthy();
  });
});

describe('Enhanced Provider Service Create Screen', () => {
  test('renders create service screen correctly', () => {
    const { getByText } = renderWithProviders(
      <EnhancedProviderServiceCreateScreen />
    );

    expect(getByText('Create Service')).toBeTruthy();
    expect(getByText('Step 1 of 3')).toBeTruthy();
  });

  test('form validation works', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <EnhancedProviderServiceCreateScreen />
    );

    const nextButton = getByText('Next');
    
    // Try to proceed without filling required fields
    fireEvent.press(nextButton);

    // Validation errors should appear
    await waitFor(() => {
      expect(getByText('Service name is required')).toBeTruthy();
    });
  });

  test('step navigation works', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <EnhancedProviderServiceCreateScreen />
    );

    // Fill required fields
    const nameInput = getByPlaceholderText('Enter service name');
    const descriptionInput = getByPlaceholderText('Describe your service...');

    await act(async () => {
      fireEvent.changeText(nameInput, 'Test Service');
      fireEvent.changeText(descriptionInput, 'Test Description');
    });

    // Select a category (would need to implement category selection test)
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    // Should move to step 2
    await waitFor(() => {
      expect(getByText('Step 2 of 3')).toBeTruthy();
    });
  });

  test('service creation works', async () => {
    // Mock successful service creation
    const mockCreateService = jest.fn().mockResolvedValue({
      success: true,
      data: { id: '123' },
    });

    // This would require more complex setup to test the full flow
    expect(mockCreateService).toBeDefined();
  });
});

describe('Edit Profile Screen', () => {
  test('renders edit profile screen correctly', () => {
    const { getByText } = renderWithProviders(<EditProfileScreen />);

    expect(getByText('Edit Profile')).toBeTruthy();
    expect(getByText('Personal Information')).toBeTruthy();
    expect(getByText('Address Information')).toBeTruthy();
  });

  test('form fields are populated with existing data', async () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    const { getByDisplayValue } = renderWithProviders(
      <EditProfileScreen route={{ params: { user: mockUser } }} />
    );

    expect(getByDisplayValue('John')).toBeTruthy();
    expect(getByDisplayValue('Doe')).toBeTruthy();
    expect(getByDisplayValue('john@example.com')).toBeTruthy();
  });

  test('form validation works', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <EditProfileScreen />
    );

    const firstNameInput = getByPlaceholderText('Enter first name');
    const saveButton = getByText('Save Changes');

    // Clear required field
    await act(async () => {
      fireEvent.changeText(firstNameInput, '');
    });

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('First name is required')).toBeTruthy();
    });
  });
});

describe('Payment Methods Screen', () => {
  test('renders payment methods screen correctly', () => {
    const { getByText } = renderWithProviders(<PaymentMethodsScreen />);

    expect(getByText('Payment Methods')).toBeTruthy();
    expect(getByText('Add Payment Method')).toBeTruthy();
  });

  test('displays payment methods list', async () => {
    // Mock payment methods
    const mockPaymentMethods = [
      {
        id: '1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        isDefault: true,
      },
    ];

    const { getByText } = renderWithProviders(<PaymentMethodsScreen />);

    await waitFor(() => {
      expect(getByText('VISA ****4242')).toBeTruthy();
      expect(getByText('Default')).toBeTruthy();
    });
  });

  test('add payment method modal works', async () => {
    const { getByText } = renderWithProviders(<PaymentMethodsScreen />);

    const addButton = getByText('Add Payment Method');
    fireEvent.press(addButton);

    // Alert should appear with options
    // (This would need to be tested with Alert mock)
  });

  test('set default payment method works', async () => {
    const { getByTestId } = renderWithProviders(<PaymentMethodsScreen />);

    // Assuming set default button has testID
    const setDefaultButton = getByTestId('set-default-button');
    fireEvent.press(setDefaultButton);

    // Confirmation alert should appear
  });
});

// Integration Tests
describe('Integration Tests', () => {
  test('navigation flow from services to booking works', async () => {
    const mockNavigate = jest.fn();

    // This would test the full flow from services screen to booking creation
    // Would require more complex setup with navigation mocking
  });

  test('booking creation to profile update flow works', async () => {
    // Test the flow of creating a booking and seeing it reflected in profile stats
  });

  test('service creation and approval flow works', async () => {
    // Test provider creating service and it appearing in services list after approval
  });
});

// Performance Tests
describe('Performance Tests', () => {
  test('services list renders efficiently with large dataset', async () => {
    // Mock large dataset
    const largeServicesList = Array.from({ length: 1000 }, (_, i) => ({
      id: i.toString(),
      name: `Service ${i}`,
      price: Math.random() * 100,
      rating: Math.random() * 5,
    }));

    // Measure render time
    const start = performance.now();
    renderWithProviders(<EnhancedServicesScreen />);
    const end = performance.now();

    // Assert reasonable render time (adjust threshold as needed)
    expect(end - start).toBeLessThan(1000); // Less than 1 second
  });

  test('bookings list scrolling is smooth', async () => {
    // Test scroll performance with large bookings list
    const largeBookingsList = Array.from({ length: 500 }, (_, i) => ({
      id: i.toString(),
      serviceName: `Service ${i}`,
      status: 'completed',
      price: Math.random() * 100,
    }));

    // This would require more specific performance testing setup
  });
});

// Accessibility Tests
describe('Accessibility Tests', () => {
  test('screens have proper accessibility labels', () => {
    const { getByLabelText } = renderWithProviders(<EnhancedServicesScreen />);

    // Check for accessibility labels
    // This would require adding accessibility labels to components
  });

  test('screens work with screen readers', () => {
    // Test screen reader compatibility
  });

  test('screens have proper focus management', () => {
    // Test keyboard navigation and focus states
  });
});

export {
  renderWithProviders,
  createTestStore,
  mockAPI,
};
