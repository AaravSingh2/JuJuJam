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
import { authService } from '../services/api';

// Create the context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendAuthenticated, setIsBackendAuthenticated] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsBackendAuthenticated(false);
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
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      
      await updateProfile(result.user, {
        displayName: displayName
      });

      console.log("Sending registration to backend...");
      const backendResponse = await authService.register({
        email,
        username,
        displayName,
        password,
        firebaseId: result.user.uid
      });
      console.log("Backend registration response:", backendResponse.data);

      if (backendResponse && backendResponse.data && backendResponse.data.token) {
        localStorage.setItem('token', backendResponse.data.token);
        console.log("Backend JWT token stored");
        setIsBackendAuthenticated(true);
      }

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
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      
      console.log("Sending login to backend...");
      const backendResponse = await authService.login({
        email,
        password,
        firebaseId: result.user.uid
      });
      console.log("Backend login response:", backendResponse.data);

      if (backendResponse && backendResponse.data && backendResponse.data.token) {
        localStorage.setItem('token', backendResponse.data.token);
        console.log("Backend JWT token stored, replacing Firebase token");
        setIsBackendAuthenticated(true);
      }

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
      
      const idToken = await result.user.getIdToken();
      
      console.log("Sending Google login to backend...");
      const backendResponse = await authService.googleAuth({ idToken });
      console.log("Backend Google response:", backendResponse.data);
      
      if (backendResponse && backendResponse.data && backendResponse.data.token) {
        localStorage.setItem('token', backendResponse.data.token);
        console.log("Backend JWT token stored");
        setIsBackendAuthenticated(true);
      }
      
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
      setIsBackendAuthenticated(false);
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
    isBackendAuthenticated,
    register,
    login,
    googleLogin,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};