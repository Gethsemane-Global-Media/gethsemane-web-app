import React from 'react';

interface MailSentIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const MailSentIcon: React.FC<MailSentIconProps> = ({ 
  size = 80, 
  className = '',
  'aria-label': ariaLabel = 'Email sent'
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
      d="M22 13.91v-3.82c0-3.32-1.99-5.09-4.89-5.09h-1.05c-1.2 0-2.33.64-2.95 1.66-.45.74-.71 1.61-.71 2.51v.17c0 .89.26 1.76.71 2.5.62 1.02 1.75 1.66 2.95 1.66h1.05c2.9 0 4.89-1.77 4.89-5.09z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M12.3 9.75h3.19M2 13.37V15.5c0 3.5 2 5 5 5h10c3 0 5-1.5 5-5v-1.13M12.91 4.5H7C4 4.5 2 6 2 9.5v3.87" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M7 9l3.35 2.68c.63.5 1.67.5 2.3 0L17 9" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
