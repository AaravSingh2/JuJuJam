// jujujam-backend/src/config/firebase.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

// Try to load the service account file
try {
  const serviceAccountPath = path.join(__dirname, 'credentials', 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
    console.log('Firebase service account loaded from file');
  } else {
    // Fallback to environment variables
    console.log('Service account file not found, using environment variables');
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
  }
} catch (error) {
  console.error('Error loading Firebase service account:', error);
  // Fallback to environment variables
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
}

// Check if we have adequate Firebase configuration
const hasMinimumConfig = serviceAccount && 
  (serviceAccount.type === 'service_account' || 
   (serviceAccount.projectId && serviceAccount.clientEmail));

// Initialize Firebase Admin SDK if we have adequate configuration
if (hasMinimumConfig) {
  try {
    // If we have a full service account with private key
    if (serviceAccount.type === 'service_account' && serviceAccount.private_key) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      console.log('Firebase Admin SDK initialized with full credentials');
    } else {
      // Skip initialization but still export the module
      console.warn('Insufficient Firebase credentials - SDK not fully initialized');
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
} else {
  console.warn('Firebase configuration missing or incomplete');
}

module.exports = admin;