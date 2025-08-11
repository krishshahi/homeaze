const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// Helper function to get date ranges
const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const thisWeek = new Date(today);
  thisWeek.setDate(today.getDate() - today.getDay());
  
  const lastWeek = new Date(thisWeek);
  lastWeek.setDate(thisWeek.getDate() - 7);
  
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const thisYear = new Date(now.getFullYear(), 0, 1);
  const lastYear = new Date(thisYear);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  return {
    today,
    yesterday,
    thisWeek,
    lastWeek,
    thisMonth,
    lastMonth,
    thisYear,
    lastYear,
    now
  };
};

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview statistics
// @access  Public (for testing)
router.get('/overview', async (req, res) => {
  try {
    const dates = getDateRanges();

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ userType: 'customer' });
    const totalProviders = await User.countDocuments({ userType: 'provider' });
    const totalServices = await Service.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalReviews = await Review.countDocuments();

    // This month vs last month comparisons
    const thisMonthUsers = await User.countDocuments({ 
      createdAt: { $gte: dates.thisMonth } 
    });
    const lastMonthUsers = await User.countDocuments({ 
      createdAt: { $gte: dates.lastMonth, $lt: dates.thisMonth } 
    });

    const thisMonthBookings = await Booking.countDocuments({ 
      createdAt: { $gte: dates.thisMonth } 
    });
    const lastMonthBookings = await Booking.countDocuments({ 
      createdAt: { $gte: dates.lastMonth, $lt: dates.thisMonth } 
    });

    // Revenue calculations
    const thisMonthRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dates.thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount.gross' }
        }
      }
    ]);

    const lastMonthRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dates.lastMonth, $lt: dates.thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount.gross' }
        }
      }
    ]);

    const currentRevenue = thisMonthRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;

    // Calculate percentage changes
    const userGrowth = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100) 
      : 100;

    const bookingGrowth = lastMonthBookings > 0 
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings * 100) 
      : 100;

    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100) 
      : 100;

    // Active bookings (upcoming and in-progress)
    const activeBookings = await Booking.countDocuments({
      status: { $in: ['confirmed', 'in-progress'] },
      scheduledDate: { $gte: dates.today }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalProviders,
        totalServices,
        totalBookings,
        totalPayments,
        totalReviews,
        activeBookings,
        currentRevenue: Math.round(currentRevenue * 100) / 100,
        growth: {
          users: Math.round(userGrowth * 10) / 10,
          bookings: Math.round(bookingGrowth * 10) / 10,
          revenue: Math.round(revenueGrowth * 10) / 10
        },
        thisMonth: {
          users: thisMonthUsers,
          bookings: thisMonthBookings,
          revenue: Math.round(currentRevenue * 100) / 100
        },
        lastMonth: {
          users: lastMonthUsers,
          bookings: lastMonthBookings,
          revenue: Math.round(previousRevenue * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics for charts and graphs
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const dates = getDateRanges();

    // Revenue analytics (last 12 months)
    const revenueAnalytics = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(dates.now.getFullYear() - 1, dates.now.getMonth(), 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount.gross' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Booking status distribution
    const bookingStatusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Service category popularity
    const serviceCategoryStats = await Booking.aggregate([
      {
        $group: {
          _id: '$serviceDetails.category',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.finalCost' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // User registration trends (last 30 days)
    const userRegistrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(dates.now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          customers: {
            $sum: { $cond: [{ $eq: ['$userType', 'customer'] }, 1, 0] }
          },
          providers: {
            $sum: { $cond: [{ $eq: ['$userType', 'provider'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Top performing providers
    const topProviders = await User.aggregate([
      {
        $match: { userType: 'provider' }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'providerId',
          as: 'bookings'
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'providerId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          totalBookings: { $size: '$bookings' },
          completedBookings: {
            $size: {
              $filter: {
                input: '$bookings',
                cond: { $eq: ['$$this.status', 'completed'] }
              }
            }
          },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating.overall' },
              else: 0
            }
          },
          totalReviews: { $size: '$reviews' }
        }
      },
      {
        $sort: { totalBookings: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          'providerProfile.businessName': 1,
          'providerProfile.serviceCategories': 1,
          totalBookings: 1,
          completedBookings: 1,
          averageRating: { $round: ['$averageRating', 1] },
          totalReviews: 1
        }
      }
    ]);

    // Recent activity (last 7 days)
    const recentActivity = await Booking.find({
      createdAt: { $gte: new Date(dates.now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    })
    .populate('customerId', 'name email')
    .populate('providerId', 'name providerProfile.businessName')
    .populate('serviceId', 'title category')
    .sort({ createdAt: -1 })
    .limit(20)
    .select('customerId providerId serviceId status scheduledDate pricing createdAt');

    res.json({
      success: true,
      data: {
        revenueAnalytics,
        bookingStatusStats,
        serviceCategoryStats,
        userRegistrationTrends,
        topProviders,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/recent-bookings
// @desc    Get recent bookings for dashboard
// @access  Private (Admin only)
router.get('/recent-bookings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentBookings = await Booking.find()
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name providerProfile.businessName')
      .populate('serviceId', 'title category')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('customerId providerId serviceId status scheduledDate pricing location createdAt');

    res.json({
      success: true,
      data: recentBookings
    });

  } catch (error) {
    console.error('Recent bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent bookings',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/revenue-stats
// @desc    Get detailed revenue statistics
// @access  Private (Admin only)
router.get('/revenue-stats', async (req, res) => {
  try {
    const dates = getDateRanges();

    // Total revenue
    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount.gross' },
          fees: { $sum: '$amount.fees.total' },
          net: { $sum: '$amount.net' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Today's revenue
    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dates.today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount.gross' },
          count: { $sum: 1 }
        }
      }
    ]);

    // This week's revenue
    const weekRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: dates.thisWeek }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount.gross' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue by service category
    const revenueByCategory = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking'
        }
      },
      {
        $unwind: '$booking'
      },
      {
        $group: {
          _id: '$booking.serviceDetails.category',
          revenue: { $sum: '$amount.gross' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    const stats = totalRevenue[0] || { total: 0, fees: 0, net: 0, count: 0 };
    const today = todayRevenue[0] || { total: 0, count: 0 };
    const week = weekRevenue[0] || { total: 0, count: 0 };

    res.json({
      success: true,
      data: {
        total: {
          revenue: Math.round(stats.total * 100) / 100,
          fees: Math.round(stats.fees * 100) / 100,
          net: Math.round(stats.net * 100) / 100,
          transactions: stats.count
        },
        today: {
          revenue: Math.round(today.total * 100) / 100,
          transactions: today.count
        },
        thisWeek: {
          revenue: Math.round(week.total * 100) / 100,
          transactions: week.count
        },
        byCategory: revenueByCategory
      }
    });

  } catch (error) {
    console.error('Revenue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue statistics',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/user-stats
// @desc    Get user statistics for dashboard
// @access  Private (Admin only)
router.get('/user-stats', async (req, res) => {
  try {
    const dates = getDateRanges();

    // User counts by type
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      }
    ]);

    // New users this month
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: dates.thisMonth }
    });

    // Most active users (by booking count)
    const activeCustomers = await User.aggregate([
      {
        $match: { userType: 'customer' }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'customerId',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          bookingCount: { $size: '$bookings' }
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          email: 1,
          bookingCount: 1,
          createdAt: 1
        }
      }
    ]);

    // User registration over time (last 30 days)
    const registrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(dates.now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        userStats,
        newUsersThisMonth,
        activeCustomers,
        registrationTrend
      }
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

module.exports = router;
