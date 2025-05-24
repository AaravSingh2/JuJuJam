// src/services/googleAuth.js
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/Users');

// Create OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google ID token
const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    return {
      email: payload.email,
      displayName: payload.name,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      googleId: payload.sub,
      firebaseId: payload.firebase ? payload.firebase.sign_in_provider : null
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

// Find or create user with Google data
const findOrCreateGoogleUser = async (userData) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: userData.googleId });
    
    if (user) {
      return user;
    }
    
    // Check if user exists with this email
    user = await User.findOne({ email: userData.email });
    
    if (user) {
      // Update Google ID if not already set
      if (!user.googleId) {
        user.googleId = userData.googleId;
        if (userData.firebaseId) {
          user.firebaseId = userData.firebaseId;
        }
        if (!user.profilePicture || user.profilePicture === 'default-avatar.png') {
          user.profilePicture = userData.picture;
        }
        await user.save();
      }
      return user;
    }
    
    // Create new user
    const username = userData.email.split('@')[0] + Math.floor(Math.random() * 1000);
    
    user = new User({
      email: userData.email,
      username,
      displayName: userData.displayName,
      profilePicture: userData.picture,
      googleId: userData.googleId,
      firebaseId: userData.firebaseId,
      isVerified: true, // Google accounts are pre-verified
      password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) // Random password
    });
    
    await user.save();
    return user;
  } catch (error) {
    console.error('Error finding or creating Google user:', error);
    throw error;
  }
};

module.exports = {
  verifyGoogleToken,
  findOrCreateGoogleUser
};