import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT_UI} from '../theme';
import {
  RACK,
  RACK_NAME_W,
  RACK_NAME_X,
  RACK_ROW_H,
  STEP_H,
  STEP_W,
  rackRowTop,
  stepPosX,
  stepX,
} from '../layout';
import {Panel} from '../ui/Panel';
import {Step} from '../ui/Step';
import {CHANNELS, DRAGS, NOTES, PATTERN, playPos} from '../timeline';
import {pop as popSpring} from '../motion';

const DropZone: React.FC<{top: number; active: boolean; label: string}> = ({top, active, label}) => (
  <div
    style={{
      position: 'absolute',
      left: RACK.x + 12,
      top,
      width: RACK.w - 24,
      height: RACK_ROW_H,
      borderRadius: 10,
      border: `2.5px dashed ${active ? C.orange : '#4A4F55'}`,
      background: active ? 'rgba(255,122,0,0.12)' : 'transparent',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      fontFamily: FONT_UI,
      fontWeight: 600,
      fontSize: 20,
      color: active ? C.orange : '#6A7078',
    }}
  >
    <span style={{fontSize: 28, fontWeight: 500}}>+</span>
    {label}
  </div>
);

export const ChannelRackPanel: React.FC<{frame: number; pop: number}> = ({frame, pop}) => {
  const pos = playPos(frame);
  const playing = pos >= 0;
  const curStep = playing ? Math.floor(pos) : -1;
  const stepFrac = playing ? pos - curStep : 0;
  const beatPulse = playing ? Math.max(0, 1 - stepFrac * 1.6) : 0;
  const firstEmpty = CHANNELS.findIndex((c) => frame < c.drop);

  return (
    <Panel rect={RACK} title="Channel Rack" subtitle="Pattern 1" pop={pop}>
      {CHANNELS.map((ch, r) => {
        const top = rackRowTop(r);
        if (frame < ch.drop) {
          if (r !== firstEmpty) return null;
          const drag = DRAGS.find((d) => d.channel === r);
          const active = !!drag && frame > drag.grab + 14 && frame < drag.drop && r < 3;
          return <DropZone key={r} top={top} active={active} label="Sound hierher ziehen" />;
        }
        const p = popSpring(frame, ch.drop);
        return (
          <div
            key={r}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              opacity: Math.min(1, p * 1.5),
              transform: `translateX(${(1 - p) * -30}px)`,
            }}
          >
            {/* LED */}
            <div
              style={{
                position: 'absolute',
                left: RACK.x + 14,
                top: top + RACK_ROW_H / 2 - 9,
                width: 18,
                height: 18,
                borderRadius: 9,
                background: C.green,
                boxShadow: '0 0 0 3px rgba(123,217,74,0.2)',
              }}
            />
            {/* name button */}
            <div
              style={{
                position: 'absolute',
                left: RACK_NAME_X,
                top: top + 8,
                width: RACK_NAME_W,
                height: RACK_ROW_H - 16,
                borderRadius: 8,
                background: '#3A3F45',
                border: `1.5px solid ${r === 3 ? C.orange : '#50565D'}`,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 14,
                fontFamily: FONT_UI,
                fontWeight: 700,
                fontSize: 22,
                color: C.text,
                transform: `scale(${interpolate(p, [0, 1], [1.15, 1])})`,
              }}
            >
              {ch.name}
            </div>
            {r < 3
              ? Array.from({length: 16}).map((_, i) => {
                  const onF = PATTERN[r][i];
                  const on = onF !== undefined && frame >= onF;
                  const flash = on ? interpolate(frame - onF, [0, 16], [1, 0], {extrapolateRight: 'clamp'}) : 0;
                  return (
                    <Step
                      key={i}
                      x={stepX(i)}
                      y={top + (RACK_ROW_H - STEP_H) / 2}
                      index={i}
                      on={on}
                      flash={flash}
                      beat={on && i === curStep ? beatPulse : 0}
                    />
                  );
                })
              : // 808 channel: mini piano-roll preview instead of steps
                (
                  <div
                    style={{
                      position: 'absolute',
                      left: stepX(0),
                      top: top + 8,
                      width: stepX(15) + STEP_W - stepX(0),
                      height: RACK_ROW_H - 16,
                      borderRadius: 8,
                      background: '#15171A',
                      border: `1.5px solid ${C.border}`,
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    {NOTES.filter((n) => frame >= n.release).map((n, k) => (
                      <div
                        key={k}
                        style={{
                          position: 'absolute',
                          left: (n.step / 16) * 494 + 4,
                          width: (n.len / 16) * 494 - 6,
                          top: 6 + (n.row / 13) * 28,
                          height: 8,
                          borderRadius: 3,
                          background: C.green,
                        }}
                      />
                    ))}
                  </div>
                )}
          </div>
        );
      })}
      {/* playhead */}
      {playing ? (
        <div
          style={{
            position: 'absolute',
            left: stepPosX(pos) - 2,
            top: rackRowTop(0) - 6,
            width: 4,
            height: rackRowTop(3) + RACK_ROW_H + 12 - rackRowTop(0),
            borderRadius: 2,
            background: C.orange,
          }}
        />
      ) : null}
    </Panel>
  );
};
