import React from 'react';

interface NotificationIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Notifications'
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label={ariaLabel}
  >
    <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/>
  </svg>
);