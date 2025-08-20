const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/homeaze_dev');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Helper functions for generating realistic data
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomPrice = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Address pools for different cities
const addressPools = {
  'New York': {
    streets: ['123 Main St', '456 Broadway', '789 Park Ave', '321 5th Ave', '654 Madison Ave', '987 Wall St', '147 Central Park West', '258 Columbus Ave'],
    zipCodes: ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008'],
    coordinates: [-74.0060, 40.7128]
  },
  'Los Angeles': {
    streets: ['123 Sunset Blvd', '456 Hollywood Blvd', '789 Wilshire Blvd', '321 Melrose Ave', '654 Beverly Dr', '987 Santa Monica Blvd'],
    zipCodes: ['90210', '90211', '90212', '90213', '90214', '90215'],
    coordinates: [-118.2437, 34.0522]
  },
  'Chicago': {
    streets: ['123 Michigan Ave', '456 State St', '789 Lake Shore Dr', '321 Rush St', '654 Division St'],
    zipCodes: ['60601', '60602', '60603', '60604', '60605'],
    coordinates: [-87.6298, 41.8781]
  },
  'San Francisco': {
    streets: ['123 Market St', '456 Mission St', '789 Van Ness Ave', '321 Lombard St', '654 Castro St'],
    zipCodes: ['94102', '94103', '94104', '94105', '94106'],
    coordinates: [-122.4194, 37.7749]
  }
};

const serviceCategories = ['cleaning', 'plumbing', 'electrical', 'hvac', 'painting', 'carpentry', 'gardening', 'pest-control', 'appliance-repair', 'handyman'];
const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];
const cardBrands = ['Visa', 'Mastercard', 'American Express', 'Discover'];
const reviewComments = {
  positive: [
    'Excellent service! Very professional and thorough.',
    'Arrived on time and did a fantastic job. Highly recommended!',
    'Great communication and quality work. Will definitely book again.',
    'Professional, efficient, and affordable. Perfect experience!',
    'Outstanding service! Exceeded my expectations in every way.',
    'Very reliable and trustworthy. Amazing attention to detail.',
    'Fantastic work and very reasonable pricing. Highly satisfied!'
  ],
  neutral: [
    'Good service overall. Job was completed as expected.',
    'Professional service, though a bit expensive.',
    'Work was done properly, no major issues.',
    'Decent service, would consider booking again.',
    'Standard service, nothing exceptional but satisfactory.'
  ],
  negative: [
    'Service was okay but took longer than expected.',
    'Work quality was acceptable but communication could be better.',
    'Had to reschedule twice, which was inconvenient.'
  ]
};

// Enhanced dummy data with more realistic information
const dummyUsers = [
  // Customers
  {
    name: 'John Smith',
    email: 'john.customer@example.com',
    password: 'password123',
    phone: '+1-555-0101',
    userType: 'customer',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      coordinates: { type: 'Point', coordinates: [-74.0060, 40.7128] }
    },
    isVerified: true,
    customerProfile: {
      preferences: {
        preferredServiceTypes: ['cleaning', 'plumbing'],
        preferredTimeSlots: ['morning', 'afternoon'],
        budgetRange: { min: 50, max: 200 }
      },
      bookingHistory: []
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.customer@example.com',
    password: 'password123',
    phone: '+1-555-0102',
    userType: 'customer',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      coordinates: { type: 'Point', coordinates: [-118.2437, 34.0522] }
    },
    isVerified: true,
    customerProfile: {
      preferences: {
        preferredServiceTypes: ['electrical', 'painting'],
        preferredTimeSlots: ['evening'],
        budgetRange: { min: 100, max: 300 }
      },
      bookingHistory: []
    }
  },
  // Service Providers
  {
    name: 'Mike Wilson',
    email: 'mike.provider@example.com',
    password: 'password123',
    phone: '+1-555-0201',
    userType: 'provider',
    address: {
      street: '789 Service Rd',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      coordinates: { type: 'Point', coordinates: [-73.9851, 40.7589] }
    },
    isVerified: true,
    providerProfile: {
      businessName: 'Wilson Cleaning Services',
      businessLicense: 'NYC-CL-2024-001',
      serviceCategories: ['cleaning'],
      experienceYears: 8,
      description: 'Professional residential and commercial cleaning services with eco-friendly products.',
      pricing: {
        hourlyRate: 35,
        minimumCharge: 75
      },
      availability: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHours: { start: '08:00', end: '17:00' }
      },
      verification: {
        backgroundCheck: { status: 'approved', verifiedAt: new Date() },
        documents: [
          { documentType: 'license', url: '/uploads/license1.pdf', verifiedAt: new Date() },
          { documentType: 'insurance', url: '/uploads/insurance1.pdf', verifiedAt: new Date() }
        ]
      },
      rating: { average: 4.8, totalReviews: 156 },
      portfolio: [
        {
          title: 'Office Complex Deep Clean',
          description: 'Complete sanitization of 50-unit office complex',
          images: ['/uploads/portfolio1.jpg'],
          completedAt: new Date('2024-06-15')
        }
      ]
    }
  },
  {
    name: 'Carlos Rodriguez',
    email: 'carlos.provider@example.com',
    password: 'password123',
    phone: '+1-555-0202',
    userType: 'provider',
    address: {
      street: '321 Plumber St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      coordinates: { type: 'Point', coordinates: [-87.6298, 41.8781] }
    },
    isVerified: true,
    providerProfile: {
      businessName: 'Rodriguez Plumbing Solutions',
      businessLicense: 'IL-PL-2024-002',
      serviceCategories: ['plumbing'],
      experienceYears: 12,
      description: 'Licensed master plumber with 24/7 emergency service availability.',
      pricing: {
        hourlyRate: 85,
        minimumCharge: 125
      },
      availability: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        workingHours: { start: '07:00', end: '19:00' }
      },
      verification: {
        backgroundCheck: { status: 'approved', verifiedAt: new Date() },
        documents: [
          { documentType: 'license', url: '/uploads/license2.pdf', verifiedAt: new Date() }
        ]
      },
      rating: { average: 4.9, totalReviews: 234 },
      portfolio: []
    }
  },
  {
    name: 'Lisa Chen',
    email: 'lisa.provider@example.com',
    password: 'password123',
    phone: '+1-555-0203',
    userType: 'provider',
    address: {
      street: '654 Electric Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      coordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] }
    },
    isVerified: true,
    providerProfile: {
      businessName: 'Chen Electrical Services',
      businessLicense: 'CA-EL-2024-003',
      serviceCategories: ['electrical'],
      experienceYears: 6,
      description: 'Certified electrician specializing in residential wiring and smart home installations.',
      pricing: {
        hourlyRate: 95,
        minimumCharge: 150
      },
      availability: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHours: { start: '08:00', end: '18:00' }
      },
      verification: {
        backgroundCheck: { status: 'approved', verifiedAt: new Date() },
        documents: [
          { documentType: 'license', url: '/uploads/license3.pdf', verifiedAt: new Date() }
        ]
      },
      rating: { average: 4.7, totalReviews: 89 },
      portfolio: []
    }
  }
];

const dummyServices = [
  {
    title: 'Deep House Cleaning',
    description: 'Comprehensive deep cleaning service including all rooms, bathrooms, kitchen, and common areas. We use eco-friendly products and professional equipment.',
    category: 'cleaning',
    pricing: {
      type: 'hourly',
      amount: 35,
      currency: 'USD',
      minimumCharge: 75
    },
    duration: {
      estimated: { hours: 3, minutes: 0 },
      maximum: { hours: 5, minutes: 0 }
    },
    serviceAreas: [
      { city: 'New York', state: 'NY', zipCodes: ['10001', '10002', '10003'], radiusKm: 25 }
    ],
    requirements: {
      materials: { provided: true, list: ['cleaning supplies', 'vacuum', 'mop'] },
      access: ['electricity', 'water'],
      preparation: ['Clear surfaces', 'Secure valuables']
    },
    availability: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: { start: '08:00', end: '17:00' },
      emergencyAvailable: false,
      advanceBookingDays: 1
    },
    images: [
      { url: '/uploads/cleaning1.jpg', alt: 'Living room cleaning', isPrimary: true },
      { url: '/uploads/cleaning2.jpg', alt: 'Kitchen cleaning', isPrimary: false }
    ],
    tags: ['eco-friendly', 'deep-clean', 'residential'],
    rating: { average: 4.8, totalReviews: 45 },
    stats: { totalBookings: 67, completedBookings: 62, views: 234 },
    featured: true,
    isActive: true,
    verification: { isVerified: true, verifiedAt: new Date() }
  },
  {
    title: 'Emergency Plumbing Repair',
    description: 'Fast and reliable plumbing repair services including leak fixes, pipe repairs, drain cleaning, and fixture installations. Available 24/7 for emergencies.',
    category: 'plumbing',
    pricing: {
      type: 'hourly',
      amount: 85,
      currency: 'USD',
      minimumCharge: 125
    },
    duration: {
      estimated: { hours: 2, minutes: 0 },
      maximum: { hours: 4, minutes: 0 }
    },
    serviceAreas: [
      { city: 'Chicago', state: 'IL', zipCodes: ['60601', '60602', '60603'], radiusKm: 30 }
    ],
    requirements: {
      materials: { provided: true, list: ['pipes', 'fittings', 'tools'] },
      access: ['water main access', 'electrical'],
      preparation: ['Clear work area', 'Turn off water if emergency']
    },
    availability: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      workingHours: { start: '07:00', end: '19:00' },
      emergencyAvailable: true,
      advanceBookingDays: 0
    },
    images: [
      { url: '/uploads/plumbing1.jpg', alt: 'Pipe repair', isPrimary: true }
    ],
    tags: ['emergency', '24-7', 'licensed'],
    rating: { average: 4.9, totalReviews: 89 },
    stats: { totalBookings: 112, completedBookings: 108, views: 456 },
    featured: true,
    isActive: true,
    verification: { isVerified: true, verifiedAt: new Date() }
  },
  {
    title: 'Electrical Wiring & Smart Home Setup',
    description: 'Professional electrical services including new wiring, outlet installation, smart home device setup, and electrical safety inspections.',
    category: 'electrical',
    pricing: {
      type: 'hourly',
      amount: 95,
      currency: 'USD',
      minimumCharge: 150
    },
    duration: {
      estimated: { hours: 3, minutes: 30 },
      maximum: { hours: 6, minutes: 0 }
    },
    serviceAreas: [
      { city: 'San Francisco', state: 'CA', zipCodes: ['94102', '94103', '94104'], radiusKm: 20 }
    ],
    requirements: {
      materials: { provided: true, list: ['wires', 'outlets', 'smart devices'] },
      access: ['electrical panel', 'attic/basement access'],
      preparation: ['Clear work areas', 'List of smart devices to install']
    },
    availability: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: { start: '08:00', end: '18:00' },
      emergencyAvailable: false,
      advanceBookingDays: 2
    },
    images: [
      { url: '/uploads/electrical1.jpg', alt: 'Smart home setup', isPrimary: true }
    ],
    tags: ['smart-home', 'licensed', 'certified'],
    rating: { average: 4.7, totalReviews: 34 },
    stats: { totalBookings: 45, completedBookings: 42, views: 189 },
    featured: false,
    isActive: true,
    verification: { isVerified: true, verifiedAt: new Date() }
  },
  {
    title: 'Weekly Office Cleaning',
    description: 'Regular weekly cleaning service for offices and commercial spaces. Includes desk cleaning, restroom sanitization, and common area maintenance.',
    category: 'cleaning',
    pricing: {
      type: 'fixed',
      amount: 150,
      currency: 'USD'
    },
    duration: {
      estimated: { hours: 2, minutes: 0 },
      maximum: { hours: 3, minutes: 0 }
    },
    serviceAreas: [
      { city: 'New York', state: 'NY', zipCodes: ['10001', '10002', '10003'], radiusKm: 25 }
    ],
    requirements: {
      materials: { provided: true, list: ['commercial cleaning supplies'] },
      access: ['building access', 'electricity'],
      preparation: ['Office should be empty', 'Secure important documents']
    },
    availability: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: { start: '18:00', end: '22:00' },
      emergencyAvailable: false,
      advanceBookingDays: 3
    },
    images: [
      { url: '/uploads/office-cleaning1.jpg', alt: 'Office cleaning', isPrimary: true }
    ],
    tags: ['commercial', 'weekly', 'eco-friendly'],
    rating: { average: 4.6, totalReviews: 28 },
    stats: { totalBookings: 35, completedBookings: 33, views: 145 },
    featured: false,
    isActive: true,
    verification: { isVerified: true, verifiedAt: new Date() }
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of dummyUsers) {
      // Don't hash password here - let the User model pre-save middleware handle it
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`👤 Created user: ${savedUser.name} (${savedUser.userType})`);
    }

    // Create services and link to providers
    const providers = createdUsers.filter(user => user.userType === 'provider');
    const createdServices = [];
    
    for (let i = 0; i < dummyServices.length; i++) {
      const serviceData = {
        ...dummyServices[i],
        providerId: providers[i % providers.length]._id
      };
      
      const service = new Service(serviceData);
      const savedService = await service.save();
      createdServices.push(savedService);
      console.log(`🔧 Created service: ${savedService.title}`);
    }

    // Generate additional users for more realistic data
    console.log('\n👥 Generating additional users...');
    const additionalUsers = await generateAdditionalUsers(20); // 12 customers, 8 providers
    const allUsers = [...createdUsers, ...additionalUsers];
    const allProviders = allUsers.filter(user => user.userType === 'provider');
    const allCustomers = allUsers.filter(user => user.userType === 'customer');
    
    // Generate additional services
    console.log('\n🔧 Generating additional services...');
    const additionalServices = await generateAdditionalServices(allProviders, 15);
    const allServices = [...createdServices, ...additionalServices];
    
    // Generate realistic booking history (past 6 months)
    console.log('\n📅 Generating booking history...');
    const { bookings: generatedBookings, payments: generatedPayments } = await generateBookingHistory(
      allCustomers, 
      allProviders, 
      allServices, 
      150 // Total bookings
    );
    
    // Generate reviews for completed bookings
    console.log('\n⭐ Generating reviews...');
    const completedBookings = generatedBookings.filter(b => b.status === 'completed');
    const generatedReviews = await generateReviews(completedBookings, 0.8); // 80% of completed bookings have reviews
    
    // Update provider ratings based on reviews
    console.log('\n📊 Updating provider ratings...');
    await updateProviderRatings(allProviders, generatedReviews);
    
    // Generate upcoming bookings (next 2 months)
    console.log('\n📅 Generating upcoming bookings...');
    const { bookings: upcomingBookings } = await generateUpcomingBookings(
      allCustomers, 
      allProviders, 
      allServices, 
      50 // Upcoming bookings
    );
    
    const totalBookings = generatedBookings.length + upcomingBookings.length;
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Comprehensive Summary:');
    console.log(`👥 Total Users created: ${allUsers.length}`);
    console.log(`   - Customers: ${allCustomers.length}`);
    console.log(`   - Providers: ${allProviders.length}`);
    console.log(`🔧 Total Services created: ${allServices.length}`);
    console.log(`📅 Total Bookings created: ${totalBookings}`);
    console.log(`   - Historical: ${generatedBookings.length}`);
    console.log(`   - Upcoming: ${upcomingBookings.length}`);
    console.log(`💳 Payments created: ${generatedPayments.length}`);
    console.log(`⭐ Reviews created: ${generatedReviews.length}`);
    console.log('\n🔑 Test Accounts:');
    console.log('Customer: john.customer@example.com / password123');
    console.log('Customer: sarah.customer@example.com / password123');
    console.log('Provider: mike.provider@example.com / password123');
    console.log('Provider: carlos.provider@example.com / password123');
    console.log('Provider: lisa.provider@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Data generation functions
const generateAdditionalUsers = async (count) => {
  const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const businessTypes = ['Services', 'Solutions', 'Pro', 'Expert', 'Master', 'Elite', 'Premium', 'Quality', 'Reliable', 'Trusted'];
  
  const cities = Object.keys(addressPools);
  const users = [];
  
  // Generate 60% customers, 40% providers
  const customerCount = Math.floor(count * 0.6);
  const providerCount = count - customerCount;
  
  // Generate customers
  for (let i = 0; i < customerCount; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const city = getRandomElement(cities);
    const cityData = addressPools[city];
    
    const userData = {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 100}@example.com`,
      password: 'password123',
      phone: `+1-555-${String(getRandomNumber(1000, 9999))}`,
      userType: 'customer',
      address: {
        street: getRandomElement(cityData.streets),
        city: city,
        state: city === 'New York' ? 'NY' : city === 'Los Angeles' ? 'CA' : city === 'Chicago' ? 'IL' : 'CA',
        zipCode: getRandomElement(cityData.zipCodes),
        coordinates: { type: 'Point', coordinates: cityData.coordinates }
      },
      isVerified: Math.random() > 0.1, // 90% verified
      customerProfile: {
        preferences: {
          preferredServiceTypes: getRandomElement([['cleaning'], ['plumbing'], ['electrical'], ['cleaning', 'plumbing'], ['electrical', 'hvac']]),
          preferredTimeSlots: getRandomElement([['morning'], ['afternoon'], ['evening'], ['morning', 'afternoon']]),
          budgetRange: { min: getRandomNumber(50, 100), max: getRandomNumber(200, 500) }
        },
        bookingHistory: []
      }
    };
    
    const user = new User(userData);
    const savedUser = await user.save();
    users.push(savedUser);
  }
  
  // Generate providers
  for (let i = 0; i < providerCount; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const city = getRandomElement(cities);
    const cityData = addressPools[city];
    const category = getRandomElement(serviceCategories);
    const businessType = getRandomElement(businessTypes);
    
    const userData = {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.provider${i + 100}@example.com`,
      password: 'password123',
      phone: `+1-555-${String(getRandomNumber(2000, 9999))}`,
      userType: 'provider',
      address: {
        street: getRandomElement(cityData.streets),
        city: city,
        state: city === 'New York' ? 'NY' : city === 'Los Angeles' ? 'CA' : city === 'Chicago' ? 'IL' : 'CA',
        zipCode: getRandomElement(cityData.zipCodes),
        coordinates: { type: 'Point', coordinates: cityData.coordinates }
      },
      isVerified: true,
      providerProfile: {
        businessName: `${lastName} ${category.charAt(0).toUpperCase() + category.slice(1)} ${businessType}`,
        businessLicense: `${city.substring(0, 3).toUpperCase()}-${category.substring(0, 2).toUpperCase()}-2024-${String(i + 100).padStart(3, '0')}`,
        serviceCategories: [category],
        experienceYears: getRandomNumber(2, 15),
        description: `Professional ${category} services with ${getRandomNumber(2, 15)} years of experience. Licensed and insured.`,
        pricing: {
          hourlyRate: getRandomPrice(30, 120),
          minimumCharge: getRandomPrice(75, 200)
        },
        availability: {
          workingDays: getRandomElement([
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          ]),
          workingHours: { start: '08:00', end: getRandomElement(['17:00', '18:00', '19:00']) }
        },
        verification: {
          backgroundCheck: { status: 'approved', verifiedAt: new Date() },
          documents: [
            { documentType: 'license', url: `/uploads/license${i + 100}.pdf`, verifiedAt: new Date() }
          ]
        },
        rating: { average: getRandomPrice(4.0, 5.0), totalReviews: getRandomNumber(5, 200) },
        portfolio: []
      }
    };
    
    const user = new User(userData);
    const savedUser = await user.save();
    users.push(savedUser);
  }
  
  console.log(`Generated ${users.length} additional users (${customerCount} customers, ${providerCount} providers)`);
  return users;
};

const generateAdditionalServices = async (providers, count) => {
  const serviceTemplates = {
    cleaning: [
      { title: 'Regular House Cleaning', desc: 'Weekly or bi-weekly house cleaning service', pricing: { type: 'hourly', amount: 30, min: 60 } },
      { title: 'Move-in/Move-out Cleaning', desc: 'Thorough cleaning for moving', pricing: { type: 'fixed', amount: 200 } },
      { title: 'Post-Construction Cleanup', desc: 'Cleaning after renovation work', pricing: { type: 'hourly', amount: 40, min: 100 } }
    ],
    plumbing: [
      { title: 'Toilet Repair & Installation', desc: 'Toilet fixing and replacement', pricing: { type: 'fixed', amount: 150 } },
      { title: 'Water Heater Service', desc: 'Water heater repair and maintenance', pricing: { type: 'hourly', amount: 90, min: 120 } },
      { title: 'Drain Cleaning', desc: 'Unclog drains and sewers', pricing: { type: 'fixed', amount: 100 } }
    ],
    electrical: [
      { title: 'Outlet Installation', desc: 'Install new electrical outlets', pricing: { type: 'fixed', amount: 80 } },
      { title: 'Light Fixture Installation', desc: 'Install ceiling fans and light fixtures', pricing: { type: 'fixed', amount: 120 } },
      { title: 'Electrical Panel Upgrade', desc: 'Upgrade electrical panels', pricing: { type: 'quote', amount: 0 } }
    ],
    hvac: [
      { title: 'AC Repair & Maintenance', desc: 'Air conditioning service and repair', pricing: { type: 'hourly', amount: 75, min: 100 } },
      { title: 'Heating System Service', desc: 'Furnace and heating system maintenance', pricing: { type: 'fixed', amount: 150 } }
    ],
    painting: [
      { title: 'Interior Painting', desc: 'Professional interior painting service', pricing: { type: 'hourly', amount: 45, min: 200 } },
      { title: 'Exterior Painting', desc: 'House exterior painting', pricing: { type: 'quote', amount: 0 } }
    ],
    gardening: [
      { title: 'Lawn Mowing Service', desc: 'Regular lawn maintenance', pricing: { type: 'fixed', amount: 50 } },
      { title: 'Garden Design & Landscaping', desc: 'Complete garden transformation', pricing: { type: 'quote', amount: 0 } }
    ]
  };
  
  const services = [];
  
  for (let i = 0; i < count; i++) {
    const provider = getRandomElement(providers);
    const category = provider.providerProfile.serviceCategories[0];
    const templates = serviceTemplates[category] || serviceTemplates.cleaning;
    const template = getRandomElement(templates);
    
    const serviceData = {
      title: template.title,
      description: template.desc + '. Professional service with guaranteed satisfaction.',
      category: category,
      providerId: provider._id,
      pricing: {
        type: template.pricing.type,
        amount: template.pricing.amount,
        currency: 'USD',
        minimumCharge: template.pricing.min
      },
      duration: {
        estimated: { hours: getRandomNumber(1, 4), minutes: getRandomElement([0, 30]) },
        maximum: { hours: getRandomNumber(3, 8), minutes: 0 }
      },
      serviceAreas: [
        {
          city: provider.address.city,
          state: provider.address.state,
          zipCodes: addressPools[provider.address.city]?.zipCodes || ['00000'],
          radiusKm: getRandomNumber(15, 40)
        }
      ],
      requirements: {
        materials: { provided: Math.random() > 0.3, list: ['basic tools', 'supplies'] },
        access: ['electricity'],
        preparation: ['Clear work area']
      },
      availability: provider.providerProfile.availability,
      images: [{ url: `/uploads/${category}${i + 1}.jpg`, alt: template.title, isPrimary: true }],
      tags: [category, 'professional', 'licensed'],
      rating: { average: getRandomPrice(3.5, 5.0), totalReviews: getRandomNumber(0, 50) },
      stats: {
        totalBookings: getRandomNumber(0, 100),
        completedBookings: getRandomNumber(0, 90),
        views: getRandomNumber(50, 500)
      },
      featured: Math.random() > 0.8, // 20% chance of being featured
      isActive: true,
      verification: { isVerified: true, verifiedAt: new Date() }
    };
    
    const service = new Service(serviceData);
    const savedService = await service.save();
    services.push(savedService);
  }
  
  console.log(`Generated ${services.length} additional services`);
  return services;
};

const generateBookingHistory = async (customers, providers, services, count) => {
  const bookings = [];
  const payments = [];
  const statuses = ['completed', 'completed', 'completed', 'completed', 'cancelled', 'no-show']; // 66% completed
  const paymentStatuses = ['completed', 'completed', 'completed', 'failed', 'refunded'];
  
  // Generate bookings for the past 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const now = new Date();
  now.setDate(now.getDate() - 1); // Up to yesterday
  
  for (let i = 0; i < count; i++) {
    const customer = getRandomElement(customers);
    const service = getRandomElement(services);
    const provider = providers.find(p => p._id.equals(service.providerId));
    
    if (!provider) continue;
    
    const scheduledDate = getRandomDate(sixMonthsAgo, now);
    const status = getRandomElement(statuses);
    const estimatedCost = getRandomPrice(service.pricing.minimumCharge || 50, 500);
    
    const bookingData = {
      customerId: customer._id,
      providerId: provider._id,
      serviceId: service._id,
      serviceDetails: {
        title: service.title,
        description: service.description,
        category: service.category
      },
      scheduledDate: scheduledDate,
      scheduledTime: {
        start: getRandomElement(['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']),
        end: getRandomElement(['11:00', '12:00', '16:00', '17:00', '18:00']),
        timeZone: 'America/New_York'
      },
      status: status,
      location: {
        address: {
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          zipCode: customer.address.zipCode,
          instructions: getRandomElement(['Ring doorbell', 'Call upon arrival', 'Side entrance', 'Apt 3B'])
        },
        coordinates: {
          latitude: (customer.address && customer.address.coordinates && Array.isArray(customer.address.coordinates.coordinates)) ? customer.address.coordinates.coordinates[1] : 0,
          longitude: (customer.address && customer.address.coordinates && Array.isArray(customer.address.coordinates.coordinates)) ? customer.address.coordinates.coordinates[0] : 0
        }
      },
      serviceRequirements: {
        description: `${service.title} service requested`,
        specialInstructions: getRandomElement(['Standard service', 'Focus on problem areas', 'Rush job', 'Take special care'])
      },
      pricing: {
        estimatedCost: estimatedCost,
        finalCost: status === 'completed' ? getRandomPrice(estimatedCost * 0.9, estimatedCost * 1.2) : estimatedCost,
        currency: 'USD'
      },
      payment: {
        method: getRandomElement(paymentMethods),
        status: status === 'completed' ? 'completed' : getRandomElement(paymentStatuses)
      },
      createdAt: getRandomDate(new Date(scheduledDate.getTime() - 7 * 24 * 60 * 60 * 1000), scheduledDate)
    };
    
    if (status === 'completed') {
      bookingData.completion = {
        completedAt: new Date(scheduledDate.getTime() + getRandomNumber(2, 6) * 60 * 60 * 1000),
        workPerformed: `${service.title} completed as requested`,
        additionalNotes: getRandomElement(['Great service', 'Customer satisfied', 'No issues', 'Excellent work'])
      };
    }
    
    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    bookings.push(savedBooking);
    
    // Create payment record for completed bookings
    if (status === 'completed' && bookingData.payment.status === 'completed') {
      const paymentMethod = getRandomElement(paymentMethods);
      const grossAmount = bookingData.pricing.finalCost;
      
      // Generate paymentId manually to ensure it's always present during seeding
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const paymentId = `PAY-${timestamp.slice(-8)}-${random}`;
      
      const paymentData = {
        paymentId: paymentId, // Explicitly set paymentId to avoid validation errors
        bookingId: savedBooking._id,
        customerId: customer._id,
        providerId: provider._id,
        amount: {
          gross: grossAmount,
          currency: 'USD'
        },
        paymentMethod: {
          type: paymentMethod,
          details: {
            cardLastFour: paymentMethod.includes('card') ? String(getRandomNumber(1000, 9999)) : undefined,
            cardBrand: paymentMethod.includes('card') ? getRandomElement(cardBrands) : undefined
          }
        },
        status: 'completed',
        transactionIds: {
          gateway: `stripe_${Date.now()}_${getRandomNumber(1000, 9999)}`,
          internal: `hmz_${Date.now()}_${getRandomNumber(1000, 9999)}`
        },
        timestamps: {
          initiated: bookingData.createdAt,
          completed: new Date(bookingData.createdAt.getTime() + getRandomNumber(1, 5) * 60 * 1000)
        },
        createdAt: bookingData.createdAt
      };
      
      const payment = new Payment(paymentData);
      payment.calculateFees(); // Calculate platform fees
      const savedPayment = await payment.save();
      payments.push(savedPayment);
    }
  }
  
  console.log(`Generated ${bookings.length} historical bookings and ${payments.length} payments`);
  return { bookings, payments };
};

const generateReviews = async (completedBookings, reviewRate) => {
  const reviews = [];
  const bookingsToReview = completedBookings.slice(0, Math.floor(completedBookings.length * reviewRate));
  
  for (const booking of bookingsToReview) {
    const rating = getRandomNumber(3, 5); // Most reviews are positive
    const commentType = rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative';
    const comment = getRandomElement(reviewComments[commentType]);
    
    // Generate reviewId manually to ensure it's always present during seeding
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reviewId = `REV-${timestamp.slice(-8)}-${random}`;
    
    const reviewData = {
      reviewId: reviewId, // Explicitly set reviewId to avoid validation errors
      bookingId: booking._id,
      customerId: booking.customerId,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating: {
        overall: rating,
        aspects: {
          quality: Math.max(1, Math.min(5, rating + getRandomNumber(-1, 1))),
          punctuality: Math.max(1, Math.min(5, rating + getRandomNumber(-1, 1))),
          communication: Math.max(1, Math.min(5, rating + getRandomNumber(-1, 1))),
          cleanliness: Math.max(1, Math.min(5, rating + getRandomNumber(-1, 1))),
          valueForMoney: Math.max(1, Math.min(5, rating + getRandomNumber(-1, 1)))
        }
      },
      comment: {
        content: comment,
        pros: rating >= 4 ? ['Professional service', 'On time', 'Quality work'] : [],
        cons: rating < 4 ? ['Could be better', 'Minor issues'] : []
      },
      status: 'published',
      verification: {
        isVerified: true,
        verifiedAt: new Date(),
        verificationMethod: 'booking_completion'
      },
      helpfulnessScore: {
        helpful: getRandomNumber(0, 20),
        notHelpful: getRandomNumber(0, 5),
        total: 0
      },
      createdAt: new Date(booking.completion?.completedAt || booking.scheduledDate)
    };
    
    reviewData.helpfulnessScore.total = reviewData.helpfulnessScore.helpful + reviewData.helpfulnessScore.notHelpful;
    
    const review = new Review(reviewData);
    const savedReview = await review.save();
    reviews.push(savedReview);
  }
  
  console.log(`Generated ${reviews.length} reviews`);
  return reviews;
};

const generateUpcomingBookings = async (customers, providers, services, count) => {
  const bookings = [];
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'in-progress'];
  
  // Generate bookings for the next 2 months
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const twoMonthsLater = new Date();
  twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
  
  for (let i = 0; i < count; i++) {
    const customer = getRandomElement(customers);
    const service = getRandomElement(services);
    const provider = providers.find(p => p._id.equals(service.providerId));
    
    if (!provider) continue;
    
    const scheduledDate = getRandomDate(tomorrow, twoMonthsLater);
    const status = getRandomElement(statuses);
    const estimatedCost = getRandomPrice(service.pricing.minimumCharge || 50, 500);
    
    const bookingData = {
      customerId: customer._id,
      providerId: provider._id,
      serviceId: service._id,
      serviceDetails: {
        title: service.title,
        description: service.description,
        category: service.category
      },
      scheduledDate: scheduledDate,
      scheduledTime: {
        start: getRandomElement(['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']),
        end: getRandomElement(['11:00', '12:00', '16:00', '17:00', '18:00']),
        timeZone: 'America/New_York'
      },
      status: status,
      location: {
        address: {
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          zipCode: customer.address.zipCode,
          instructions: getRandomElement(['Ring doorbell', 'Call upon arrival', 'Side entrance', 'Apt 3B'])
        },
        coordinates: {
          latitude: (customer.address && customer.address.coordinates && Array.isArray(customer.address.coordinates.coordinates)) ? customer.address.coordinates.coordinates[1] : 0,
          longitude: (customer.address && customer.address.coordinates && Array.isArray(customer.address.coordinates.coordinates)) ? customer.address.coordinates.coordinates[0] : 0
        }
      },
      serviceRequirements: {
        description: `${service.title} service requested`,
        specialInstructions: getRandomElement(['Standard service', 'Focus on problem areas', 'Rush job', 'Take special care'])
      },
      pricing: {
        estimatedCost: estimatedCost,
        currency: 'USD'
      },
      payment: {
        method: getRandomElement(paymentMethods),
        status: status === 'confirmed' ? 'completed' : 'pending'
      },
      createdAt: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
    };
    
    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    bookings.push(savedBooking);
  }
  
  console.log(`Generated ${bookings.length} upcoming bookings`);
  return { bookings };
};

const updateProviderRatings = async (providers, reviews) => {
  for (const provider of providers) {
    const providerReviews = reviews.filter(r => r.providerId.equals(provider._id));
    
    if (providerReviews.length > 0) {
      const totalRating = providerReviews.reduce((sum, review) => sum + review.rating.overall, 0);
      const averageRating = Math.round((totalRating / providerReviews.length) * 10) / 10;
      
      await User.findByIdAndUpdate(provider._id, {
        'providerProfile.rating.average': averageRating,
        'providerProfile.rating.totalReviews': providerReviews.length
      });
    }
  }
  
  console.log('Updated provider ratings based on reviews');
};

// Run seeder
connectDB().then(() => {
  seedDatabase();
});
