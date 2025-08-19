const mongoose = require('mongoose');

const rescueBagSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['bakery', 'meals', 'groceries', 'produce', 'dairy', 'mixed', 'other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalValue: {
    type: Number,
    min: [0, 'Original value cannot be negative']
  },
  pickupWindow: {
    start: {
      type: Date,
      required: [true, 'Pickup start time is required']
    },
    end: {
      type: Date,
      required: [true, 'Pickup end time is required']
    }
  },
  allergens: [{
    type: String,
    enum: ['dairy', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soy', 'none']
  }],
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'organic', 'local', 'seasonal']
  }],
  quantity: {
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'sold-out', 'expired'],
    default: 'active'
  },
  environmentalImpact: {
    co2Saved: {
      type: Number,
      default: 0,
      min: [0, 'CO2 saved cannot be negative']
    },
    waterSaved: {
      type: Number,
      default: 0,
      min: [0, 'Water saved cannot be negative']
    }
  },
  isRescueParcel: {
    type: Boolean,
    default: false
  },
  deliveryOptions: {
    available: {
      type: Boolean,
      default: false
    },
    radius: {
      type: Number,
      default: 0,
      min: [0, 'Delivery radius cannot be negative']
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative']
    }
  }
}, {
  timestamps: true
});

// Index for business and status queries
rescueBagSchema.index({ businessId: 1, status: 1 });

// Index for category and price queries
rescueBagSchema.index({ category: 1, price: 1 });

// Index for pickup window queries
rescueBagSchema.index({ 'pickupWindow.start': 1, 'pickupWindow.end': 1 });

// Method to check if bag is available
rescueBagSchema.methods.isAvailable = function() {
  return this.status === 'active' && this.quantity.available > this.quantity.reserved;
};

// Method to reserve a bag
rescueBagSchema.methods.reserve = function(quantity = 1) {
  if (this.quantity.available - this.quantity.reserved >= quantity) {
    this.quantity.reserved += quantity;
    if (this.quantity.reserved >= this.quantity.available) {
      this.status = 'sold-out';
    }
    return this.save();
  }
  throw new Error('Insufficient quantity available');
};

// Method to release a reservation
rescueBagSchema.methods.releaseReservation = function(quantity = 1) {
  this.quantity.reserved = Math.max(0, this.quantity.reserved - quantity);
  if (this.status === 'sold-out' && this.quantity.reserved < this.quantity.available) {
    this.status = 'active';
  }
  return this.save();
};

// Method to calculate discount percentage
rescueBagSchema.methods.getDiscountPercentage = function() {
  if (!this.originalValue || this.originalValue <= this.price) {
    return 0;
  }
  return Math.round(((this.originalValue - this.price) / this.originalValue) * 100);
};

// Method to check if pickup window is active
rescueBagSchema.methods.isPickupWindowActive = function() {
  const now = new Date();
  return now >= this.pickupWindow.start && now <= this.pickupWindow.end;
};

// Method to get time until pickup
rescueBagSchema.methods.getTimeUntilPickup = function() {
  const now = new Date();
  if (now < this.pickupWindow.start) {
    return this.pickupWindow.start - now;
  }
  if (now > this.pickupWindow.end) {
    return null; // Pickup window has passed
  }
  return 0; // Pickup window is currently active
};

module.exports = mongoose.model('RescueBag', rescueBagSchema);
