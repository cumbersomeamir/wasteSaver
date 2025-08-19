const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rescueBagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RescueBag',
    required: [true, 'Rescue bag ID is required']
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'picked-up', 'cancelled', 'expired'],
    default: 'pending'
  },
  payment: {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    method: {
      type: String,
      enum: ['credit_card', 'digital_wallet', 'stripe', 'razorpay'],
      required: [true, 'Payment method is required']
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  pickupDetails: {
    scheduledTime: {
      type: Date,
      required: [true, 'Scheduled pickup time is required']
    },
    pickupWindow: {
      start: Date,
      end: Date
    },
    pickupConfirmedAt: Date,
    pickupMethod: {
      type: String,
      enum: ['in-store', 'curbside', 'delivery'],
      default: 'in-store'
    },
    specialInstructions: String
  },
  environmentalImpact: {
    co2Saved: {
      type: Number,
      default: 0,
      min: [0, 'CO2 saved cannot be negative']
    },
    waterSaved: {
      type: [Number],
      default: 0,
      min: [0, 'Water saved cannot be negative']
    },
    moneySaved: {
      type: Number,
      default: 0,
      min: [0, 'Money saved cannot be negative']
    }
  },
  cancellation: {
    reason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['user', 'business', 'system'],
      default: 'user'
    }
  },
  notifications: {
    pickupReminder: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    pickupReady: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    pickupExpiring: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  }
}, {
  timestamps: true
});

// Index for user queries
reservationSchema.index({ userId: 1, status: 1 });

// Index for business queries
reservationSchema.index({ businessId: 1, status: 1 });

// Index for pickup time queries
reservationSchema.index({ 'pickupDetails.scheduledTime': 1 });

// Index for status and pickup time
reservationSchema.index({ status: 1, 'pickupDetails.scheduledTime': 1 });

// Method to confirm pickup
reservationSchema.methods.confirmPickup = function() {
  this.status = 'picked-up';
  this.pickupDetails.pickupConfirmedAt = new Date();
  return this.save();
};

// Method to cancel reservation
reservationSchema.methods.cancel = function(reason, cancelledBy = 'user') {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    cancelledAt: new Date(),
    cancelledBy
  };
  return this.save();
};

// Method to mark as ready
reservationSchema.methods.markAsReady = function() {
  this.status = 'ready';
  return this.save();
};

// Method to check if pickup is overdue
reservationSchema.methods.isPickupOverdue = function() {
  const now = new Date();
  return this.status === 'ready' && now > this.pickupDetails.pickupWindow.end;
};

// Method to calculate time until pickup
reservationSchema.methods.getTimeUntilPickup = function() {
  const now = new Date();
  if (this.status === 'confirmed' || this.status === 'ready') {
    return this.pickupDetails.scheduledTime - now;
  }
  return null;
};

// Method to update environmental impact
reservationSchema.methods.updateEnvironmentalImpact = function(co2Saved, waterSaved, moneySaved) {
  this.environmentalImpact.co2Saved = co2Saved;
  this.environmentalImpact.waterSaved = waterSaved;
  this.environmentalImpact.moneySaved = moneySaved;
  return this.save();
};

// Pre-save middleware to set pickup window if not provided
reservationSchema.pre('save', function(next) {
  if (!this.pickupDetails.pickupWindow.start && this.pickupDetails.scheduledTime) {
    // Set pickup window to 2 hours around scheduled time
    const scheduledTime = new Date(this.pickupDetails.scheduledTime);
    this.pickupDetails.pickupWindow = {
      start: new Date(scheduledTime.getTime() - 60 * 60 * 1000), // 1 hour before
      end: new Date(scheduledTime.getTime() + 60 * 60 * 1000)   // 1 hour after
    };
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
