const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId; // Password required only for local auth
    },
    minlength: 8,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  googleId: String,
  githubId: String,
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: String,
  oauthProvider: { type: String },
  oauthId: { type: String },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  mfaCode: String,
  mfaExpires: Date,
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

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
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.mfaSecret;
  delete userObject.verificationToken;
  delete userObject.resetPasswordCode;
  delete userObject.resetPasswordExpires;
  delete userObject.mfaCode;
  delete userObject.mfaExpires;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 