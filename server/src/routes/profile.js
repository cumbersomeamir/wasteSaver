const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/profile/impact
// @desc    Get user's environmental impact statistics
// @access  Private
router.get('/impact', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get recent reservations for detailed stats
    const recentReservations = await Reservation.find({
      userId: req.user._id,
      status: 'picked-up'
    })
      .populate('rescueBagId', 'title environmentalImpact')
      .sort({ 'pickupDetails.pickupConfirmedAt': -1 })
      .limit(10);

    // Calculate additional statistics
    const totalOrders = await Reservation.countDocuments({
      userId: req.user._id,
      status: 'picked-up'
    });

    const totalSpent = await Reservation.aggregate([
      { $match: { userId: user._id, status: 'picked-up' } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);

    const averageOrderValue = totalOrders > 0 ? (totalSpent[0]?.total || 0) / totalOrders : 0;

    // Environmental impact calculations
    const impactStats = {
      totalSaved: user.totalSaved,
      totalCO2eSaved: user.totalCO2eSaved,
      totalWaterSaved: user.totalWaterSaved,
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      environmentalEquivalents: {
        treesPlanted: Math.round(user.totalCO2eSaved / 0.022), // 22kg CO2 per tree per year
        carMilesSaved: Math.round(user.totalCO2eSaved * 2.3), // 2.3 miles per kg CO2
        showerMinutesSaved: Math.round(user.totalWaterSaved / 2.5), // 2.5 gallons per minute
        phoneChargesSaved: Math.round(user.totalCO2eSaved * 0.5) // 0.5 kg CO2 per phone charge
      }
    };

    res.json({ impactStats, recentReservations });
  } catch (error) {
    console.error('Get impact stats error:', error);
    res.status(500).json({ error: 'Server error while fetching impact statistics' });
  }
});

// @route   GET /api/profile/history
// @desc    Get user's order history with pagination
// @access  Private
router.get('/history', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'ready', 'picked-up', 'cancelled', 'expired']).withMessage('Invalid status')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20, status } = req.query;

    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('businessId', 'name category location address')
      .populate('rescueBagId', 'title price originalValue images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      history: reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Server error while fetching order history' });
  }
});

// @route   PUT /api/profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  body('dietaryPreferences').optional().isArray().withMessage('Dietary preferences must be an array'),
  body('notifications').optional().isObject().withMessage('Notifications must be an object'),
  body('privacy').optional().isObject().withMessage('Privacy must be an object')
], auth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dietaryPreferences, notifications, privacy } = req.body;

    const updateData = {};
    
    if (dietaryPreferences) {
      updateData.dietaryPreferences = dietaryPreferences;
    }

    if (notifications) {
      // Validate notification preferences
      const validNotificationKeys = [
        'favoritesAlerts',
        'pickupReminders',
        'newRescueBags',
        'promotionalOffers'
      ];
      
      for (const key of validNotificationKeys) {
        if (notifications[key] !== undefined) {
          updateData[`notifications.${key}`] = notifications[key];
        }
      }
    }

    if (privacy) {
      // Validate privacy preferences
      const validPrivacyKeys = [
        'profileVisibility',
        'orderHistoryVisibility',
        'locationSharing'
      ];
      
      for (const key of validPrivacyKeys) {
        if (privacy[key] !== undefined) {
          updateData[`privacy.${key}`] = privacy[key];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error while updating preferences' });
  }
});

// @route   GET /api/profile/achievements
// @desc    Get user's achievements and milestones
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Define achievement thresholds
    const achievements = {
      firstOrder: { name: 'First Rescue', description: 'Complete your first rescue bag order', unlocked: false },
      fiveOrders: { name: 'Rescue Regular', description: 'Complete 5 rescue bag orders', unlocked: false },
      tenOrders: { name: 'Waste Warrior', description: 'Complete 10 rescue bag orders', unlocked: false },
      twentyFiveOrders: { name: 'Sustainability Champion', description: 'Complete 25 rescue bag orders', unlocked: false },
      fiftyOrders: { name: 'Eco Legend', description: 'Complete 50 rescue bag orders', unlocked: false },
      moneySaved: { name: 'Money Saver', description: 'Save $100 on rescue bags', unlocked: false },
      co2Saved: { name: 'Climate Hero', description: 'Save 100kg of CO2 emissions', unlocked: false },
      waterSaved: { name: 'Water Guardian', description: 'Save 1000 gallons of water', unlocked: false },
      weeklyStreak: { name: 'Weekly Warrior', description: 'Order rescue bags for 4 consecutive weeks', unlocked: false },
      monthlyStreak: { name: 'Monthly Master', description: 'Order rescue bags for 3 consecutive months', unlocked: false }
    };

    // Check achievements based on user stats
    const totalOrders = await Reservation.countDocuments({
      userId: req.user._id,
      status: 'picked-up'
    });

    if (totalOrders >= 1) achievements.firstOrder.unlocked = true;
    if (totalOrders >= 5) achievements.fiveOrders.unlocked = true;
    if (totalOrders >= 10) achievements.tenOrders.unlocked = true;
    if (totalOrders >= 25) achievements.twentyFiveOrders.unlocked = true;
    if (totalOrders >= 50) achievements.fiftyOrders.unlocked = true;

    if (user.totalSaved >= 100) achievements.moneySaved.unlocked = true;
    if (user.totalCO2eSaved >= 100) achievements.co2Saved.unlocked = true;
    if (user.totalWaterSaved >= 1000) achievements.waterSaved.unlocked = true;

    // Check streaks (simplified - would need more complex logic in production)
    const recentOrders = await Reservation.find({
      userId: req.user._id,
      status: 'picked-up'
    })
      .sort({ 'pickupDetails.pickupConfirmedAt': -1 })
      .limit(50);

    // Calculate weekly and monthly streaks
    const weeklyStreak = calculateWeeklyStreak(recentOrders);
    const monthlyStreak = calculateMonthlyStreak(recentOrders);

    if (weeklyStreak >= 4) achievements.weeklyStreak.unlocked = true;
    if (monthlyStreak >= 3) achievements.monthlyStreak.unlocked = true;

    const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
    const totalCount = Object.keys(achievements).length;

    res.json({
      achievements,
      stats: {
        unlocked: unlockedCount,
        total: totalCount,
        percentage: Math.round((unlockedCount / totalCount) * 100)
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Server error while fetching achievements' });
  }
});

// Helper function to calculate weekly streak
function calculateWeeklyStreak(orders) {
  if (orders.length === 0) return 0;
  
  let streak = 0;
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Simplified logic - in production would need more sophisticated date handling
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].pickupDetails.pickupConfirmedAt > oneWeekAgo) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// Helper function to calculate monthly streak
function calculateMonthlyStreak(orders) {
  if (orders.length === 0) return 0;
  
  let streak = 0;
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Simplified logic - in production would need more sophisticated date handling
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].pickupDetails.pickupConfirmedAt > oneMonthAgo) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

module.exports = router;
