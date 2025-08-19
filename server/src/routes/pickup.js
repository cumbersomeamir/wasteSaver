const express = require('express');
const { param, body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/pickup/confirm
// @desc    Confirm pickup of a reservation
// @access  Private
router.post('/confirm', [
  body('reservationId').isMongoId().withMessage('Valid reservation ID required'),
  body('pickupMethod').optional().isIn(['in-store', 'curbside', 'delivery']).withMessage('Valid pickup method required')
], auth, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reservationId, pickupMethod } = req.body;

    // Find and validate reservation
    const reservation = await Reservation.findById(reservationId)
      .populate('businessId', 'name location address')
      .populate('rescueBagId', 'title price originalValue environmentalImpact');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (!reservation.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (reservation.status !== 'ready') {
      return res.status(400).json({ error: 'Reservation is not ready for pickup' });
    }

    // Check if pickup window is still active
    const now = new Date();
    if (now > reservation.pickupDetails.pickupWindow.end) {
      return res.status(400).json({ error: 'Pickup window has expired' });
    }

    // Update pickup method if provided
    if (pickupMethod) {
      reservation.pickupDetails.pickupMethod = pickupMethod;
    }

    // Confirm pickup
    await reservation.confirmPickup();

    // Update user's environmental impact stats
    const user = await User.findById(req.user._id);
    user.totalSaved += reservation.environmentalImpact.moneySaved;
    user.totalCO2eSaved += reservation.environmentalImpact.co2Saved;
    user.totalWaterSaved += reservation.environmentalImpact.waterSaved;
    await user.save();

    res.json({
      message: 'Pickup confirmed successfully',
      reservation,
      updatedStats: {
        totalSaved: user.totalSaved,
        totalCO2eSaved: user.totalCO2eSaved,
        totalWaterSaved: user.totalWaterSaved
      }
    });
  } catch (error) {
    console.error('Confirm pickup error:', error);
    res.status(500).json({ error: 'Server error while confirming pickup' });
  }
});

// @route   GET /api/pickup/active
// @desc    Get user's active pickups
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const activeReservations = await Reservation.find({
      userId: req.user._id,
      status: { $in: ['confirmed', 'ready'] }
    })
      .populate('businessId', 'name location address')
      .populate('rescueBagId', 'title price images')
      .sort({ 'pickupDetails.scheduledTime': 1 });

    // Add pickup status and time information
    const activePickups = activeReservations.map(reservation => {
      const now = new Date();
      const pickupWindow = reservation.pickupDetails.pickupWindow;
      const isPickupWindowActive = now >= pickupWindow.start && now <= pickupWindow.end;
      const timeUntilPickup = reservation.getTimeUntilPickup();
      const isOverdue = reservation.isPickupOverdue();

      return {
        ...reservation.toObject(),
        isPickupWindowActive,
        timeUntilPickup,
        isOverdue,
        pickupStatus: getPickupStatus(reservation, now)
      };
    });

    res.json({ activePickups });
  } catch (error) {
    console.error('Get active pickups error:', error);
    res.status(500).json({ error: 'Server error while fetching active pickups' });
  }
});

// @route   GET /api/pickup/:id/instructions
// @desc    Get pickup instructions for a specific reservation
// @access  Private
router.get('/:id/instructions', [
  param('id').isMongoId().withMessage('Invalid reservation ID')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservation = await Reservation.findById(req.params.id)
      .populate('businessId', 'name location address operatingHours contact')
      .populate('rescueBagId', 'title description allergens dietaryTags');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (!reservation.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate pickup instructions
    const instructions = generatePickupInstructions(reservation);

    res.json({ instructions });
  } catch (error) {
    console.error('Get pickup instructions error:', error);
    res.status(500).json({ error: 'Server error while fetching pickup instructions' });
  }
});

// Helper function to get pickup status
function getPickupStatus(reservation, now) {
  const { scheduledTime, pickupWindow } = reservation.pickupDetails;
  
  if (now < pickupWindow.start) {
    return 'upcoming';
  } else if (now >= pickupWindow.start && now <= pickupWindow.end) {
    return 'active';
  } else {
    return 'expired';
  }
}

// Helper function to generate pickup instructions
function generatePickupInstructions(reservation) {
  const business = reservation.businessId;
  const rescueBag = reservation.rescueBagId;
  
  const instructions = {
    business: {
      name: business.name,
      address: business.address,
      phone: business.contact?.phone,
      email: business.contact?.email
    },
    pickup: {
      time: reservation.pickupDetails.scheduledTime,
      window: reservation.pickupDetails.pickupWindow,
      method: reservation.pickupDetails.pickupMethod,
      specialInstructions: reservation.pickupDetails.specialInstructions
    },
    rescueBag: {
      title: rescueBag.title,
      description: rescueBag.description,
      allergens: rescueBag.allergens,
      dietaryTags: rescueBag.dietaryTags
    },
    steps: [
      'Arrive at the business during your pickup window',
      'Show your reservation confirmation to staff',
      'Confirm pickup in the app',
      'Collect your rescue bag',
      'Enjoy your food and help reduce waste!'
    ]
  };

  // Add business-specific instructions
  if (reservation.pickupDetails.pickupMethod === 'curbside') {
    instructions.steps.unshift('Call the business when you arrive');
    instructions.steps.splice(2, 0, 'Wait for staff to bring your order outside');
  }

  if (reservation.pickupDetails.pickupMethod === 'delivery') {
    instructions.steps = [
      'Ensure someone is available at the delivery address',
      'Provide any special delivery instructions',
      'Confirm delivery in the app when received'
    ];
  }

  return instructions;
}

module.exports = router;
