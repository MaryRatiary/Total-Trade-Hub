import React from 'react';
import Bouncy from './Bouncy';

const Spinner = ({ size = 'medium', className = '' }) => {
  const sizeMap = {
    small: '25',
    medium: '45',
    large: '65'
  };

  return (
    <div className={className}>
      <Bouncy size={sizeMap[size]} />
    </div>
  );
};

export default Spinner;