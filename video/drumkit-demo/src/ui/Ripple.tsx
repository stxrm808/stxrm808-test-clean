import React from 'react';
import {interpolate} from 'remotion';
import {C} from '../theme';

// Click feedback: a small circle that expands and fades.
export const Ripple: React.FC<{x: number; y: number; age: number; color?: string}> = ({
  x,
  y,
  age,
  color = C.orange,
}) => {
  const dur = 24;
  if (age < 0 || age > dur) return null;
  const r = interpolate(age, [0, dur], [10, 54], {easing: (t) => 1 - Math.pow(1 - t, 3)});
  const o = interpolate(age, [0, dur], [0.95, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        border: `5px solid ${color}`,
        boxSizing: 'border-box',
        opacity: o,
      }}
    />
  );
};
