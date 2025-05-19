const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Google authentication
router.post('/google', authController.googleAuth);

// Get current user
router.get('/me', protect, authController.getMe);

module.exports = router;