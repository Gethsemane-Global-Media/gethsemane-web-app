import React from 'react';

interface SettingsIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const SettingsIcon: React.FC<SettingsIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Settings'
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
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.58-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.44h-3.84a.5.5 0 0 0-.5.44l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.5.5 0 0 0-.58.22L2.72 8.87a.5.5 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32a.5.5 0 0 0 .58.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54a.5.5 0 0 0 .5.44h3.84a.5.5 0 0 0 .5-.44l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96a.5.5 0 0 0 .58-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.01-1.58z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);
