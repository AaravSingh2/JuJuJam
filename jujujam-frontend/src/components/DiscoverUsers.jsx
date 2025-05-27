// jujujam-frontend/src/components/DiscoverUsers.jsx
import { useState, useEffect } from 'react';
import { useFriends } from '../context/FriendsContext';
import styles from './DiscoverUsers.module.css';

const DiscoverUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const { 
    discoveredUsers, 
    loading, 
    error, 
    discoverUsers, 
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    incomingRequests,
    outgoingRequests, // Add this
    loadFriendsData, // Add this
    clearError 
  } = useFriends();

  // Load initial users when component mounts
  useEffect(() => {
    discoverUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchTerm.trim()) {
        discoverUsers({ search: searchTerm });
      } else {
        discoverUsers(); // Load all users if search is empty
      }
    }, 500); // 500ms delay

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSendRequest = async (userId) => {
    try {
      console.log("Sending friend request to userId:", userId);
      await sendFriendRequest(userId);
      console.log("Friend request sent successfully");
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };
  const handleReloadData = async () => {
  console.log("Manual reload triggered");
  await loadFriendsData();
  await discoverUsers();
};
  const handleRespond = async (userId, action) => {
    try {
      console.log("Handling respond:", userId, action);
      console.log("Incoming requests:", incomingRequests);
      
      // Find the friendship request where this user is the requester and current user is recipient
      const friendshipRequest = incomingRequests.find(req => {
        console.log("Checking request:", req);
        return req.requester._id === userId || req.requester.id === userId;
      });
      
      if (!friendshipRequest) {
        console.error('Friendship request not found for userId:', userId);
        console.error('Available requests:', incomingRequests);
        return;
      }

      console.log("Found friendship request:", friendshipRequest);

      if (action === 'accept') {
        console.log("Accepting friend request from:", userId);
        await acceptFriendRequest(friendshipRequest._id);
        console.log("Friend request accepted");
      } else if (action === 'reject') {
        console.log("Rejecting friend request from:", userId);
        await rejectFriendRequest(friendshipRequest._id);
        console.log("Friend request rejected");
      }
    } catch (err) {
      console.error('Error responding to friend request:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  const getButtonText = (relationshipStatus) => {
    switch (relationshipStatus) {
      case 'friends':
        return 'Friends';
      case 'requested':
        return 'Request Sent';
      case 'pending':
        return 'Respond';
      default:
        return 'Add Friend';
    }
  };

  const getButtonClass = (relationshipStatus) => {
    switch (relationshipStatus) {
      case 'friends':
        return styles.friendsButton;
      case 'requested':
        return styles.requestedButton;
      case 'pending':
        return styles.pendingButton;
      default:
        return styles.addButton;
    }
  };

  const isButtonDisabled = (relationshipStatus) => {
    return ['friends', 'requested'].includes(relationshipStatus);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Discover People</h2>
        <p className={styles.subtitle}>Find and connect with other users</p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      {/* Debug/Reload Button - Add this after the search container */}
<div style={{ marginBottom: '1rem', textAlign: 'center' }}>
  <button 
    onClick={handleReloadData}
    style={{ 
      padding: '0.5rem 1rem', 
      backgroundColor: '#4f46e5', 
      color: 'white', 
      border: 'none', 
      borderRadius: '0.5rem',
      marginRight: '1rem'
    }}
  >
    Reload Friends Data
  </button>
  <span style={{ fontSize: '0.875rem', color: '#666' }}>
    Incoming: {incomingRequests.length} | Outgoing: {outgoingRequests.length}
  </span>
</div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={clearError} className={styles.closeError}>×</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Finding users...</p>
        </div>
      )}

      {/* Users List */}
      <div className={styles.usersList}>
        {discoveredUsers.length > 0 ? (
          discoveredUsers.map((user) => (
            <div key={user._id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user.profilePicture && user.profilePicture !== 'default-avatar.png' ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.displayName}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                <div className={styles.userDetails}>
                  <h3 className={styles.displayName}>{user.displayName}</h3>
                  <p className={styles.username}>@{user.username}</p>
                  {user.bio && <p className={styles.bio}>{user.bio}</p>}
                </div>
              </div>
              
              <div className={styles.actions}>
                {user.relationshipStatus === 'pending' ? (
                  <div className={styles.respondActions}>
                    <button
                      onClick={() => handleRespond(user._id, 'reject')}
                      className={`${styles.actionButton} ${styles.rejectButton}`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleRespond(user._id, 'accept')}
                      className={`${styles.actionButton} ${styles.acceptButton}`}
                    >
                      Accept
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user._id)}
                    disabled={isButtonDisabled(user.relationshipStatus)}
                    className={`${styles.actionButton} ${getButtonClass(user.relationshipStatus)}`}
                  >
                    {getButtonText(user.relationshipStatus)}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div className={styles.emptyState}>
              <p>No users found</p>
              {searchTerm && (
                <p className={styles.emptySubtext}>
                  Try adjusting your search terms
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DiscoverUsers;