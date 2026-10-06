import React from 'react';
import {C, FONT_UI} from '../theme';
import {PANEL_HEADER_H, Rect} from '../layout';

// Generic DAW panel: header strip + body. `pop` (0..1, spring) drives the build-in.
export const Panel: React.FC<{
  rect: Rect;
  title: string;
  subtitle?: string;
  pop?: number;
  children?: React.ReactNode;
}> = ({rect, title, subtitle, pop = 1, children}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        background: C.panel,
        border: `1.5px solid ${C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        opacity: Math.min(1, pop * 1.4),
        transform: `scale(${0.9 + 0.1 * pop})`,
      }}
    >
      <div
        style={{
          height: PANEL_HEADER_H,
          background: C.panelHeader,
          borderBottom: `1.5px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 10,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 20,
          color: C.text,
        }}
      >
        <div style={{width: 10, height: 10, borderRadius: 5, background: C.orange}} />
        <span>{title}</span>
        {subtitle ? (
          <span style={{marginLeft: 'auto', color: C.textDim, fontWeight: 500, fontSize: 18}}>{subtitle}</span>
        ) : null}
      </div>
      {/* Body uses panel-local coordinates offset by the panel origin */}
      <div style={{position: 'absolute', left: -rect.x, top: -rect.y, width: 0, height: 0}}>{children}</div>
    </div>
  );
};
