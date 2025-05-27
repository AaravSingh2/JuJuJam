// jujujam-frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FriendsProvider } from './context/FriendsContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DiscoverPage from './pages/DiscoverPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FriendsProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/discover" 
                  element={
                    <ProtectedRoute>
                      <DiscoverPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <footer className="bg-gray-800 text-white py-4 text-center">
              <p>&copy; {new Date().getFullYear()} JujuJam. All rights reserved.</p>
            </footer>
          </div>
        </FriendsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;