import React from 'react';
import BuyerDashboard from './BuyerDashboard';

interface BuyersComponentProps {
  onLogout: () => void;
}

const BuyersComponent: React.FC<BuyersComponentProps> = ({ onLogout }) => {
  return <BuyerDashboard onLogout={onLogout} />;
};

export default BuyersComponent;