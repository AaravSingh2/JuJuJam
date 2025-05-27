// jujujam-frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request Interceptor:');
    console.log('- URL:', config.baseURL + config.url);
    console.log('- Token exists:', !!token);
    console.log('- Token value:', token ? token.substring(0, 20) + '...' : 'No token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication services
const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleAuth: (tokenData) => api.post('/auth/google', tokenData),
  getCurrentUser: () => api.get('/auth/me'),
  isAuthenticated: () => {
    return localStorage.getItem('token') ? true : false;
  },
};

// Friendship services
const friendshipService = {
  // Send friend request
  sendFriendRequest: (recipientId) => api.post('/friends/request', { recipientId }),
  
  // Accept friend request
  acceptFriendRequest: (friendshipId) => api.put(`/friends/accept/${friendshipId}`),
  
  // Reject friend request
  rejectFriendRequest: (friendshipId) => api.put(`/friends/reject/${friendshipId}`),
  
  // Get friends list
  getFriends: () => api.get('/friends'),
  
  // Get incoming friend requests
  getIncomingRequests: () => api.get('/friends/requests/incoming'),
  
  // Get outgoing friend requests
  getOutgoingRequests: () => api.get('/friends/requests/outgoing'),
  
  // Remove friend
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
  
  // Discover users
  discoverUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/friends/discover?${queryString}`);
  }
};

// Export both services
export { authService, friendshipService };
export default api;