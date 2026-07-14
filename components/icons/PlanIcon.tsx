import React from 'react';

interface PlanIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const PlanIcon: React.FC<PlanIconProps> = ({ 
  size = 24, 
  className = '',
  'aria-label': ariaLabel = 'Plan'
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
      fillRule="evenodd" 
      clipRule="evenodd" 
      fill="currentColor"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm1.13-15.52-4.5 5.62h2.95l-.71 5.42 4.5-5.62h-2.95l.71-5.42Z" 
    />
  </svg>
);
