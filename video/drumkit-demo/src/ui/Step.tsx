import React from 'react';
import {C} from '../theme';
import {STEP_H, STEP_W} from '../layout';

// One channel-rack step button.
export const Step: React.FC<{
  x: number;
  y: number;
  index: number;
  on: boolean;
  flash: number; // 0..1, click highlight
  beat: number; // 0..1, playback pulse
}> = ({x, y, index, on, flash, beat}) => {
  const alt = Math.floor(index / 4) % 2 === 1;
  const offColor = alt ? C.stepOffAlt : C.stepOff;
  const scale = 1 + 0.18 * flash + 0.1 * beat;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: STEP_W,
        height: STEP_H,
        borderRadius: 6,
        background: on ? C.green : offColor,
        boxShadow: on
          ? `0 0 0 ${2 + 4 * flash}px rgba(123,217,74,${0.25 + 0.45 * flash + 0.35 * beat})`
          : 'none',
        filter: on ? `brightness(${1 + 0.35 * beat + 0.3 * flash})` : undefined,
        transform: `scale(${scale})`,
      }}
    >
      {/* subtle top highlight to read as a button */}
      <div
        style={{
          position: 'absolute',
          left: 4,
          right: 4,
          top: 4,
          height: 6,
          borderRadius: 3,
          background: on ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.07)',
        }}
      />
    </div>
  );
};
