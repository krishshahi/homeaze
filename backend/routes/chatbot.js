const express = require('express');
const { body } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  processMessage,
  getSuggestions,
  getChatHistory
} = require('../controllers/chatbotController');

const router = express.Router();

// @route   POST /api/chatbot/message
// @desc    Process chatbot message
// @access  Public (works better with auth but not required)
router.post('/message', [
  optionalAuth,
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
], processMessage);

// @route   GET /api/chatbot/suggestions
// @desc    Get chatbot suggestions by category
// @access  Public
router.get('/suggestions', getSuggestions);

// @route   GET /api/chatbot/history
// @desc    Get user's chat history
// @access  Private
router.get('/history', auth, getChatHistory);

module.exports = router;
