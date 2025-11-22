import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCompletion from './ProfileCompletion';
import MAODashboard from './MAODashboard';

const MAOComponent: React.FC = () => {
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleProfileComplete = () => {
    setProfileCompleted(true);
    // Profile completion will be saved to database via API
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/mao');
  };

  // Check if profile is already completed from user data
  React.useEffect(() => {
    const checkProfileStatus = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Check profile_completed from database
          setProfileCompleted(user.profileCompleted === true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setProfileCompleted(false);
        }
      }
      setLoading(false);
    };

    checkProfileStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profileCompleted) {
    return <ProfileCompletion onComplete={handleProfileComplete} />;
  }

  return <MAODashboard onLogout={handleLogout} />;
};

export default MAOComponent;