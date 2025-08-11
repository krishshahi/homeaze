const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// Simple AI responses for chatbot (In production, integrate with OpenAI API)
const chatbotResponses = {
  greeting: [
    "Hello! I'm HomeAze Assistant. How can I help you today?",
    "Hi there! I'm here to help you find the perfect home service. What do you need?",
    "Welcome to HomeAze! How can I assist you with your home service needs?"
  ],
  services: {
    cleaning: "I can help you find cleaning services. We offer house cleaning, deep cleaning, and office cleaning. Would you like to see available cleaners in your area?",
    plumbing: "Looking for plumbing services? We have certified plumbers for repairs, installations, and emergency services. What's your plumbing issue?",
    electrical: "Need an electrician? Our certified electricians can help with installations, repairs, and electrical inspections. What electrical work do you need?",
    hvac: "HVAC services available! We offer heating, ventilation, and air conditioning installation, repair, and maintenance. What HVAC service do you need?",
    painting: "Looking for painting services? We have professional painters for interior and exterior painting. What painting project do you have in mind?",
    gardening: "Garden services available! We offer landscaping, lawn care, tree trimming, and garden maintenance. What gardening help do you need?"
  },
  booking: {
    how_to_book: "Booking is easy! Just search for a service, select a provider, choose your preferred date and time, and confirm your booking. Would you like me to help you find a service?",
    cancel_booking: "You can cancel your booking up to 24 hours before the scheduled time through your dashboard or by contacting support. Do you need help with a specific booking?",
    reschedule: "You can reschedule your booking up to 48 hours in advance. Go to your bookings dashboard and select 'Reschedule'. Need help with a specific booking?"
  },
  pricing: "Our pricing varies by service type and provider. You'll see transparent pricing before booking, with no hidden fees. Most services offer hourly rates or fixed pricing. Would you like to see prices for a specific service?",
  emergency: "For emergency services, use our emergency booking feature. Available 24/7 for urgent plumbing, electrical, and HVAC issues. Do you have an emergency situation?",
  default: [
    "I'm not sure I understand. Could you please rephrase your question?",
    "I'm here to help with home services. Could you be more specific about what you need?",
    "Let me help you better. Are you looking for a specific home service or need help with booking?"
  ]
};

// Intent detection (simple keyword matching - in production use NLP)
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Greeting detection
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'greeting';
  }
  
  // Service categories
  if (lowerMessage.includes('clean')) return 'cleaning';
  if (lowerMessage.includes('plumb') || lowerMessage.includes('leak') || lowerMessage.includes('pipe')) return 'plumbing';
  if (lowerMessage.includes('electric') || lowerMessage.includes('wiring') || lowerMessage.includes('power')) return 'electrical';
  if (lowerMessage.includes('hvac') || lowerMessage.includes('heating') || lowerMessage.includes('cooling') || lowerMessage.includes('air condition')) return 'hvac';
  if (lowerMessage.includes('paint')) return 'painting';
  if (lowerMessage.includes('garden') || lowerMessage.includes('lawn') || lowerMessage.includes('landscape')) return 'gardening';
  
  // Booking related
  if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) return 'booking';
  if (lowerMessage.includes('cancel')) return 'cancel_booking';
  if (lowerMessage.includes('reschedule') || lowerMessage.includes('change date')) return 'reschedule';
  
  // Pricing
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) return 'pricing';
  
  // Emergency
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('asap')) return 'emergency';
  
  return 'default';
};

// Get random response from array
const getRandomResponse = (responses) => {
  if (Array.isArray(responses)) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  return responses;
};

// @desc    Process chatbot message
// @route   POST /api/chatbot/message
// @access  Public
const processMessage = async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Detect intent
    const intent = detectIntent(message);
    let response = '';
    let suggestions = [];
    let actionData = null;

    switch (intent) {
      case 'greeting':
        response = getRandomResponse(chatbotResponses.greeting);
        suggestions = [
          'Find cleaning services',
          'Book a plumber',
          'Get electrician',
          'See all services'
        ];
        break;
        
      case 'cleaning':
      case 'plumbing':
      case 'electrical':
      case 'hvac':
      case 'painting':
      case 'gardening':
        response = chatbotResponses.services[intent];
        // Get available services for this category
        const availableServices = await Service.find({
          category: intent,
          isActive: true
        }).limit(3).populate('providerId', 'name providerProfile.rating');
        
        actionData = {
          type: 'services_list',
          services: availableServices.map(service => ({
            id: service._id,
            title: service.title,
            provider: service.providerId.name,
            rating: service.providerId.providerProfile?.rating?.average || 0,
            startingPrice: service.startingPrice
          }))
        };
        
        suggestions = [
          'Book this service',
          'See more options',
          'Check reviews',
          'Get pricing details'
        ];
        break;
        
      case 'booking':
        response = chatbotResponses.booking.how_to_book;
        suggestions = [
          'Find services near me',
          'Check my bookings',
          'Emergency service',
          'Talk to support'
        ];
        break;
        
      case 'cancel_booking':
        response = chatbotResponses.booking.cancel_booking;
        if (userId) {
          // Get user's recent bookings
          const recentBookings = await Booking.find({
            customerId: userId,
            status: { $in: ['pending', 'confirmed'] }
          }).limit(3).populate('serviceId', 'title').sort({ createdAt: -1 });
          
          actionData = {
            type: 'bookings_list',
            bookings: recentBookings.map(booking => ({
              id: booking._id,
              bookingNumber: booking.bookingNumber,
              serviceName: booking.serviceId.title,
              scheduledDate: booking.scheduledDate,
              status: booking.status
            }))
          };
        }
        suggestions = ['View my bookings', 'Contact support'];
        break;
        
      case 'reschedule':
        response = chatbotResponses.booking.reschedule;
        suggestions = ['View my bookings', 'Contact support'];
        break;
        
      case 'pricing':
        response = chatbotResponses.pricing;
        suggestions = [
          'Cleaning prices',
          'Plumbing rates',
          'Electrical costs',
          'All service prices'
        ];
        break;
        
      case 'emergency':
        response = chatbotResponses.emergency;
        // Get emergency services
        const emergencyServices = await Service.find({
          'availability.emergencyAvailable': true,
          isActive: true
        }).limit(5).populate('providerId', 'name phone');
        
        actionData = {
          type: 'emergency_services',
          services: emergencyServices.map(service => ({
            id: service._id,
            title: service.title,
            category: service.category,
            provider: service.providerId.name,
            phone: service.providerId.phone
          }))
        };
        
        suggestions = [
          'Call emergency plumber',
          'Find emergency electrician',
          'Book urgent service'
        ];
        break;
        
      default:
        response = getRandomResponse(chatbotResponses.default);
        suggestions = [
          'Find services',
          'Check my bookings',
          'Get help',
          'Contact support'
        ];
    }

    // Log conversation (in production, store in database)
    console.log(`Chatbot conversation - Session: ${sessionId}, User: ${userId}, Intent: ${intent}`);

    res.status(200).json({
      success: true,
      data: {
        response,
        intent,
        suggestions,
        actionData,
        sessionId: sessionId || Date.now().toString(),
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'I\'m having trouble right now. Please try again or contact support.',
      data: {
        response: 'I\'m having trouble right now. Please try again or contact support.',
        suggestions: ['Contact support', 'Try again later']
      }
    });
  }
};

// @desc    Get chatbot suggestions
// @route   GET /api/chatbot/suggestions
// @access  Public
const getSuggestions = async (req, res) => {
  try {
    const { category } = req.query;

    let suggestions = [];

    if (category === 'services') {
      suggestions = [
        'Find cleaning services',
        'Book a plumber',
        'Get electrician',
        'HVAC services',
        'Painting services',
        'Garden maintenance'
      ];
    } else if (category === 'booking') {
      suggestions = [
        'How to book a service?',
        'Cancel my booking',
        'Reschedule appointment',
        'Check booking status',
        'Emergency booking'
      ];
    } else if (category === 'help') {
      suggestions = [
        'How does pricing work?',
        'Service guarantees',
        'Payment methods',
        'Contact support',
        'Report an issue'
      ];
    } else {
      // Default suggestions
      suggestions = [
        'What services do you offer?',
        'How to book a service?',
        'Check service pricing',
        'Emergency services',
        'Talk to support'
      ];
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        category: category || 'general'
      }
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions'
    });
  }
};

// @desc    Get chat history (if user is logged in)
// @route   GET /api/chatbot/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    // In production, you'd store chat history in database
    // For now, return empty history
    res.status(200).json({
      success: true,
      data: {
        history: [],
        message: 'Chat history feature coming soon'
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting chat history'
    });
  }
};

module.exports = {
  processMessage,
  getSuggestions,
  getChatHistory
};
