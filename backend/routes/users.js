const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProfile = user.getPublicProfile();

    res.json({
      success: true,
      data: {
        user: userProfile
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('address.street').optional().trim().isString(),
  body('address.city').optional().trim().isString(),
  body('address.state').optional().trim().isString(),
  body('address.zipCode').optional().trim().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'phone', 'address', 'avatar'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProfile = user.getPublicProfile();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userProfile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/users/provider-profile
// @desc    Update provider-specific profile
// @access  Private (Provider only)
router.put('/provider-profile', auth, [
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('experienceYears')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
  body('serviceCategories')
    .optional()
    .isArray()
    .withMessage('Service categories must be an array'),
  body('pricing.hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be non-negative'),
  body('pricing.minimumCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum charge must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Provider account required.'
      });
    }

    const allowedUpdates = [
      'businessName', 'description', 'experienceYears', 'serviceCategories',
      'pricing', 'availability', 'businessLicense'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[`providerProfile.${key}`] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    const userProfile = updatedUser.getPublicProfile();

    res.json({
      success: true,
      message: 'Provider profile updated successfully',
      data: {
        user: userProfile
      }
    });

  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating provider profile'
    });
  }
});

// @route   PUT /api/users/customer-preferences
// @desc    Update customer preferences
// @access  Private (Customer only)
router.put('/customer-preferences', auth, [
  body('preferredServiceTypes')
    .optional()
    .isArray()
    .withMessage('Preferred service types must be an array'),
  body('preferredTimeSlots')
    .optional()
    .isArray()
    .withMessage('Preferred time slots must be an array'),
  body('budgetRange.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min budget must be non-negative'),
  body('budgetRange.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max budget must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Customer account required.'
      });
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      updates[`customerProfile.preferences.${key}`] = req.body[key];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    const userProfile = updatedUser.getPublicProfile();

    res.json({
      success: true,
      message: 'Customer preferences updated successfully',
      data: {
        user: userProfile
      }
    });

  } catch (error) {
    console.error('Update customer preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating customer preferences'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', auth, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to deactivate account'),
  body('reason')
    .optional()
    .trim()
    .isString()
    .withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { password, reason } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Deactivate account
    await User.findByIdAndUpdate(req.userId, {
      isActive: false,
      deactivatedAt: new Date(),
      deactivationReason: reason || 'User requested deactivation'
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating account'
    });
  }
});

// @route   GET /api/users/:id/public
// @desc    Get public user profile
// @access  Public
router.get('/:id/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return limited public information
    const publicProfile = {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      userType: user.userType,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    // Add provider-specific public info
    if (user.userType === 'provider' && user.providerProfile) {
      publicProfile.providerProfile = {
        businessName: user.providerProfile.businessName,
        description: user.providerProfile.description,
        experienceYears: user.providerProfile.experienceYears,
        serviceCategories: user.providerProfile.serviceCategories,
        rating: user.providerProfile.rating,
        portfolio: user.providerProfile.portfolio
      };
    }

    res.json({
      success: true,
      data: {
        user: publicProfile
      }
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public profile'
    });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, async (req, res) => {
  try {
    // This would typically handle file upload using multer or similar
    // For now, we'll just accept a URL
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users (mainly for finding providers)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, userType = 'provider', category, city, page = 1, limit = 10 } = req.query;

    const filters = {
      isActive: true,
      userType
    };

    if (q) {
      filters.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'providerProfile.businessName': { $regex: q, $options: 'i' } },
        { 'providerProfile.description': { $regex: q, $options: 'i' } }
      ];
    }

    if (category) {
      filters['providerProfile.serviceCategories'] = category;
    }

    if (city) {
      filters['address.city'] = { $regex: city, $options: 'i' };
    }

    const users = await User.find(filters)
      .select('name avatar userType address providerProfile.businessName providerProfile.rating providerProfile.serviceCategories isVerified createdAt')
      .sort({ 'providerProfile.rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filters);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
});

module.exports = router;
