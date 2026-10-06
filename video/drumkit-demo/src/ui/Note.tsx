import React from 'react';
import {C, FONT_UI} from '../theme';

// A piano-roll note block.
export const Note: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  active?: number; // 0..1 playback highlight
  slide?: number; // 0..1 slide marker visibility
}> = ({x, y, w, h, label, active = 0, slide = 0}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 6,
      background: C.green,
      border: '2px solid #4E9A2A',
      boxSizing: 'border-box',
      filter: `brightness(${1 + 0.35 * active})`,
      boxShadow: active > 0 ? `0 0 0 ${3 * active}px rgba(255,255,255,0.5)` : 'none',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 7,
      fontFamily: FONT_UI,
      fontWeight: 700,
      fontSize: 17,
      color: '#1B2A12',
    }}
  >
    {w > 44 ? label : null}
    {slide > 0 ? (
      <svg
        width={18}
        height={18}
        viewBox="0 0 18 18"
        style={{position: 'absolute', right: 5, top: (h - 4 - 18) / 2, opacity: slide}}
      >
        <path d="M2 16 L16 2 L16 16 Z" fill={C.orange} />
      </svg>
    ) : null}
  </div>
);
