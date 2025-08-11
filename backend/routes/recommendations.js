const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  getServiceRecommendations,
  getProviderRecommendations,
  getTrendingServices
} = require('../controllers/recommendationController');

const router = express.Router();

// @route   GET /api/recommendations/services
// @desc    Get personalized service recommendations
// @access  Private
router.get('/services', auth, getServiceRecommendations);

// @route   GET /api/recommendations/providers
// @desc    Get recommended providers
// @access  Private
router.get('/providers', auth, getProviderRecommendations);

// @route   GET /api/recommendations/trending
// @desc    Get trending services
// @access  Public
router.get('/trending', optionalAuth, getTrendingServices);

module.exports = router;
