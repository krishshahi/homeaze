const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { SanitizationUtils } = require('../utils/security');
const socketService = require('../services/socketService');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('../config/passport');

// Import new services
const monitoringService = require('../services/monitoringService');
const loggingService = require('../services/loggingService');
const cacheService = require('../services/cacheService');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
// Configure CORS to handle multiple origins
const corsOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:8081'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Performance monitoring middleware
app.use(monitoringService.performanceMiddleware());

// Request logging middleware
app.use(loggingService.requestMiddleware());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware - after body parsing
app.use(mongoSanitize()); // Remove NoSQL injection attempts
app.use(xss()); // Clean user input from malicious HTML

// Custom input sanitization middleware
app.use((req, res, next) => {
  // Sanitize common input fields
  if (req.body) {
    if (req.body.email) {
      req.body.email = SanitizationUtils.sanitizeEmail(req.body.email);
    }
    if (req.body.phone) {
      req.body.phone = SanitizationUtils.sanitizePhone(req.body.phone);
    }
    if (req.body.name) {
      req.body.name = SanitizationUtils.sanitizeInput(req.body.name);
    }
  }
  next();
});

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'homeaze-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/homeaze',
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/homeaze')
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  loggingService.info('MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('📝 Note: MongoDB connection failed, but server will still run for testing');
  loggingService.error('MongoDB connection failed', err);
});

// Routes
try {
  app.use('/api/auth', require('../routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

try {
  app.use('/api/users', require('../routes/users'));
  console.log('✅ Users routes loaded');
} catch (error) {
  console.error('❌ Error loading users routes:', error.message);
}

try {
  app.use('/api/services', require('../routes/services'));
  console.log('✅ Services routes loaded');
} catch (error) {
  console.error('❌ Error loading services routes:', error.message);
}

try {
  app.use('/api/bookings', require('../routes/bookings'));
  console.log('✅ Bookings routes loaded');
} catch (error) {
  console.error('❌ Error loading bookings routes:', error.message);
}

try {
  app.use('/api/providers', require('../routes/providers'));
  console.log('✅ Providers routes loaded');
} catch (error) {
  console.error('❌ Error loading providers routes:', error.message);
}

try {
  app.use('/api/payments', require('../routes/payments'));
  console.log('✅ Enhanced payments routes loaded');
} catch (error) {
  console.error('❌ Error loading payments routes:', error.message);
}

try {
  app.use('/api/reviews', require('../routes/reviewRoutes'));
  console.log('✅ Reviews routes loaded');
} catch (error) {
  console.error('❌ Error loading reviews routes:', error.message);
}

try {
  app.use('/api/dashboard', require('../routes/dashboard'));
  console.log('✅ Dashboard routes loaded');
} catch (error) {
  console.error('❌ Error loading dashboard routes:', error.message);
}

try {
  app.use('/api/oauth', require('../routes/oauth'));
  console.log('✅ OAuth routes loaded');
} catch (error) {
  console.error('❌ Error loading OAuth routes:', error.message);
}

try {
  app.use('/api/sessions', require('../routes/sessions'));
  console.log('✅ Sessions routes loaded');
} catch (error) {
  console.error('❌ Error loading sessions routes:', error.message);
}

try {
  app.use('/api/notifications', require('../routes/notifications'));
  console.log('✅ Notifications routes loaded');
} catch (error) {
  console.error('❌ Error loading notifications routes:', error.message);
}

try {
  app.use('/api/analytics', require('../routes/analytics'));
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error.message);
}

try {
  app.use('/api/monitoring', require('../routes/monitoring'));
  console.log('✅ Monitoring routes loaded');
} catch (error) {
  console.error('❌ Error loading monitoring routes:', error.message);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Homeaze API',
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Error handling middleware
app.use(monitoringService.errorMiddleware());
app.use(loggingService.errorMiddleware());
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error details
  loggingService.error('Express error handler', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Create HTTP server
const http = require('http');
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Socket connection stats endpoint
app.get('/api/socket/stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: socketService.getConnectedUsersCount(),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => monitoringService.gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => monitoringService.gracefulShutdown('SIGINT'));

// Start server - listen on all interfaces to allow mobile device access
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Homeaze API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server initialized`);
  console.log(`📊 Monitoring and logging services active`);
  console.log(`💾 Cache service initialized`);
  
  // Log server startup
  loggingService.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  
  // Cleanup inactive connections every 10 minutes
  setInterval(() => {
    socketService.cleanupInactiveConnections();
  }, 10 * 60 * 1000);
  
  // Log system health every 5 minutes
  setInterval(async () => {
    try {
      const health = await monitoringService.getSystemHealth();
      if (health.status !== 'healthy') {
        loggingService.warn('System health degraded', { health });
      }
    } catch (error) {
      loggingService.error('Health check failed', error);
    }
  }, 5 * 60 * 1000);
});

module.exports = app;
