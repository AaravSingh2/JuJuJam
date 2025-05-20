// src/pages/DashboardPage/DashboardPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Extract username from photoURL if it exists (for Firebase implementation)
  const username = currentUser?.photoURL?.startsWith('username:') 
    ? currentUser.photoURL.replace('username:', '') 
    : 'User';
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Mock data for demonstration purposes
  const upcomingEvents = [
    { id: 1, title: 'Movie Night', date: 'May 25, 2025', time: '7:00 PM', location: 'Central Cinema' },
    { id: 2, title: 'Beach Picnic', date: 'June 2, 2025', time: '1:00 PM', location: 'Golden Beach' }
  ];
  
  const invitations = [
    { id: 3, title: 'Birthday Party', host: 'Alex', date: 'May 30, 2025', time: '8:00 PM', location: 'The Venue' }
  ];
  
  const friends = [
    { id: 1, name: 'Alex', initial: 'A' },
    { id: 2, name: 'Taylor', initial: 'T' },
    { id: 3, name: 'Jordan', initial: 'J' },
    { id: 4, name: 'Casey', initial: 'C' }
  ];
  
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.welcomeText}>Welcome, {currentUser?.displayName || username}!</h1>
          <p className={styles.userInfo}>Email: {currentUser?.email}</p>
        </div>
        
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
      
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>2</div>
          <div className={styles.statLabel}>Upcoming Events</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statValue}>1</div>
          <div className={styles.statLabel}>Pending Invitations</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statValue}>4</div>
          <div className={styles.statLabel}>Friends</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statValue}>5</div>
          <div className={styles.statLabel}>Past Events</div>
        </div>
      </div>
      
      <div className={styles.dashboardContent}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Events</h2>
            <button className={styles.actionButton}>Create Event</button>
          </div>
          
          <div className={styles.tabGroup}>
            <div 
              className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'invitations' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('invitations')}
            >
              Invitations
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'past' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </div>
          </div>
          
          {activeTab === 'upcoming' && (
            <div className={styles.eventList}>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id} className={styles.eventItem}>
                    <div className={styles.eventInfo}>
                      <div className={styles.eventTitle}>{event.title}</div>
                      <div className={styles.eventDate}>{event.date} • {event.time} • {event.location}</div>
                    </div>
                    <div className={styles.eventActions}>
                      <button className={styles.secondaryButton}>Details</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>No upcoming events</p>
                  <button className={styles.actionButton}>Create your first event</button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'invitations' && (
            <div className={styles.eventList}>
              {invitations.length > 0 ? (
                invitations.map(invitation => (
                  <div key={invitation.id} className={styles.eventItem}>
                    <div className={styles.eventInfo}>
                      <div className={styles.eventTitle}>{invitation.title} • By {invitation.host}</div>
                      <div className={styles.eventDate}>{invitation.date} • {invitation.time} • {invitation.location}</div>
                    </div>
                    <div className={styles.eventActions}>
                      <button className={styles.secondaryButton}>Decline</button>
                      <button className={styles.actionButton}>Accept</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>No pending invitations</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'past' && (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>No past events yet</p>
            </div>
          )}
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Friends</h2>
            <button className={styles.secondaryButton}>Add Friend</button>
          </div>
          
          <div className={styles.friendsList}>
            {friends.map(friend => (
              <div key={friend.id} className={styles.friendItem}>
                <div className={styles.friendAvatar}>
                  <span className={styles.friendInitial}>{friend.initial}</span>
                </div>
                <div className={styles.friendName}>{friend.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;