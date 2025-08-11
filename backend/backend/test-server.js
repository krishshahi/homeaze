const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test individual routes
try {
  console.log('Loading auth routes...');
  app.use('/api/auth', require('./routes/auth'));
  console.log('Auth routes loaded successfully');
} catch (error) {
  console.error('Error loading auth routes:', error.message);
}

try {
  console.log('Loading users routes...');
  app.use('/api/users', require('./routes/users'));
  console.log('Users routes loaded successfully');
} catch (error) {
  console.error('Error loading users routes:', error.message);
}

try {
  console.log('Loading services routes...');
  app.use('/api/services', require('./routes/services'));
  console.log('Services routes loaded successfully');
} catch (error) {
  console.error('Error loading services routes:', error.message);
}

try {
  console.log('Loading bookings routes...');
  app.use('/api/bookings', require('./routes/bookings'));
  console.log('Bookings routes loaded successfully');
} catch (error) {
  console.error('Error loading bookings routes:', error.message);
}

try {
  console.log('Loading providers routes...');
  app.use('/api/providers', require('./routes/providers'));
  console.log('Providers routes loaded successfully');
} catch (error) {
  console.error('Error loading providers routes:', error.message);
}

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

module.exports = app;
