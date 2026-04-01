import React from 'react';

interface BookOpenIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const BookOpenIcon: React.FC<BookOpenIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Open book'
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
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);
