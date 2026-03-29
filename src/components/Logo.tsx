import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="#00F0FF" floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Stylized P-Arrow Shape */}
      <path 
        d="M32 82 
           C 24 82, 18 74, 18 60 
           V 35 
           C 18 18, 32 12, 48 12 
           C 68 12, 82 24, 82 45 
           C 82 66, 68 78, 48 78 
           C 38 78, 32 72, 32 62 
           V 48 
           C 32 40, 38 34, 48 34 
           C 58 34, 64 40, 64 45 
           C 64 54, 58 60, 48 60 
           L 88 12" 
        stroke="url(#metalGradient)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#cyanGlow)"
      />
      
      {/* Arrowhead */}
      <path 
        d="M88 12 L 70 15 L 85 30 Z" 
        fill="url(#metalGradient)" 
        filter="url(#cyanGlow)"
      />
    </svg>
  );
};
