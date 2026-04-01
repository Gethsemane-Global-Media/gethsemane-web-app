import React from 'react';

interface CheckmarkIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
  backgroundColor?: string;
  checkmarkColor?: string;
}

export const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({ 
  size = 64, 
  className = '',
  'aria-label': ariaLabel = 'Success checkmark',
  backgroundColor = '#49684F',
  checkmarkColor = 'white'
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label={ariaLabel}
  >
    <circle cx="32" cy="32" r="32" fill={backgroundColor}/>
    <path 
      d="M22 32.5L29.3333 40L43 26" 
      stroke={checkmarkColor} 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);