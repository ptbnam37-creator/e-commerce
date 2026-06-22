import React from 'react';

export interface StarIconProps {
  fillPercent: number;
  size?: string;
}

export const StarIcon = ({ fillPercent, size = '28px' }: StarIconProps) => {
  const gradientId = React.useId().replace(/:/g, '');
  return (
    <svg className="star-icon" viewBox="0 0 24 24" style={{ width: size, height: size }}>
      <defs>
        <linearGradient id={gradientId}>
          <stop offset={`${fillPercent * 100}%`} stopColor="#ffd214" />
          <stop offset={`${fillPercent * 100}%`} stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={`url(#${gradientId})`} />
    </svg>
  );
};
