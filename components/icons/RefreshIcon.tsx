import React from 'react';

interface RefreshIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const RefreshIcon: React.FC<RefreshIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Refresh'
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
    <path 
      d="M21.823 6.092C20.218 3.558 17.22 2 13.66 2c-4.463 0-8.223 2.918-9.452 7" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M2.177 17.908C3.782 20.442 6.78 22 10.34 22c4.463 0 8.223-2.918 9.452-7" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M4.177 9H2.177V7" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M19.823 15h2v2" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
