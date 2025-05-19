import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to JujuJam
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The easiest way to plan events with friends. Create polls, send invites, and get everyone on the same page.
        </p>
        
        {!currentUser && (
          <div className="mt-8 flex justify-center space-x-4">
            <Link to="/register" className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors">
              Get Started
            </Link>
            <Link to="/login" className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
              Login
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-primary">Plan Together</h2>
          <p className="text-gray-600">
            Create events, send invites, and let friends RSVP. No more back-and-forth messages trying to coordinate.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-primary">Stay Updated</h2>
          <p className="text-gray-600">
            Get notifications when plans are made or changed. Never miss an important update again.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-primary">Easy Opt-out</h2>
          <p className="text-gray-600">
            Changed your mind? No problem. Just opt-out before the deadline and everyone stays informed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;