import React from 'react';

interface CloseIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const CloseIcon: React.FC<CloseIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Close'
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
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);