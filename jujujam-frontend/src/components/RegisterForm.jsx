// src/components/RegisterForm/RegisterForm.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState({});
  
  const { register, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) { // Firebase requires minimum 6 characters
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Registration error:', error);
    }
  };

  const handleGoogleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.bgContainer}>
        <div className={styles.bgImage}></div>
        <div className={styles.formWrapper}>
          <div className={styles.formContent}>
            <h1 className={styles.title}>Join Let's Gather</h1>
            <p className={styles.subtitle}>Create your account to start planning events</p>
            
            {authError && (
              <div className={styles.errorMessage}>
                {authError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  className={styles.input}
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
                {errors.displayName && <p className={styles.errorText}>{errors.displayName}</p>}
              </div>
              
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={styles.input}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
                {errors.username && <p className={styles.errorText}>{errors.username}</p>}
              </div>
              
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>
              
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={styles.input}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
                {errors.password && <p className={styles.errorText}>{errors.password}</p>}
              </div>
              
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={styles.input}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
              </div>
              
              <div className={styles.termsContainer}>
                <p className={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className={styles.termsLink}>Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className={styles.termsLink}>Privacy Policy</Link>
                </p>
              </div>
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>Or</span>
              <div className={styles.dividerLine}></div>
            </div>
            
            <GoogleLoginButton onSuccess={handleGoogleSuccess} />
            
            <div className={styles.linkContainer}>
              <p className={styles.linkText}>
                Already have an account?{' '}
                <Link to="/login" className={styles.loginLink}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;