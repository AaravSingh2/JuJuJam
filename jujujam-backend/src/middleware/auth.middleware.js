// jujujam-backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    console.log('Auth middleware called');
    console.log('Authorization header:', req.headers.authorization);
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? 'Token found' : 'No token');
    }
    
    // If no token found, return unauthorized error
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
    
    try {
      // Verify token
      console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'No secret');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      
      // Get user from token
      const user = await User.findById(decoded.id);
      console.log('User found:', user ? user.email : 'No user found');
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'The user belonging to this token no longer exists' 
        });
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.log('Token verification error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
  } catch (error) {
    console.log('Auth middleware error:', error);
    next(error);
  }
};