const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }],
  totalSaved: {
    type: Number,
    default: 0,
    min: [0, 'Total saved cannot be negative']
  },
  totalCO2eSaved: {
    type: Number,
    default: 0,
    min: [0, 'CO2 saved cannot be negative']
  },
  totalWaterSaved: {
    type: Number,
    default: 0,
    min: [0, 'Water saved cannot be negative']
  },
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'none']
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  pushToken: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate total impact
userSchema.methods.calculateImpact = function() {
  return {
    totalSaved: this.totalSaved,
    totalCO2eSaved: this.totalCO2eSaved,
    totalWaterSaved: this.totalWaterSaved
  };
};

// Method to add to favorites
userSchema.methods.addToFavorites = function(businessId) {
  if (!this.favorites.includes(businessId)) {
    this.favorites.push(businessId);
  }
  return this.save();
};

// Method to remove from favorites
userSchema.methods.removeFromFavorites = function(businessId) {
  this.favorites = this.favorites.filter(id => !id.equals(businessId));
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
