import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT_UI} from '../theme';
import {BROWSER, BROWSER_ROW_H, BROWSER_ROW_Y0, KIT_CHILDREN} from '../layout';
import {Panel} from '../ui/Panel';
import {Chevron, FolderIcon} from '../ui/Icons';
import {KIT_CLICK, DRAGS, kitChildStart} from '../timeline';
import {Pt, softSpring} from '../motion';

type Row = {label: string; depth: number; kind: 'folder' | 'kit' | 'child'; h: number; o: number};

export const BrowserPanel: React.FC<{frame: number; pop: number; cursor: Pt; cursorVisible: boolean}> = ({
  frame,
  pop,
  cursor,
  cursorVisible,
}) => {
  const open = softSpring(frame, KIT_CLICK + 2);
  const rows: Row[] = [
    {label: 'Current project', depth: 0, kind: 'folder', h: 1, o: 1},
    {label: 'Plugin database', depth: 0, kind: 'folder', h: 1, o: 1},
    {label: 'stxrm808 Drumkit', depth: 0, kind: 'kit', h: 1, o: 1},
    ...KIT_CHILDREN.map((label, j) => {
      const p = softSpring(frame, kitChildStart(j));
      return {label, depth: 1, kind: 'child' as const, h: p, o: p};
    }),
    {label: 'Recorded', depth: 0, kind: 'folder', h: 1, o: 1},
    {label: 'Rendered', depth: 0, kind: 'folder', h: 1, o: 1},
  ];

  // which child row is being dragged right now (stays highlighted)
  const dragging = DRAGS.find((d) => frame >= d.grab && frame <= d.drop);
  const dragLabel = dragging ? KIT_CHILDREN[[1, 2, 3, 0][dragging.channel]] : null;

  let y = BROWSER_ROW_Y0;
  return (
    <Panel rect={BROWSER} title="Browser" pop={pop}>
      {rows.map((r) => {
        const top = y;
        const h = BROWSER_ROW_H * r.h;
        y += h;
        if (r.h < 0.01) return null;
        const hovered =
          cursorVisible &&
          cursor.x > BROWSER.x &&
          cursor.x < BROWSER.x + BROWSER.w &&
          cursor.y >= top &&
          cursor.y < top + h;
        const highlight = r.label === dragLabel || (hovered && !dragging);
        const isKit = r.kind === 'kit';
        const indent = r.depth * 30;
        return (
          <div
            key={r.label}
            style={{
              position: 'absolute',
              left: BROWSER.x + 6,
              top,
              width: BROWSER.w - 12,
              height: h,
              overflow: 'hidden',
              opacity: r.o,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: BROWSER_ROW_H,
                borderRadius: 8,
                background: highlight ? 'rgba(255,122,0,0.18)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingLeft: 12 + indent,
                fontFamily: FONT_UI,
                fontWeight: isKit ? 700 : r.kind === 'child' ? 600 : 500,
                fontSize: 21,
                color: isKit || highlight ? C.text : r.kind === 'child' ? '#D3D7DC' : C.textDim,
                whiteSpace: 'nowrap',
                transform: `translateY(${(1 - r.h) * -10}px)`,
              }}
            >
              {highlight ? (
                <div style={{position: 'absolute', left: 0, top: 8, bottom: 8, width: 4, borderRadius: 2, background: C.orange}} />
              ) : null}
              {isKit ? (
                <Chevron rotate={interpolate(open, [0, 1], [0, 90])} color={C.orange} />
              ) : r.kind === 'folder' ? (
                <Chevron rotate={0} color="#5A6068" />
              ) : null}
              <FolderIcon color={isKit ? C.orange : r.kind === 'child' ? '#C9A27A' : '#5A6068'} size={isKit ? 28 : 24} />
              <span>{r.label}</span>
            </div>
          </div>
        );
      })}
    </Panel>
  );
};
