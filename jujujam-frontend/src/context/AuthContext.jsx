// jujujam-frontend/src/context/AuthContext.jsx
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
import { auth as firebaseAuth } from '../firebase';
import { authService } from '../services/api'; // Import authService explicitly

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        try {
          // Get token
          const token = await user.getIdToken();
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          try {
            // Try to get user data from our backend
            const response = await authService.getCurrentUser(); // Use authService
            if (response && response.data && response.data.success) {
              // If successful, merge Firebase user with our backend user data
              setCurrentUser({
                ...user,
                ...response.data.user
              });
            } else {
              setCurrentUser(user);
            }
          } catch (err) {
            // If backend request fails, still set the Firebase user
            setCurrentUser(user);
            console.error('Error fetching user from backend:', err);
          }
        } catch (err) {
          console.error('Error getting ID token:', err);
          setCurrentUser(user);
        }
      } else {
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register with email and password
  const register = async ({ email, password, displayName, username }) => {
    setLoading(true);
    setError(null);
    try {
      // First create user in Firebase
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: displayName
      });

      // Get Firebase ID token
      const token = await result.user.getIdToken();
      
      // Send user data to our backend
      try {
        const backendResponse = await authService.register({ // Use authService
          email,
          username,
          displayName,
          password, // This will be re-hashed on the backend
          firebaseId: result.user.uid
        });

        // Store the JWT token from our backend
        if (backendResponse && backendResponse.data && backendResponse.data.token) {
          localStorage.setItem('token', backendResponse.data.token);
        }
      } catch (backendErr) {
        console.error("Backend registration error:", backendErr);
        // Continue even if backend registration fails
      }

      // Force refresh to ensure we have the latest user data
      await result.user.reload();
      setCurrentUser(firebaseAuth.currentUser);
      
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
      // First authenticate with Firebase
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      
      // Get Firebase ID token
      const token = await result.user.getIdToken();
      
      // Send token to our backend for validation and to get our JWT
      try {
        console.log("Sending to backend:", { email, password, firebaseId: result.user.uid });
        const backendResponse = await authService.login({ // Use authService
          email,
          password,
          firebaseId: result.user.uid
        });
        console.log("Backend response:", backendResponse);

        // Store the JWT token from our backend
        if (backendResponse && backendResponse.data && backendResponse.data.token) {
          localStorage.setItem('token', backendResponse.data.token);
        }
      } catch (backendErr) {
        console.error("Backend login error:", backendErr);
        // Continue even if backend login fails
      }

      // Update current user
      setCurrentUser(result.user);
      
      return result.user;
    } catch (err) {
      console.error("Login error:", err);
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
      const result = await signInWithPopup(firebaseAuth, provider);
      
      // Get ID token from Firebase
      const idToken = await result.user.getIdToken();
      
      // Send to backend
      try {
        const backendResponse = await authService.googleAuth({ idToken }); // Use authService
        
        // Store the JWT token from our backend
        if (backendResponse && backendResponse.data && backendResponse.data.token) {
          localStorage.setItem('token', backendResponse.data.token);
        }
      } catch (backendErr) {
        console.error("Backend Google login error:", backendErr);
        // Continue even if backend Google login fails
      }
      
      // Update current user
      setCurrentUser(result.user);
      
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
      await signOut(firebaseAuth);
      localStorage.removeItem('token');
      setCurrentUser(null);
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