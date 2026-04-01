import React from 'react';

interface BookmarkIconProps {
  isFilled?: boolean;
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const BookmarkIcon: React.FC<BookmarkIconProps> = ({ 
  isFilled = false, 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = isFilled ? 'Remove bookmark' : 'Add bookmark'
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={isFilled ? "currentColor" : "none"} 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label={ariaLabel}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);
