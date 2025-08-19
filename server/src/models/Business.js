const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Business category is required'],
    enum: ['bakery', 'restaurant', 'cafe', 'grocery', 'convenience', 'wholesale', 'other']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'US'
      }
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  rescueBagSettings: {
    maxBagsPerDay: {
      type: Number,
      default: 50,
      min: [1, 'Max bags per day must be at least 1']
    },
    pickupWindow: {
      type: Number,
      default: 2, // hours
      min: [0.5, 'Pickup window must be at least 0.5 hours']
    },
    advanceNoticeHours: {
      type: Number,
      default: 2,
      min: [0, 'Advance notice cannot be negative']
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
businessSchema.index({ location: '2dsphere' });

// Index for category and rating queries
businessSchema.index({ category: 1, 'rating.average': -1 });

// Method to update rating
businessSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Method to check if business is open
businessSchema.methods.isOpen = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.operatingHours[dayOfWeek];
  if (!todayHours || !todayHours.open || !todayHours.close) {
    return false;
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Method to get formatted address
businessSchema.methods.getFormattedAddress = function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
};

module.exports = mongoose.model('Business', businessSchema);
