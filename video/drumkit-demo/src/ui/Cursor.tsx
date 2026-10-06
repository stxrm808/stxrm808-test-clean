import React from 'react';

// Mouse pointer; the hotspot (tip) sits at (x, y).
export const Cursor: React.FC<{x: number; y: number; pressed: boolean; opacity: number; size?: number}> = ({
  x,
  y,
  pressed,
  opacity,
  size = 1.5,
}) => (
  <svg
    width={40 * size}
    height={50 * size}
    viewBox="-3 -3 40 50"
    style={{
      position: 'absolute',
      left: x - 3 * size,
      top: y - 3 * size,
      opacity,
      transformOrigin: `${3 * size}px ${3 * size}px`,
      transform: `scale(${pressed ? 0.86 : 1})`,
      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))',
    }}
  >
    <path
      d="M0 0 L0 34 L8.5 26.5 L14.5 40 L21 37 L15 24 L26 24 Z"
      fill="#FFFFFF"
      stroke="#111315"
      strokeWidth={2.6}
      strokeLinejoin="round"
    />
  </svg>
);
