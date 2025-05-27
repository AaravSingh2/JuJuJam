// jujujam-backend/src/routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const friendshipRoutes = require('./friendship.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/friends', friendshipRoutes);

module.exports = router;