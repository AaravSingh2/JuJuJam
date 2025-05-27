// jujujam-frontend/src/context/FriendsContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { friendshipService } from '../services/api';
import { useAuth } from './AuthContext';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [discoveredUsers, setDiscoveredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get both currentUser AND isBackendAuthenticated from AuthContext
  const { currentUser, isBackendAuthenticated } = useAuth();

  // Load user's friends and requests when BOTH user exists AND backend is authenticated
// Add this to your FriendsContext.jsx useEffect
useEffect(() => {
  if (currentUser && isBackendAuthenticated) {
    console.log("User authenticated with backend, loading friends data...");
    loadFriendsData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log("Auto-refreshing friends data...");
      loadFriendsData();
    }, 12000); // 12 seconds

    return () => clearInterval(interval);
  }
}, [currentUser, isBackendAuthenticated]);
  const loadFriendsData = async () => {
    try {
      setLoading(true);
      console.log("Loading friends data with backend token...");
      const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
        friendshipService.getFriends(),
        friendshipService.getIncomingRequests(),
        friendshipService.getOutgoingRequests()
      ]);

      setFriends(friendsRes.data.friends || []);
      setIncomingRequests(incomingRes.data.requests || []);
      setOutgoingRequests(outgoingRes.data.requests || []);
      console.log("Friends data loaded successfully!");
    } catch (err) {
      setError('Failed to load friends data');
      console.error('Error loading friends data:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (recipientId) => {
    try {
      setLoading(true);
      console.log("FriendsContext: Sending request to recipientId:", recipientId);
      console.log("FriendsContext: Current user:", currentUser);
      
      const response = await friendshipService.sendFriendRequest(recipientId);
      console.log("FriendsContext: Response received:", response.data);
      
      // Add to outgoing requests
      setOutgoingRequests(prev => [...prev, response.data.friendship]);
      
      // Update discovered users to show request sent
      setDiscoveredUsers(prev => 
        prev.map(user => 
          user._id === recipientId 
            ? { ...user, relationshipStatus: 'requested' }
            : user
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('FriendsContext error:', err);
      console.error('FriendsContext error response:', err.response?.data);
      setError('Failed to send friend request');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Update the rejectFriendRequest function in FriendsContext.jsx
const rejectFriendRequest = async (friendshipId) => {
  try {
    setLoading(true);
    await friendshipService.rejectFriendRequest(friendshipId);
    
    // Remove from incoming requests immediately
    setIncomingRequests(prev => 
      prev.filter(req => req._id !== friendshipId)
    );
    
    // Refresh discovered users to update relationship statuses
    await discoverUsers();
    
    console.log("Friend request rejected and data refreshed");
  } catch (err) {
    setError('Failed to reject friend request');
    throw err;
  } finally {
    setLoading(false);
  }
};

// Also update acceptFriendRequest similarly
const acceptFriendRequest = async (friendshipId) => {
  try {
    setLoading(true);
    const response = await friendshipService.acceptFriendRequest(friendshipId);
    
    // Remove from incoming requests
    setIncomingRequests(prev => 
      prev.filter(req => req._id !== friendshipId)
    );
    
    // Add to friends list
    const newFriend = response.data.friendship.requester;
    setFriends(prev => [...prev, newFriend]);
    
    // Refresh discovered users to update relationship statuses
    await discoverUsers();
    
    console.log("Friend request accepted and data refreshed");
    return response.data;
  } catch (err) {
    setError('Failed to accept friend request');
    throw err;
  } finally {
    setLoading(false);
  }
};


  const removeFriend = async (friendId) => {
    try {
      setLoading(true);
      await friendshipService.removeFriend(friendId);
      
      // Remove from friends list
      setFriends(prev => prev.filter(friend => friend._id !== friendId));
    } catch (err) {
      setError('Failed to remove friend');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const discoverUsers = async (searchParams = {}) => {
    try {
      setLoading(true);
      const response = await friendshipService.discoverUsers(searchParams);
      setDiscoveredUsers(response.data.users || []);
      return response.data;
    } catch (err) {
      setError('Failed to discover users');
      console.error('Discover users error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    friends,
    incomingRequests,
    outgoingRequests,
    discoveredUsers,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    discoverUsers,
    loadFriendsData,
    clearError
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};