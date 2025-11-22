import React from 'react';
import { useNavigate } from 'react-router-dom';
import CUSAFADashboard from './CUSAFADashboard';

const AssociationComponent: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/'); // Association officers go back to homepage
  };
  return <CUSAFADashboard onLogout={handleLogout} />;
};

export default AssociationComponent;
