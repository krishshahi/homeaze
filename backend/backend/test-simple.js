const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint works!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple test server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🧪 Simple test server running on port ${PORT}`);
});

module.exports = app;
