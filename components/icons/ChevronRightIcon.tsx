import React from 'react';

interface ChevronRightIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Next'
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
      d="m9 18 6-6-6-6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
