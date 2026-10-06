import React from 'react';
import {C, FONT_UI} from '../theme';
import {Pt} from '../motion';

// Pill-shaped explainer label with an arrow pointing to `anchor` (screen space).
export const Callout: React.FC<{
  index: number;
  text: string;
  anchor: Pt;
  progress: number; // 0..1 in/out
  y?: number;
}> = ({index, text, anchor, progress, y = 320}) => {
  if (progress <= 0.001) return null;
  const pillH = 84;
  const pillBottom = y + pillH / 2;
  const startX = 540;
  const dx = anchor.x - startX;
  const dy = anchor.y - pillBottom - 10;
  const len = Math.hypot(dx, dy);
  const lineP = Math.max(0, Math.min(1, (progress - 0.3) / 0.7));
  const endX = startX + dx * lineP;
  const endY = pillBottom + dy * lineP;
  const ang = Math.atan2(dy, dx);
  const head = 18;
  return (
    <>
      {len > 30 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: Math.min(1, progress * 2)}}>
          <line x1={startX} y1={pillBottom} x2={endX} y2={endY} stroke={C.orange} strokeWidth={5} strokeLinecap="round" />
          {lineP > 0.95 ? (
            <path
              d={`M ${endX} ${endY} L ${endX - head * Math.cos(ang - 0.45)} ${endY - head * Math.sin(ang - 0.45)} L ${
                endX - head * Math.cos(ang + 0.45)
              } ${endY - head * Math.sin(ang + 0.45)} Z`}
              fill={C.orange}
            />
          ) : null}
        </svg>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1080,
          top: y - pillH / 2,
          height: pillH,
          display: 'flex',
          justifyContent: 'center',
          transform: `translateY(${(1 - progress) * 24}px) scale(${0.85 + 0.15 * progress})`,
          opacity: Math.min(1, progress * 1.5),
        }}
      >
        <div
          style={{
            height: pillH,
            borderRadius: pillH / 2,
            background: C.orange,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 34px 0 14px',
            fontFamily: FONT_UI,
            fontWeight: 800,
            fontSize: 38,
            color: C.dark,
            whiteSpace: 'nowrap',
            boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              background: C.dark,
              color: C.orange,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            {index}
          </div>
          {text}
        </div>
      </div>
    </>
  );
};
