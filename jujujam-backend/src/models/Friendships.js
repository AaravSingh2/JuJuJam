// jujujam-backend/src/models/Friendship.js
const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create a compound index to ensure uniqueness and for efficient queries
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Add methods to easily check friendship status
friendshipSchema.methods.isAccepted = function() {
  return this.status === 'accepted';
};

friendshipSchema.methods.isPending = function() {
  return this.status === 'pending';
};

friendshipSchema.methods.isRejected = function() {
  return this.status === 'rejected';
};

friendshipSchema.methods.isBlocked = function() {
  return this.status === 'blocked';
};

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;