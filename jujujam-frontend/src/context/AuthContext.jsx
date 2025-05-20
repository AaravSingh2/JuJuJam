// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register with email and password
  const register = async ({ email, password, displayName, username }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: displayName,
        // Store username in photoURL temporarily (not ideal but works for now)
        // In a real app, you'd store this in your database
        photoURL: `username:${username}`
      });

      // Force refresh to ensure we have the latest user data
      await result.user.reload();
      setCurrentUser(auth.currentUser);
      
      return result.user;
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const googleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      throw err;
    }
  };

  // Helper function to get readable error messages
  const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in cancelled. Please try again.';
      default:
        return error.message;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    googleLogin,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);