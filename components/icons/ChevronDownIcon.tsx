import React from 'react';

interface ChevronDownIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Expand'
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
      d="m6 9 6 6 6-6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
