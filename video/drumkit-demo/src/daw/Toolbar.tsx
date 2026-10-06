import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT_UI} from '../theme';
import {PLAY_BTN, REC_BTN, STOP_BTN, Rect, TITLEBAR, TOOLBAR} from '../layout';
import {PlayIcon} from '../ui/Icons';
import {FRAMES_PER_STEP, PLAY_CLICK, PLAY_START} from '../timeline';

const Btn: React.FC<{rect: Rect; active?: boolean; press?: number; children: React.ReactNode}> = ({
  rect,
  active,
  press = 0,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      borderRadius: 10,
      background: active ? C.orange : C.panel,
      border: `1.5px solid ${active ? C.orange : C.border}`,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${1 - 0.12 * press})`,
    }}
  >
    {children}
  </div>
);

const Display: React.FC<{x: number; w: number; label: string; value: string; accent?: boolean}> = ({
  x,
  w,
  label,
  value,
  accent,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 315,
      width: w,
      height: 60,
      borderRadius: 10,
      background: '#15171A',
      border: `1.5px solid ${C.border}`,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: 14,
      fontFamily: FONT_UI,
    }}
  >
    <div style={{fontSize: 13, fontWeight: 600, color: C.textDim, letterSpacing: 1}}>{label}</div>
    <div
      style={{
        fontSize: 25,
        fontWeight: 700,
        color: accent ? C.orange : C.text,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}
    >
      {value}
    </div>
  </div>
);

export const TitleBar: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: TITLEBAR.x,
      top: TITLEBAR.y,
      width: TITLEBAR.w,
      height: TITLEBAR.h,
      display: 'flex',
      alignItems: 'center',
      padding: '0 18px',
      gap: 9,
      fontFamily: FONT_UI,
      fontSize: 18,
      fontWeight: 600,
      color: C.textDim,
      borderBottom: `1.5px solid ${C.border}`,
      boxSizing: 'border-box',
    }}
  >
    {['#4A4F55', '#4A4F55', '#4A4F55'].map((c, i) => (
      <div key={i} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
    ))}
    <span style={{marginLeft: 16}}>Beat Demo – stxrm808 Drumkit</span>
  </div>
);

export const Toolbar: React.FC<{frame: number; pop: number}> = ({frame, pop}) => {
  const playing = frame >= PLAY_START;
  const press = interpolate(frame, [PLAY_CLICK - 2, PLAY_CLICK + 2, PLAY_CLICK + 9], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // bars:beats:steps
  let time = '1:01:00';
  if (playing) {
    const total = Math.floor((frame - PLAY_START) / FRAMES_PER_STEP);
    const bar = Math.floor(total / 16) + 1;
    const beat = Math.floor((total % 16) / 4) + 1;
    const step = total % 4;
    time = `${bar}:${String(beat).padStart(2, '0')}:${String(step).padStart(2, '0')}`;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: Math.min(1, pop * 1.4),
        transform: `translateY(${(1 - pop) * -20}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: TOOLBAR.x,
          top: TOOLBAR.y,
          width: TOOLBAR.w,
          height: TOOLBAR.h,
          borderBottom: `1.5px solid ${C.border}`,
          boxSizing: 'border-box',
        }}
      />
      <Btn rect={PLAY_BTN} active={playing} press={press}>
        <PlayIcon color={playing ? C.dark : C.green} size={28} />
      </Btn>
      <Btn rect={STOP_BTN}>
        <div style={{width: 20, height: 20, borderRadius: 3, background: C.textDim}} />
      </Btn>
      <Btn rect={REC_BTN}>
        <div style={{width: 22, height: 22, borderRadius: 11, background: '#C2453A'}} />
      </Btn>
      <Display x={300} w={160} label="TEMPO" value="140.000" accent />
      <Display x={476} w={180} label="PATTERN" value="Pattern 1" />
      <Display x={672} w={170} label="SONG POS" value={time} />
      {/* small master activity strip */}
      <div
        style={{
          position: 'absolute',
          left: 858,
          top: 315,
          width: 176,
          height: 60,
          borderRadius: 10,
          background: '#15171A',
          border: `1.5px solid ${C.border}`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 18,
          color: playing ? C.green : C.textDim,
        }}
      >
        <div style={{width: 12, height: 12, borderRadius: 6, background: playing ? C.green : '#4A4F55'}} />
        {playing ? 'PLAYING' : 'STOPPED'}
      </div>
    </div>
  );
};
