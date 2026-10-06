import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT_UI} from '../theme';
import {
  PIANO,
  PR_GRID_W,
  PR_GRID_X,
  PR_KEYS_W,
  PR_KEYS_X,
  PR_ROWS,
  PR_ROW_H,
  PR_ROW_Y0,
  PR_STEP_W,
  prRowCY,
  prStepX,
} from '../layout';
import {Panel} from '../ui/Panel';
import {Note} from '../ui/Note';
import {DRAGS, NOTES, SLIDE, playPos} from '../timeline';
import {Pt} from '../motion';

const DROP = DRAGS[3];

export const PianoRollPanel: React.FC<{frame: number; pop: number; cursor: Pt}> = ({frame, pop, cursor}) => {
  const loaded = frame >= DROP.drop;
  const gridBottom = PR_ROW_Y0 + PR_ROWS.length * PR_ROW_H;
  const pos = playPos(frame);
  const slideNote = NOTES[SLIDE.noteIndex];
  const nextNote = NOTES[SLIDE.noteIndex + 1];
  const glide = interpolate(frame, [SLIDE.drawFrom, SLIDE.drawTo], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  // glide curve from end of slide note to start of next note
  const gx0 = prStepX(slideNote.step + slideNote.len) - 8;
  const gy0 = prRowCY(slideNote.row);
  const gx1 = prStepX(nextNote.step) + 8;
  const gy1 = prRowCY(nextNote.row);
  const glidePath = `M ${gx0} ${gy0} C ${gx0 + 40} ${gy0}, ${gx1 - 40} ${gy1}, ${gx1} ${gy1}`;

  return (
    <Panel rect={PIANO} title="Piano Roll" subtitle={loaded ? '808 – stx 808 Glide' : undefined} pop={pop}>
      {/* keys + row shading */}
      {PR_ROWS.map((name, r) => {
        const black = name.includes('#');
        const top = PR_ROW_Y0 + r * PR_ROW_H;
        return (
          <React.Fragment key={name}>
            <div
              style={{
                position: 'absolute',
                left: PR_GRID_X,
                top,
                width: PR_GRID_W,
                height: PR_ROW_H,
                background: black ? '#1A1C1F' : '#23272B',
                borderBottom: '1px solid #15171A',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: PR_KEYS_X,
                top,
                width: black ? PR_KEYS_W * 0.62 : PR_KEYS_W,
                height: PR_ROW_H,
                background: black ? '#202326' : '#D9DCE0',
                borderBottom: '1px solid #8A9097',
                borderRadius: '0 5px 5px 0',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 8,
                fontFamily: FONT_UI,
                fontWeight: 700,
                fontSize: 15,
                color: '#3A3F45',
              }}
            >
              {name.startsWith('C') && !black ? name : ''}
            </div>
          </React.Fragment>
        );
      })}
      {/* vertical grid lines */}
      {Array.from({length: 17}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: prStepX(i) - (i % 4 === 0 ? 1.5 : 0.5),
            top: PR_ROW_Y0,
            width: i % 4 === 0 ? 3 : 1,
            height: gridBottom - PR_ROW_Y0,
            background: i % 4 === 0 ? '#4A4F55' : '#30353A',
          }}
        />
      ))}
      {/* timeline ruler */}
      {[1, 2, 3, 4].map((b) => (
        <div
          key={b}
          style={{
            position: 'absolute',
            left: prStepX((b - 1) * 4) + 6,
            top: PIANO.y + 48,
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 16,
            color: C.textDim,
          }}
        >
          {`1.${b}`}
        </div>
      ))}

      {/* notes (drawn left -> right following the cursor) */}
      {NOTES.map((n, k) => {
        if (frame < n.press) return null;
        const x0 = prStepX(n.step) + 1;
        const full = n.len * PR_STEP_W - 2;
        const w =
          frame >= n.release ? full : Math.max(18, Math.min(full, cursor.x - x0 + 2));
        const isSlide = k === SLIDE.noteIndex;
        const active = pos >= n.step && pos < n.step + n.len ? 1 - (pos - n.step) / n.len : 0;
        return (
          <Note
            key={k}
            x={x0}
            y={PR_ROW_Y0 + n.row * PR_ROW_H + 3}
            w={w}
            h={PR_ROW_H - 6}
            label={PR_ROWS[n.row]}
            active={active}
            slide={isSlide ? interpolate(frame, [SLIDE.click, SLIDE.click + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0}
          />
        );
      })}

      {/* glide line */}
      {glide > 0 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <path
            d={glidePath}
            stroke={C.orange}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${glide} 1`}
          />
          <circle cx={gx0} cy={gy0} r={8} fill={C.orange} />
          {glide > 0.98 ? <circle cx={gx1} cy={gy1} r={8} fill={C.orange} /> : null}
          {glide > 0.6 ? (
            <g opacity={interpolate(glide, [0.6, 1], [0, 1])}>
              <rect x={(gx0 + gx1) / 2 + 12} y={(gy0 + gy1) / 2 - 18} width={78} height={36} rx={18} fill={C.orange} />
              <text
                x={(gx0 + gx1) / 2 + 51}
                y={(gy0 + gy1) / 2 + 7}
                textAnchor="middle"
                fontFamily="Inter"
                fontWeight={800}
                fontSize={19}
                fill={C.dark}
              >
                SLIDE
              </text>
            </g>
          ) : null}
        </svg>
      ) : null}

      {/* drop zone before the 808 is loaded */}
      {!loaded ? (
        <div
          style={{
            position: 'absolute',
            left: PR_GRID_X + 20,
            top: PR_ROW_Y0 + 150,
            width: PR_GRID_W - 40,
            height: 260,
            borderRadius: 14,
            border: `3px dashed ${frame > DROP.grab + 16 ? C.orange : '#4A4F55'}`,
            background: frame > DROP.grab + 16 ? 'rgba(255,122,0,0.12)' : 'rgba(18,20,22,0.6)',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 26,
            color: frame > DROP.grab + 16 ? C.orange : '#6A7078',
          }}
        >
          808 hierher ziehen
        </div>
      ) : null}

      {/* playhead */}
      {pos >= 0 ? (
        <div
          style={{
            position: 'absolute',
            left: prStepX(pos) - 2,
            top: PR_ROW_Y0,
            width: 4,
            height: gridBottom - PR_ROW_Y0,
            background: C.orange,
          }}
        />
      ) : null}
    </Panel>
  );
};
