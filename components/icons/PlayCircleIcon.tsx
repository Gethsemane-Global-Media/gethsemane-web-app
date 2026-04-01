import React from 'react';

interface PlayCircleIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const PlayCircleIcon: React.FC<PlayCircleIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Play'
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
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path d="M10 15.5V8.5L16 12L10 15.5Z" fill="currentColor" />
  </svg>
);