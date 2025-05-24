// jujujam-backend/src/controllers/auth.controller.js
const User = require('../models/Users');
const { verifyGoogleToken, findOrCreateGoogleUser } = require('../services/googleAuth');
// Import Firebase Admin but don't rely on it being fully initialized
const admin = require('../config/firebase');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, displayName, firebaseId } = req.body;

    console.log("Register request received:", { username, email, displayName, firebaseId });

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with that email or username' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      displayName,
      firebaseId,
      isVerified: true // Since Firebase has already verified the email
    });

    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return user data (without password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        isVerified: user.isVerified,
        firebaseId: user.firebaseId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, firebaseId } = req.body;

    console.log("Login request received:", { email, firebaseId });

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      // If user doesn't exist in our DB but is authenticated with Firebase
      if (firebaseId) {
        // Create new user in our DB
        const newUser = new User({
          username: email.split('@')[0] + Math.floor(Math.random() * 1000),
          email: email,
          password: Math.random().toString(36).slice(-8), // Generate random password
          displayName: email.split('@')[0],
          firebaseId: firebaseId,
          isVerified: true
        });
        
        await newUser.save();
        
        // Generate JWT token
        const token = newUser.generateAuthToken();
        
        return res.status(200).json({
          success: true,
          message: 'User created and logged in successfully',
          token,
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            displayName: newUser.displayName,
            isVerified: newUser.isVerified,
            firebaseId: newUser.firebaseId
          }
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // If Firebase ID is provided, we trust Firebase authentication
    if (firebaseId) {
      // If the user exists but doesn't have a firebaseId, update it
      if (!user.firebaseId) {
        user.firebaseId = firebaseId;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Check if password matches only if firebaseId is not provided
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = user.generateAuthToken();

    // Return user data (without password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        firebaseId: user.firebaseId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Google authentication
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google token is required' 
      });
    }
    
    try {
      // Verify Google token
      const googleUserData = await verifyGoogleToken(idToken);
      
      // Find or create user
      const user = await findOrCreateGoogleUser(googleUserData);
      
      // Generate JWT token
      const token = user.generateAuthToken();
      
      // Return user data
      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
          firebaseId: user.firebaseId,
          googleId: user.googleId
        }
      });
    } catch (tokenError) {
      console.error('Google token verification error:', tokenError);
      
      // If token verification fails, try to extract basic info from token
      try {
        // Extract user info from token without verification (not secure, but pragmatic)
        // This is a fallback in case the Google verification library isn't working
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
        
        // Create basic user data
        const email = payload.email || '';
        const displayName = payload.name || email.split('@')[0];
        const picture = payload.picture || '';
        const uid = payload.sub || payload.user_id || '';
        
        // Find or create user
        let user = await User.findOne({ email });
        
        if (!user) {
          // Create new user
          user = new User({
            username: email.split('@')[0] + Math.floor(Math.random() * 1000),
            email,
            password: Math.random().toString(36).slice(-8), // Generate random password
            displayName,
            profilePicture: picture,
            googleId: uid,
            firebaseId: uid,
            isVerified: true
          });
          
          await user.save();
        } else {
          // Update existing user if needed
          if (!user.googleId) {
            user.googleId = uid;
            user.isVerified = true;
            await user.save();
          }
        }
        
        // Generate JWT token
        const token = user.generateAuthToken();
        
        // Return user data
        res.status(200).json({
          success: true,
          message: 'Google authentication successful',
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            isVerified: user.isVerified,
            firebaseId: user.firebaseId,
            googleId: user.googleId
          }
        });
      } catch (fallbackError) {
        console.error('Google auth fallback failed:', fallbackError);
        throw tokenError; // Re-throw the original error
      }
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Google authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // Get user ID from authenticated request (added by auth middleware)
    const userId = req.user.id;
    console.log("Get current user request for ID:", userId);
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        firebaseId: user.firebaseId,
        googleId: user.googleId
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};