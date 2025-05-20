// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCBwacr49XR1Dav8JohpZEh1dTSW4pV8Q",
  authDomain: "jujujam-f3e84.firebaseapp.com",
  projectId: "jujujam-f3e84",
  storageBucket: "jujujam-f3e84.firebasestorage.app",
  messagingSenderId: "1066462945030",
  appId: "1:1066462945030:web:1b88c729683c9d10f28887",
  measurementId: "G-GFWYGZXM79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { app, auth, analytics };