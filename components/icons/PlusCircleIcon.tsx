import React from 'react';

interface PlusCircleIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const PlusCircleIcon: React.FC<PlusCircleIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Add'
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
    strokeWidth="2"
  >
    <path 
      d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M8 12h8m-4 4V8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);