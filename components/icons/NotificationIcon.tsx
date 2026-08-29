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
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label={ariaLabel}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);