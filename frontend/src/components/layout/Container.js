import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Container - Centered width wrapper with responsive padding.
 */
const Container = ({ children, className = '', size = 'xl' }) => {
  const sizeMap = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeMap[size] || sizeMap.xl, className)}>
      {children}
    </div>
  );
};

export default Container;
