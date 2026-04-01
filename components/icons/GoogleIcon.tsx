import React from 'react';

interface GoogleIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Sign in with Google'
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
    <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.02C17.73 16.03 16.89 17.39 15.6 18.25V21.1H19.53C21.52 19.22 22.56 16.05 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C15.24 23 17.95 21.92 19.53 20.1L15.6 18.25C14.49 19.01 13.38 19.45 12 19.45C9.12 19.45 6.67 17.58 5.76 15.02H1.79V17.9C3.71 21.01 7.54 23 12 23Z" fill="#34A853"/>
    <path d="M5.76 15.02C5.55 14.43 5.43 13.8 5.43 13.15C5.43 12.5 5.55 11.87 5.76 11.28V8.39H1.79C0.92 10.02 0.43 11.8 0.43 13.15C0.43 14.5 0.92 16.28 1.79 17.9L5.76 15.02Z" fill="#FBBC05"/>
    <path d="M12 5.55C13.56 5.55 14.94 6.1 16.03 7.1L19.61 3.52C17.95 1.95 15.24 1 12 1C7.54 1 3.71 2.99 1.79 6.1L5.76 8.98C6.67 6.42 9.12 5.55 12 5.55Z" fill="#EA4335"/>
  </svg>
);