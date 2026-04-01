import React from 'react';

interface HomeIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const HomeIcon: React.FC<HomeIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Home'
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label={ariaLabel}
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5Z" fill="currentColor"/>
  </svg>
);
