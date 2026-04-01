import React from 'react';

interface ArrowRightIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Go forward'
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
      d="M14.43 5.92999L20.5 12L14.43 18.07" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M3.5 12H20.33" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);