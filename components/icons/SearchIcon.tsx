import React from 'react';

interface SearchIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Search'
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
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
