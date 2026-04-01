import React from 'react';

interface PauseIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const PauseIcon: React.FC<PauseIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Pause'
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
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
  </svg>
);
