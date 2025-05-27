// jujujam-backend/src/routes/friendship.routes.js
const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendship.controller');
const { protect } = require('../middleware/auth.middleware');

// Debug logging
router.use((req, res, next) => {
  console.log('Friendship route accessed:', req.method, req.path);
  console.log('Headers:', req.headers.authorization ? 'Auth header present' : 'No auth header');
  next();
});

// All friendship routes require authentication
router.use(protect);

// Send friend request
router.post('/request', friendshipController.sendFriendRequest);

// Accept friend request
router.put('/accept/:friendshipId', friendshipController.acceptFriendRequest);

// Reject friend request
router.put('/reject/:friendshipId', friendshipController.rejectFriendRequest);

// Get friends list
router.get('/', friendshipController.getFriends);

// Get incoming friend requests
router.get('/requests/incoming', friendshipController.getIncomingRequests);

// Get outgoing friend requests
router.get('/requests/outgoing', friendshipController.getOutgoingRequests);

// Remove friend
router.delete('/:friendId', friendshipController.removeFriend);

// Discover users
router.get('/discover', friendshipController.discoverUsers);

module.exports = router;