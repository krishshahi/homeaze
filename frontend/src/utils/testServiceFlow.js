// Test Service Flow - Seed providers with services and test customer visibility
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Services Data for Testing
export const MOCK_PROVIDER_SERVICES = [
  {
    id: 'service_001',
    providerId: 'provider_001',
    title: 'Professional House Cleaning',
    description: 'Deep cleaning service for residential homes including kitchen, bathrooms, living areas, and bedrooms. Eco-friendly products available.',
    category: 'Cleaning',
    subcategory: 'Residential Cleaning',
    price: 75,
    duration: 180, // 3 hours in minutes
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    tags: ['Deep Clean', 'Eco-Friendly', 'Insured', 'Same Day'],
    availability: {
      monday: { available: true, slots: ['09:00', '13:00', '16:00'] },
      tuesday: { available: true, slots: ['09:00', '13:00', '16:00'] },
      wednesday: { available: true, slots: ['09:00', '13:00', '16:00'] },
      thursday: { available: true, slots: ['09:00', '13:00', '16:00'] },
      friday: { available: true, slots: ['09:00', '13:00', '16:00'] },
      saturday: { available: true, slots: ['10:00', '14:00'] },
      sunday: { available: false, slots: [] }
    },
    rating: 4.8,
    reviewCount: 156,
    isActive: true,
    isApproved: true,
    createdAt: new Date().toISOString(),
    provider: {
      id: 'provider_001',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 234,
      verified: true,
      experience: '5+ years'
    }
  },
  {
    id: 'service_002',
    providerId: 'provider_002',
    title: 'Emergency Plumbing Repair',
    description: 'Quick and reliable plumbing services including leak repairs, pipe installation, drain cleaning, and emergency callouts available 24/7.',
    category: 'Home Repair',
    subcategory: 'Plumbing',
    price: 85,
    duration: 120, // 2 hours
    images: [
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop'
    ],
    tags: ['24/7 Emergency', 'Licensed', 'Insured', 'Same Day'],
    availability: {
      monday: { available: true, slots: ['08:00', '12:00', '16:00', '20:00'] },
      tuesday: { available: true, slots: ['08:00', '12:00', '16:00', '20:00'] },
      wednesday: { available: true, slots: ['08:00', '12:00', '16:00', '20:00'] },
      thursday: { available: true, slots: ['08:00', '12:00', '16:00', '20:00'] },
      friday: { available: true, slots: ['08:00', '12:00', '16:00', '20:00'] },
      saturday: { available: true, slots: ['08:00', '12:00', '16:00', '20:00'] },
      sunday: { available: true, slots: ['08:00', '12:00', '16:00', '20:00'] }
    },
    rating: 4.7,
    reviewCount: 89,
    isActive: true,
    isApproved: true,
    createdAt: new Date().toISOString(),
    provider: {
      id: 'provider_002',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 167,
      verified: true,
      experience: '8+ years'
    }
  },
  {
    id: 'service_003',
    providerId: 'provider_003',
    title: 'Garden Design & Maintenance',
    description: 'Complete landscaping services including garden design, plant installation, lawn care, hedge trimming, and seasonal maintenance.',
    category: 'Landscaping',
    subcategory: 'Garden Design',
    price: 120,
    duration: 240, // 4 hours
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1585838491513-de25c0c22e34?w=400&h=300&fit=crop'
    ],
    tags: ['Organic', 'Design Consultation', 'Plant Care', 'Seasonal'],
    availability: {
      monday: { available: true, slots: ['08:00', '13:00'] },
      tuesday: { available: true, slots: ['08:00', '13:00'] },
      wednesday: { available: true, slots: ['08:00', '13:00'] },
      thursday: { available: true, slots: ['08:00', '13:00'] },
      friday: { available: true, slots: ['08:00', '13:00'] },
      saturday: { available: true, slots: ['08:00', '13:00'] },
      sunday: { available: false, slots: [] }
    },
    rating: 4.9,
    reviewCount: 78,
    isActive: true,
    isApproved: true,
    createdAt: new Date().toISOString(),
    provider: {
      id: 'provider_003',
      name: 'Emma Green',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 134,
      verified: true,
      experience: '6+ years'
    }
  },
  {
    id: 'service_004',
    providerId: 'provider_001', // Same provider as service_001
    title: 'Move-In/Move-Out Deep Clean',
    description: 'Comprehensive cleaning service for moving situations. Perfect for new tenants or preparing property for sale. Includes appliance cleaning.',
    category: 'Cleaning',
    subcategory: 'Move-In/Move-Out',
    price: 150,
    duration: 300, // 5 hours
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    tags: ['Deep Clean', 'Move-In Ready', 'Appliance Clean', 'Deposit Guarantee'],
    availability: {
      monday: { available: true, slots: ['08:00', '14:00'] },
      tuesday: { available: true, slots: ['08:00', '14:00'] },
      wednesday: { available: true, slots: ['08:00', '14:00'] },
      thursday: { available: true, slots: ['08:00', '14:00'] },
      friday: { available: true, slots: ['08:00', '14:00'] },
      saturday: { available: true, slots: ['08:00'] },
      sunday: { available: false, slots: [] }
    },
    rating: 4.8,
    reviewCount: 45,
    isActive: true,
    isApproved: true,
    createdAt: new Date().toISOString(),
    provider: {
      id: 'provider_001',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 234,
      verified: true,
      experience: '5+ years'
    }
  }
];

// Mock Provider Data
export const MOCK_PROVIDERS = [
  {
    id: 'provider_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    userType: 'provider',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 123-4567',
    bio: 'Professional cleaning specialist with 5+ years of experience. Eco-friendly products and insured service.',
    address: '123 Oak Street, Springfield, IL',
    rating: 4.9,
    reviewCount: 234,
    totalEarnings: 25680,
    completedJobs: 189,
    verified: true,
    isActive: true,
    specialties: ['Residential Cleaning', 'Deep Cleaning', 'Move-In/Out Cleaning'],
    certifications: ['Bonded & Insured', 'Eco-Friendly Certified'],
    experience: '5+ years',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year ago
  },
  {
    id: 'provider_002',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    userType: 'provider',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 234-5678',
    bio: 'Licensed plumber with emergency service availability. 8+ years experience in residential and commercial plumbing.',
    address: '456 Elm Avenue, Springfield, IL',
    rating: 4.8,
    reviewCount: 167,
    totalEarnings: 45230,
    completedJobs: 245,
    verified: true,
    isActive: true,
    specialties: ['Emergency Plumbing', 'Pipe Repair', 'Drain Cleaning', 'Installation'],
    certifications: ['Licensed Plumber', 'Bonded & Insured', '24/7 Emergency'],
    experience: '8+ years',
    createdAt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString() // 3 years ago
  },
  {
    id: 'provider_003',
    name: 'Emma Green',
    email: 'emma.green@example.com',
    userType: 'provider',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 345-6789',
    bio: 'Professional landscaper specializing in garden design and organic maintenance. Creating beautiful outdoor spaces.',
    address: '789 Pine Road, Springfield, IL',
    rating: 4.9,
    reviewCount: 134,
    totalEarnings: 38540,
    completedJobs: 156,
    verified: true,
    isActive: true,
    specialties: ['Garden Design', 'Organic Landscaping', 'Seasonal Maintenance', 'Plant Care'],
    certifications: ['Certified Landscaper', 'Organic Specialist', 'Design Consultation'],
    experience: '6+ years',
    createdAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString() // 2 years ago
  }
];

// Test Customer Data
export const MOCK_CUSTOMERS = [
  {
    id: 'customer_001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    userType: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 987-6543',
    address: '321 Maple Drive, Springfield, IL',
    totalBookings: 12,
    completedBookings: 10,
    cancelledBookings: 1,
    createdAt: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString() // 6 months ago
  },
  {
    id: 'customer_002',
    name: 'Lisa Wang',
    email: 'lisa.wang@example.com',
    userType: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 876-5432',
    address: '654 Cedar Lane, Springfield, IL',
    totalBookings: 8,
    completedBookings: 7,
    cancelledBookings: 0,
    createdAt: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString() // 4 months ago
  }
];

// Utility Functions for Testing
export class ServiceFlowTester {
  
  /**
   * Seed the app with test provider and service data
   */
  static async seedTestData() {
    try {
      console.log('🌱 Starting service flow test data seeding...');
      
      // Store providers
      await AsyncStorage.setItem('mock_providers', JSON.stringify(MOCK_PROVIDERS));
      
      // Store services
      await AsyncStorage.setItem('mock_services', JSON.stringify(MOCK_PROVIDER_SERVICES));
      
      // Store customers
      await AsyncStorage.setItem('mock_customers', JSON.stringify(MOCK_CUSTOMERS));
      
      // Store categories
      const categories = [
        { id: 'cleaning', name: 'Cleaning', icon: '🧹', count: 2 },
        { id: 'repair', name: 'Home Repair', icon: '🔧', count: 1 },
        { id: 'landscaping', name: 'Landscaping', icon: '🌱', count: 1 }
      ];
      await AsyncStorage.setItem('mock_categories', JSON.stringify(categories));
      
      console.log('✅ Test data seeded successfully');
      return { success: true, message: 'Test data seeded successfully' };
      
    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Test provider login and service management
   */
  static async testProviderFlow(providerId = 'provider_001') {
    try {
      console.log('🔧 Testing provider flow for:', providerId);
      
      // Simulate provider login
      const provider = MOCK_PROVIDERS.find(p => p.id === providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(provider));
      await AsyncStorage.setItem('userToken', 'mock_provider_token');
      
      // Get provider's services
      const providerServices = MOCK_PROVIDER_SERVICES.filter(s => s.providerId === providerId);
      
      console.log(`✅ Provider ${provider.name} logged in successfully`);
      console.log(`📋 Provider has ${providerServices.length} services:`);
      
      providerServices.forEach(service => {
        console.log(`  - ${service.title} ($${service.price})`);
      });
      
      return {
        success: true,
        provider,
        services: providerServices,
        message: `Provider ${provider.name} logged in with ${providerServices.length} services`
      };
      
    } catch (error) {
      console.error('❌ Provider flow test failed:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Test customer login and service browsing
   */
  static async testCustomerFlow(customerId = 'customer_001') {
    try {
      console.log('👤 Testing customer flow for:', customerId);
      
      // Simulate customer login
      const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
      if (!customer) {
        throw new Error(`Customer ${customerId} not found`);
      }
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(customer));
      await AsyncStorage.setItem('userToken', 'mock_customer_token');
      
      // Get all available services (what customer should see)
      const availableServices = MOCK_PROVIDER_SERVICES.filter(s => s.isActive && s.isApproved);
      
      console.log(`✅ Customer ${customer.name} logged in successfully`);
      console.log(`🛍️ Customer can see ${availableServices.length} available services:`);
      
      availableServices.forEach(service => {
        console.log(`  - ${service.title} by ${service.provider.name} ($${service.price})`);
      });
      
      return {
        success: true,
        customer,
        availableServices,
        message: `Customer ${customer.name} can browse ${availableServices.length} services`
      };
      
    } catch (error) {
      console.error('❌ Customer flow test failed:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Test service discovery and filtering
   */
  static async testServiceDiscovery() {
    try {
      console.log('🔍 Testing service discovery and filtering...');
      
      const services = MOCK_PROVIDER_SERVICES.filter(s => s.isActive && s.isApproved);
      
      // Test category filtering
      const categories = [...new Set(services.map(s => s.category))];
      console.log(`📂 Available categories: ${categories.join(', ')}`);
      
      // Test price range
      const prices = services.map(s => s.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      console.log(`💰 Price range: $${minPrice} - $${maxPrice}`);
      
      // Test search functionality
      const searchResults = services.filter(s => 
        s.title.toLowerCase().includes('clean') || 
        s.description.toLowerCase().includes('clean')
      );
      console.log(`🔎 Search for 'clean' found ${searchResults.length} results`);
      
      // Test provider ratings
      const topRatedServices = services
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
      console.log('⭐ Top 3 rated services:');
      topRatedServices.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.title} (${service.rating}★)`);
      });
      
      return {
        success: true,
        totalServices: services.length,
        categories: categories.length,
        priceRange: { min: minPrice, max: maxPrice },
        searchResults: searchResults.length
      };
      
    } catch (error) {
      console.error('❌ Service discovery test failed:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Run comprehensive test suite
   */
  static async runFullTest() {
    try {
      console.log('🚀 Starting comprehensive service flow test...\n');
      
      // Step 1: Seed data
      const seedResult = await this.seedTestData();
      if (!seedResult.success) throw new Error(seedResult.message);
      
      // Step 2: Test provider flow
      const providerResult = await this.testProviderFlow('provider_001');
      if (!providerResult.success) throw new Error(providerResult.message);
      
      // Step 3: Test customer flow
      const customerResult = await this.testCustomerFlow('customer_001');
      if (!customerResult.success) throw new Error(customerResult.message);
      
      // Step 4: Test service discovery
      const discoveryResult = await this.testServiceDiscovery();
      if (!discoveryResult.success) throw new Error(discoveryResult.message);
      
      // Step 5: Test cross-visibility
      console.log('\n🔄 Testing provider-customer service visibility...');
      
      const providerServices = providerResult.services;
      const customerServices = customerResult.availableServices;
      
      const visibleToCustomer = providerServices.filter(ps => 
        customerServices.some(cs => cs.id === ps.id)
      );
      
      console.log(`✅ ${visibleToCustomer.length}/${providerServices.length} provider services are visible to customers`);
      
      if (visibleToCustomer.length === providerServices.length) {
        console.log('🎉 Perfect! All provider services are available to customers');
      } else {
        console.log('⚠️ Some provider services are not visible to customers');
      }
      
      const summary = {
        success: true,
        totalProviders: MOCK_PROVIDERS.length,
        totalCustomers: MOCK_CUSTOMERS.length,
        totalServices: MOCK_PROVIDER_SERVICES.length,
        activeServices: customerResult.availableServices.length,
        providerServiceCount: providerResult.services.length,
        serviceVisibility: `${visibleToCustomer.length}/${providerServices.length}`,
        categories: discoveryResult.categories,
        priceRange: discoveryResult.priceRange
      };
      
      console.log('\n📊 Test Summary:');
      console.log('================');
      console.log(`Providers: ${summary.totalProviders}`);
      console.log(`Customers: ${summary.totalCustomers}`);
      console.log(`Total Services: ${summary.totalServices}`);
      console.log(`Active Services: ${summary.activeServices}`);
      console.log(`Service Visibility: ${summary.serviceVisibility}`);
      console.log(`Categories: ${summary.categories}`);
      console.log(`Price Range: $${summary.priceRange.min} - $${summary.priceRange.max}`);
      console.log('================\n');
      
      return summary;
      
    } catch (error) {
      console.error('❌ Full test suite failed:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Clear all test data
   */
  static async clearTestData() {
    try {
      await AsyncStorage.multiRemove([
        'mock_providers',
        'mock_services', 
        'mock_customers',
        'mock_categories',
        'currentUser',
        'userToken'
      ]);
      console.log('🧹 Test data cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing test data:', error);
      return { success: false, message: error.message };
    }
  }
}

export default ServiceFlowTester;
