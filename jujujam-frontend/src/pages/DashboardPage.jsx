import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {currentUser.displayName}!</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Your Dashboard</h2>
        <p className="text-gray-600 mb-4">
          This is where you'll see your upcoming events, friend requests, and more.
        </p>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Your Profile Info:</h3>
          <p><strong>Username:</strong> {currentUser.username}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-primary">Upcoming Events</h2>
          <p className="text-gray-500 italic">No events yet. Create one to get started!</p>
          <button className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors mt-4">
            Create Event
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-primary">Friends</h2>
          <p className="text-gray-500 italic">No friends added yet. Start connecting!</p>
          <button className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors mt-4">
            Find Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;