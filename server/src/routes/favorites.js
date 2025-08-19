const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Business = require('../models/Business');
const RescueBag = require('../models/RescueBag');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/favorites
// @desc    Get user's favorite businesses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites',
        select: 'name category rating location address images',
        match: { isActive: true }
      });

    const favorites = user.favorites.filter(business => business !== null);

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Server error while fetching favorites' });
  }
});

// @route   POST /api/favorites
// @desc    Add a business to favorites
// @access  Private
router.post('/', [
  body('businessId').isMongoId().withMessage('Valid business ID required')
], auth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessId } = req.body;

    // Check if business exists and is active
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (!business.isActive) {
      return res.status(400).json({ error: 'Business is not active' });
    }

    // Check if already in favorites
    const user = await User.findById(req.user._id);
    if (user.favorites.includes(businessId)) {
      return res.status(400).json({ error: 'Business already in favorites' });
    }

    // Add to favorites
    await user.addToFavorites(businessId);

    res.json({
      message: 'Business added to favorites successfully',
      business: {
        _id: business._id,
        name: business.name,
        category: business.category,
        rating: business.rating,
        location: business.location,
        address: business.address,
        images: business.images
      }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'Server error while adding to favorites' });
  }
});

// @route   DELETE /api/favorites/:businessId
// @desc    Remove a business from favorites
// @access  Private
router.delete('/:businessId', [
  param('businessId').isMongoId().withMessage('Valid business ID required')
], auth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessId } = req.params;

    // Remove from favorites
    await req.user.removeFromFavorites(businessId);

    res.json({
      message: 'Business removed from favorites successfully'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'Server error while removing from favorites' });
  }
});

// @route   GET /api/favorites/alerts
// @desc    Get new rescue bags from favorite businesses
// @access  Private
router.get('/alerts', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Radius must be between 0.1 and 50 km')
], auth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lng, radius = 10 } = req.query;

    // Get user's favorite businesses
    const user = await User.findById(req.user._id);
    if (user.favorites.length === 0) {
      return res.json({ alerts: [] });
    }

    // Get rescue bags from favorite businesses
    const rescueBags = await RescueBag.find({
      businessId: { $in: user.favorites },
      status: 'active'
    })
      .populate('businessId', 'name category rating location')
      .sort({ createdAt: -1 });

    // Filter by availability and calculate distances
    const now = new Date();
    const alerts = rescueBags
      .filter(bag => bag.isAvailable() && bag.pickupWindow.end > now)
      .map(bag => {
        const business = bag.businessId;
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          business.location.coordinates[1],
          business.location.coordinates[0]
        );

        return {
          ...bag.toObject(),
          distance: Math.round(distance * 100) / 100,
          timeUntilPickup: bag.getTimeUntilPickup(),
          discountPercentage: bag.getDiscountPercentage(),
          isNew: isNewRescueBag(bag.createdAt)
        };
      })
      .filter(bag => bag.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json({ alerts });
  } catch (error) {
    console.error('Get favorites alerts error:', error);
    res.status(500).json({ error: 'Server error while fetching favorites alerts' });
  }
});

// @route   POST /api/favorites/notifications
// @desc    Update push notification preferences for favorites
// @access  Private
router.post('/notifications', [
  body('enabled').isBoolean().withMessage('Enabled must be a boolean'),
  body('businessId').optional().isMongoId().withMessage('Valid business ID required')
], auth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { enabled, businessId } = req.body;

    // Update user's notification preferences
    const updateData = {};
    
    if (businessId) {
      // Update for specific business
      if (enabled) {
        updateData.$addToSet = { favoriteNotifications: businessId };
      } else {
        updateData.$pull = { favoriteNotifications: businessId };
      }
    } else {
      // Update global preference
      updateData.favoritesNotificationsEnabled = enabled;
    }

    await User.findByIdAndUpdate(req.user._id, updateData);

    res.json({
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Server error while updating notification preferences' });
  }
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to check if rescue bag is new (created within last 24 hours)
function isNewRescueBag(createdAt) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return createdAt > oneDayAgo;
}

module.exports = router;
