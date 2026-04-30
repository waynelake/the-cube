import React from 'react';

interface CubeIconProps {
  size?: number;
  color?: string;
  glowColor?: string;
}

export function CubeIcon({ size = 32, color = '#7c3aed', glowColor = 'rgba(124,58,237,0.4)' }: CubeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
    >
      <polygon
        points="16,4 28,10 28,22 16,28 4,22 4,10"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="16" y1="4" x2="16" y2="16" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="4" y1="10" x2="16" y2="16" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="28" y1="10" x2="16" y2="16" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
    </svg>
  );
}
