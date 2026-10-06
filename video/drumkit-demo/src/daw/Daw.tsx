import React from 'react';
import {C} from '../theme';
import {WIN} from '../layout';
import {PANEL_POP} from '../timeline';
import {Pt, pop} from '../motion';
import {TitleBar, Toolbar} from './Toolbar';
import {BrowserPanel} from './BrowserPanel';
import {ChannelRackPanel} from './ChannelRackPanel';
import {MixerPanel} from './MixerPanel';
import {PianoRollPanel} from './PianoRollPanel';

// The full DAW window in world coordinates. Pure function of the frame.
export const Daw: React.FC<{frame: number; cursorWorld: Pt; cursorVisible: boolean}> = ({
  frame,
  cursorWorld,
  cursorVisible,
}) => {
  const pWin = pop(frame, PANEL_POP.window);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: WIN.x,
          top: WIN.y,
          width: WIN.w,
          height: WIN.h,
          background: C.daw,
          borderRadius: 18,
          border: `2px solid ${C.border}`,
          boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
          opacity: Math.min(1, pWin * 1.4),
          transform: `scale(${0.94 + 0.06 * pWin})`,
        }}
      />
      <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, pWin * 1.4)}}>
        <TitleBar />
      </div>
      <Toolbar frame={frame} pop={pop(frame, PANEL_POP.toolbar)} />
      <BrowserPanel frame={frame} pop={pop(frame, PANEL_POP.browser)} cursor={cursorWorld} cursorVisible={cursorVisible} />
      <ChannelRackPanel frame={frame} pop={pop(frame, PANEL_POP.rack)} />
      <MixerPanel frame={frame} pop={pop(frame, PANEL_POP.mixer)} />
      <PianoRollPanel frame={frame} pop={pop(frame, PANEL_POP.piano)} cursor={cursorWorld} />
    </>
  );
};
