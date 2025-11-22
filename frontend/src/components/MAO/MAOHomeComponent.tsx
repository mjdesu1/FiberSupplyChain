import React from 'react';

interface MAOHomeComponentProps {
  title: string;
}

const MAOHomeComponent: React.FC<MAOHomeComponentProps> = ({ title }) => {
  return (
    <div className="p-4 bg-emerald-100 rounded-lg">
      <h2 className="text-xl font-bold text-emerald-800">{title}</h2>
      <p className="text-emerald-600">This is a component for MAO functionality.</p>
    </div>
  );
};

export default MAOHomeComponent;