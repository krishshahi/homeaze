const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  
  console.log('Test database setup complete');
});

// Cleanup after each test
afterEach(async () => {
  // Clean up database after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  await mongoServer.stop();
  
  console.log('Test database cleanup complete');
});

// Global test utilities
global.testUtils = {
  // Create test user data
  createTestUser: (overrides = {}) => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    password: 'TestPassword123!',
    phone: '+1234567890',
    role: 'customer',
    ...overrides
  }),

  // Create test service provider data
  createTestProvider: (userId, overrides = {}) => ({
    userId,
    businessName: 'Test Service Provider',
    businessDescription: 'A test service provider',
    businessType: 'individual',
    contactInfo: {
      primaryPhone: '+1234567890',
      email: 'provider@test.com'
    },
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
      coordinates: [-73.935242, 40.730610] // NYC coordinates
    },
    services: [],
    ...overrides
  }),

  // Create test service data
  createTestService: (overrides = {}) => ({
    name: 'Test Service',
    description: 'A test service',
    category: 'test-category',
    pricing: {
      basePrice: 100,
      currency: 'USD'
    },
    duration: {
      estimated: 60,
      unit: 'minutes'
    },
    ...overrides
  }),

  // Create test booking data
  createTestBooking: (customerId, providerId, serviceId, overrides = {}) => ({
    customer: {
      userId: customerId,
      contactInfo: {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '+1234567890'
      }
    },
    serviceProvider: {
      providerId,
      businessName: 'Test Provider'
    },
    service: {
      serviceId,
      name: 'Test Service',
      description: 'Test service description'
    },
    booking: {
      date: new Date(Date.now() + 86400000), // Tomorrow
      timeSlot: {
        start: '09:00',
        end: '10:00'
      },
      duration: 60
    },
    location: {
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      coordinates: [-73.935242, 40.730610]
    },
    pricing: {
      basePrice: 100,
      finalTotal: 100,
      currency: 'USD'
    },
    ...overrides
  }),

  // Create test quote data
  createTestQuote: (customerId, providerId, serviceId, overrides = {}) => ({
    title: 'Test Quote',
    description: 'A test quote for service',
    customer: {
      userId: customerId,
      contactInfo: {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '+1234567890'
      }
    },
    serviceProvider: {
      providerId,
      businessName: 'Test Provider'
    },
    serviceDetails: {
      serviceId,
      serviceName: 'Test Service',
      serviceDescription: 'Test service description'
    },
    serviceLocation: {
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      }
    },
    pricing: {
      basePrice: {
        amount: 100,
        description: 'Base price'
      },
      subtotal: 100,
      finalTotal: 100
    },
    terms: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      paymentTerms: 'on_completion'
    },
    ...overrides
  }),

  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock Express request object
  mockRequest: (overrides = {}) => ({
    user: { id: 'test-user-id', role: 'customer' },
    params: {},
    query: {},
    body: {},
    headers: {},
    ...overrides
  }),

  // Mock Express response object
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },

  // Mock Next function
  mockNext: () => jest.fn(),

  // Generate random email
  randomEmail: () => `test${Date.now()}@test.com`,

  // Generate random phone
  randomPhone: () => `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,

  // Clean string for comparison
  cleanString: (str) => str.replace(/\s+/g, ' ').trim()
};

// Increase timeout for database operations
jest.setTimeout(30000);
