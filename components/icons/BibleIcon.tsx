import React from 'react';

interface BibleIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const BibleIcon: React.FC<BibleIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Bible'
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
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5V4A2 2 0 0 1 6.5 2z"/>
  </svg>
);
