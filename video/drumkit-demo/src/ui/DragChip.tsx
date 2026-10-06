import React from 'react';
import {C, FONT_UI} from '../theme';

// Sample name that travels with the cursor during drag & drop.
export const DragChip: React.FC<{x: number; y: number; label: string; opacity: number; scale: number}> = ({
  x,
  y,
  label,
  opacity,
  scale,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x + 26,
      top: y + 34,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: '0 0',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      height: 60,
      padding: '0 22px 0 14px',
      borderRadius: 30,
      background: C.panel,
      border: `3px solid ${C.green}`,
      fontFamily: FONT_UI,
      fontWeight: 700,
      fontSize: 30,
      color: C.text,
      whiteSpace: 'nowrap',
      boxShadow: '0 12px 26px rgba(0,0,0,0.45)',
    }}
  >
    <svg width={30} height={30} viewBox="0 0 30 30">
      <rect x={1} y={1} width={28} height={28} rx={7} fill={C.green} />
      {[6, 10, 14, 18, 22].map((xx, i) => {
        const h = [8, 16, 22, 12, 6][i];
        return <rect key={xx} x={xx} y={15 - h / 2} width={2.6} height={h} rx={1.3} fill="#1B2A12" />;
      })}
    </svg>
    {label}
  </div>
);
