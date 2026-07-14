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
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4.5h6a4 4 0 0 1 4 4V20a3 3 0 0 0-3-3H2V4.5Z"/>
    <path d="M22 4.5h-6a4 4 0 0 0-4 4V20a3 3 0 0 1 3-3h7V4.5Z"/>
  </svg>
);
