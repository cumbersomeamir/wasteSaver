const express = require('express');
const { query, param, validationResult } = require('express-validator');
const RescueBag = require('../models/RescueBag');
const Business = require('../models/Business');
const { optionalAuth } = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/rescue-bags
// @desc    Get rescue bags with filters and geospatial search
// @access  Public (with optional auth for personalized results)
router.get('/', [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isFloat({ min: 0.1, max: 50 }).withMessage('Radius must be between 0.1 and 50 km'),
  query('category').optional().isIn(['bakery', 'meals', 'groceries', 'produce', 'dairy', 'mixed', 'other']).withMessage('Invalid category'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('dietary').optional().isArray().withMessage('Dietary preferences must be an array'),
  query('allergen').optional().isArray().withMessage('Allergen filters must be an array'),
  query('sortBy').optional().isIn(['distance', 'price', 'rating', 'pickupTime']).withMessage('Invalid sort option'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], optionalAuth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      lat,
      lng,
      radius = 10, // Default 10km radius
      category,
      maxPrice,
      minPrice,
      dietary = [],
      allergen = [],
      sortBy = 'distance',
      page = 1,
      limit = 20
    } = req.query;

    // Build geospatial query
    const geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    };

    // Build business query
    let businessQuery = { isActive: true };
    if (category) {
      businessQuery.category = category;
    }

    // Get businesses within radius
    const businesses = await Business.find(businessQuery, '_id name category rating location');
    
    if (businesses.length === 0) {
      return res.json({
        rescueBags: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    const businessIds = businesses.map(b => b._id);

    // Build rescue bag query
    let rescueBagQuery = {
      businessId: { $in: businessIds },
      status: 'active'
    };

    if (maxPrice) {
      rescueBagQuery.price = { ...rescueBagQuery.price, $lte: parseFloat(maxPrice) };
    }
    if (minPrice) {
      rescueBagQuery.price = { ...rescueBagQuery.price, $gte: parseFloat(minPrice) };
    }
    if (dietary.length > 0) {
      rescueBagQuery.dietaryTags = { $in: dietary };
    }
    if (allergen.length > 0) {
      rescueBagQuery.allergens = { $nin: allergen };
    }

    // Get rescue bags
    let rescueBags = await RescueBag.find(rescueBagQuery)
      .populate('businessId', 'name category rating location')
      .sort({ createdAt: -1 });

    // Calculate distances and filter by availability
    const now = new Date();
    rescueBags = rescueBags
      .filter(bag => bag.isAvailable() && bag.pickupWindow.end > now)
      .map(bag => {
        const business = businesses.find(b => b._id.equals(bag.businessId._id));
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          business.location.coordinates[1],
          business.location.coordinates[0]
        );
        
        return {
          ...bag.toObject(),
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          timeUntilPickup: bag.getTimeUntilPickup(),
          discountPercentage: bag.getDiscountPercentage()
        };
      });

    // Sort results
    switch (sortBy) {
      case 'distance':
        rescueBags.sort((a, b) => a.distance - b.distance);
        break;
      case 'price':
        rescueBags.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        rescueBags.sort((a, b) => b.businessId.rating.average - a.businessId.rating.average);
        break;
      case 'pickupTime':
        rescueBags.sort((a, b) => a.pickupWindow.start - b.pickupWindow.start);
        break;
    }

    // Pagination
    const total = rescueBags.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBags = rescueBags.slice(startIndex, endIndex);

    // Add user-specific data if authenticated
    if (req.user) {
      for (let bag of paginatedBags) {
        bag.isFavorite = req.user.favorites.includes(bag.businessId._id);
      }
    }

    res.json({
      rescueBags: paginatedBags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Get rescue bags error:', error);
    res.status(500).json({ error: 'Server error while fetching rescue bags' });
  }
});

// @route   GET /api/rescue-bags/:id
// @desc    Get specific rescue bag details
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid rescue bag ID')
], optionalAuth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const rescueBag = await RescueBag.findById(req.params.id)
      .populate('businessId', 'name category rating location address operatingHours contact images')
      .populate('businessId', 'rescueBagSettings');

    if (!rescueBag) {
      return res.status(404).json({ error: 'Rescue bag not found' });
    }

    if (rescueBag.status !== 'active') {
      return res.status(400).json({ error: 'Rescue bag is not available' });
    }

    // Add calculated fields
    const bagData = {
      ...rescueBag.toObject(),
      isAvailable: rescueBag.isAvailable(),
      timeUntilPickup: rescueBag.getTimeUntilPickup(),
      discountPercentage: rescueBag.getDiscountPercentage(),
      pickupWindowActive: rescueBag.isPickupWindowActive()
    };

    // Add user-specific data if authenticated
    if (req.user) {
      bagData.isFavorite = req.user.favorites.includes(rescueBag.businessId._id);
    }

    res.json({ rescueBag: bagData });
  } catch (error) {
    console.error('Get rescue bag error:', error);
    res.status(500).json({ error: 'Server error while fetching rescue bag' });
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

module.exports = router;
