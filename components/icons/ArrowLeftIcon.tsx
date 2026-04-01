import React from 'react';

interface ArrowLeftIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const ArrowLeftIcon: React.FC<ArrowLeftIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Go back'
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
      d="M15 18L9 12L15 6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);