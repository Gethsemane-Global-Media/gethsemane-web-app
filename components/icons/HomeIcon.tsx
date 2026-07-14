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
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 11.2 9-7.7 9 7.7"/>
    <path d="M5.3 9.3V20h13.4V9.3"/>
  </svg>
);
