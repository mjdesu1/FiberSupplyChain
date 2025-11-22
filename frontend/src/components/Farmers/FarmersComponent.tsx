import React from 'react';
import FarmerDashboard from './FarmerDashboard';

interface FarmersComponentProps {
  onLogout: () => void;
}

const FarmersComponent: React.FC<FarmersComponentProps> = ({ onLogout }) => {
  return <FarmerDashboard onLogout={onLogout} />;
};

export default FarmersComponent;