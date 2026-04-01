import React from 'react';

interface CheckmarkFabIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const CheckmarkFabIcon: React.FC<CheckmarkFabIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Checkmark'
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
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
