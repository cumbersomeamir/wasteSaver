const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const RescueBag = require('../models/RescueBag');
const Business = require('../models/Business');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Private
router.post('/', [
  body('rescueBagId').isMongoId().withMessage('Valid rescue bag ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('pickupTime').isISO8601().withMessage('Valid pickup time required'),
  body('paymentMethod').isIn(['credit_card', 'digital_wallet', 'stripe', 'razorpay']).withMessage('Valid payment method required'),
  body('pickupMethod').optional().isIn(['in-store', 'curbside', 'delivery']).withMessage('Valid pickup method required'),
  body('specialInstructions').optional().isString().isLength({ max: 500 }).withMessage('Special instructions too long')
], auth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      rescueBagId,
      quantity,
      pickupTime,
      paymentMethod,
      pickupMethod = 'in-store',
      specialInstructions
    } = req.body;

    // Check if rescue bag exists and is available
    const rescueBag = await RescueBag.findById(rescueBagId)
      .populate('businessId', 'name location rescueBagSettings');

    if (!rescueBag) {
      return res.status(404).json({ error: 'Rescue bag not found' });
    }

    if (!rescueBag.isAvailable()) {
      return res.status(400).json({ error: 'Rescue bag is not available' });
    }

    if (rescueBag.quantity.available - rescueBag.quantity.reserved < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    // Check pickup time constraints
    const now = new Date();
    const pickupDateTime = new Date(pickupTime);
    const business = rescueBag.businessId;
    
    if (pickupDateTime <= now) {
      return res.status(400).json({ error: 'Pickup time must be in the future' });
    }

    const advanceNoticeHours = business.rescueBagSettings.advanceNoticeHours;
    const minPickupTime = new Date(now.getTime() + advanceNoticeHours * 60 * 60 * 1000);
    
    if (pickupDateTime < minPickupTime) {
      return res.status(400).json({ 
        error: `Pickup must be at least ${advanceNoticeHours} hours in advance` 
      });
    }

    // Check if pickup time is within business hours
    if (!business.isOpen()) {
      return res.status(400).json({ error: 'Business is not open at pickup time' });
    }

    // Calculate total amount
    const totalAmount = rescueBag.price * quantity;

    // Create reservation
    const reservation = new Reservation({
      userId: req.user._id,
      rescueBagId,
      businessId: business._id,
      quantity,
      payment: {
        amount: totalAmount,
        method: paymentMethod,
        status: 'pending'
      },
      pickupDetails: {
        scheduledTime: pickupDateTime,
        pickupMethod,
        specialInstructions
      },
      environmentalImpact: {
        co2Saved: rescueBag.environmentalImpact.co2Saved * quantity,
        waterSaved: rescueBag.environmentalImpact.waterSaved * quantity,
        moneySaved: rescueBag.originalValue ? (rescueBag.originalValue - rescueBag.price) * quantity : 0
      }
    });

    await reservation.save();

    // Reserve the rescue bag
    await rescueBag.reserve(quantity);

    // Populate business details for response
    await reservation.populate('businessId', 'name location address');
    await reservation.populate('rescueBagId', 'title price originalValue');

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Server error while creating reservation' });
  }
});

// @route   GET /api/reservations
// @desc    Get user's reservations
// @access  Private
router.get('/', [
  query('status').optional().isIn(['pending', 'confirmed', 'ready', 'picked-up', 'cancelled', 'expired']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

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
      reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Server error while fetching reservations' });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get specific reservation details
// @access  Private
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid reservation ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservation = await Reservation.findById(req.params.id)
      .populate('businessId', 'name category location address operatingHours contact')
      .populate('rescueBagId', 'title description price originalValue images allergens dietaryTags');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (!reservation.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ reservation });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ error: 'Server error while fetching reservation' });
  }
});

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancel a reservation
// @access  Private
router.put('/:id/cancel', [
  param('id').isMongoId().withMessage('Invalid reservation ID'),
  body('reason').optional().isString().isLength({ max: 200 }).withMessage('Reason too long')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (!reservation.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (['cancelled', 'picked-up', 'expired'].includes(reservation.status)) {
      return res.status(400).json({ error: 'Reservation cannot be cancelled' });
    }

    // Cancel reservation
    await reservation.cancel(reason || 'Cancelled by user');

    // Release the rescue bag reservation
    const rescueBag = await RescueBag.findById(reservation.rescueBagId);
    if (rescueBag) {
      await rescueBag.releaseReservation(reservation.quantity);
    }

    res.json({
      message: 'Reservation cancelled successfully',
      reservation
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ error: 'Server error while cancelling reservation' });
  }
});

module.exports = router;
