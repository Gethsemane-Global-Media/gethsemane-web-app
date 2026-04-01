import React from 'react';

interface PlayIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const PlayIcon: React.FC<PlayIconProps> = ({ 
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
    <path d="M8 5v14l11-7L8 5z" fill="currentColor"/>
  </svg>
);
