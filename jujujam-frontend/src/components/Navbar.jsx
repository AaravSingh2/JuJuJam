import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>JujuJam</Link>
        
        <div className={styles.navLinks}>
          {currentUser ? (
            <>
              <span className={styles.welcomeText}>Hi, {currentUser.displayName}</span>
              <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
              <button 
                onClick={logout}
                className={styles.logoutButton}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>Login</Link>
              <Link 
                to="/register" 
                className={styles.registerButton}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;