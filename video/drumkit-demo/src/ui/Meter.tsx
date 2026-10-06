import React from 'react';
import {C} from '../theme';

// Vertical level meter bar.
export const Meter: React.FC<{x: number; y: number; w: number; h: number; level: number}> = ({
  x,
  y,
  w,
  h,
  level,
}) => {
  const l = Math.max(0, Math.min(1, level));
  const hot = l > 0.82;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: '#141618',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          height: `${l * 100}%`,
          background: C.green,
          borderTop: hot ? `${h * 0.08}px solid ${C.orange}` : undefined,
          boxSizing: 'border-box',
        }}
      />
      {/* segment lines for a clean "LED" read */}
      {Array.from({length: 11}).map((_, i) => (
        <div
          key={i}
          style={{position: 'absolute', left: 0, right: 0, top: (h / 12) * (i + 1), height: 2, background: '#141618'}}
        />
      ))}
    </div>
  );
};
