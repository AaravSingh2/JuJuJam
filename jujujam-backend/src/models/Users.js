// src/models/Users.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password by default
  },
  displayName: {
    type: String,
    required: [true, 'Please provide a display name'],
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    default: '',
    maxlength: [200, 'Bio cannot exceed 200 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Firebase auth fields
  firebaseId: {
    type: String,
    sparse: true, // Allow null values but enforce uniqueness when present
    unique: true
  },
  googleId: {
    type: String,
    sparse: true
  },
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, username: this.username, firebaseId: this.firebaseId }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};
// Update jujujam-backend/src/models/Users.js

// Add these methods to the User schema before creating the model

// Find all friendships (regardless of status)
userSchema.methods.getAllFriendships = async function() {
  return await mongoose.model('Friendship').find({
    $or: [
      { requester: this._id },
      { recipient: this._id }
    ]
  }).populate('requester recipient', 'username displayName profilePicture');
};

// Find only accepted friendships
userSchema.methods.getFriends = async function() {
  const friendships = await mongoose.model('Friendship').find({
    $or: [
      { requester: this._id, status: 'accepted' },
      { recipient: this._id, status: 'accepted' }
    ]
  }).populate('requester recipient', 'username displayName profilePicture');
  
  // Return the other user in each friendship (not the current user)
  return friendships.map(friendship => {
    return friendship.requester._id.equals(this._id) 
      ? friendship.recipient 
      : friendship.requester;
  });
};

// Find pending friend requests sent by this user
userSchema.methods.getPendingRequests = async function() {
  return await mongoose.model('Friendship').find({
    requester: this._id,
    status: 'pending'
  }).populate('recipient', 'username displayName profilePicture');
};

// Find pending friend requests received by this user
userSchema.methods.getFriendRequests = async function() {
  return await mongoose.model('Friendship').find({
    recipient: this._id,
    status: 'pending'
  }).populate('requester', 'username displayName profilePicture');
};

// Check if users are friends
userSchema.methods.isFriendWith = async function(userId) {
  const friendship = await mongoose.model('Friendship').findOne({
    $or: [
      { requester: this._id, recipient: userId },
      { requester: userId, recipient: this._id }
    ],
    status: 'accepted'
  });
  
  return !!friendship;
};

const User = mongoose.model('User', userSchema);

module.exports = User;