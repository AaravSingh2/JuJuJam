// src/components/LoginForm/LoginForm.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error is already handled in the AuthContext
      console.error('Login error:', err);
    }
  };

  const handleGoogleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.bgContainer}>
        <div className={styles.bgImage}></div>
        <div className={styles.formWrapper}>
          <div className={styles.formContent}>
            <h1 className={styles.title}>Let's Gather</h1>
            <p className={styles.subtitle}>Manage your social gatherings and plans with friends</p>
            
            {(error || authError) && (
              <div className={styles.errorMessage}>
                {error || authError}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                />
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
                  required
                />
              </div>
              
              <div className={styles.forgotPasswordLink}>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
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
                Don't have an account?{' '}
                <Link to="/register" className={styles.signupLink}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;