import React from 'react';

interface ShareIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

export const ShareIcon: React.FC<ShareIconProps> = ({
  size = 18,
  className = '',
  'aria-label': ariaLabel = 'Share',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label={ariaLabel}
  >
    <g fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="2" />
      <circle cx="17" cy="6" r="2" />
      <circle cx="17" cy="18" r="2" />
    </g>
    <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M7 12 L15 7.5" />
      <path d="M7 12 L15 16.5" />
    </g>
  </svg>
);