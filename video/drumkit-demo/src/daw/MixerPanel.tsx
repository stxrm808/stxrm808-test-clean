import React from 'react';
import {C, FONT_UI} from '../theme';
import {MIXER, MIXER_STRIP_PITCH, MIXER_STRIP_W, MIXER_STRIP_X0} from '../layout';
import {Panel} from '../ui/Panel';
import {Meter} from '../ui/Meter';
import {allLevels} from '../audio';

const STRIPS = ['Kick', 'Snare', 'Hi-Hat', '808', 'Master'];

export const MixerPanel: React.FC<{frame: number; pop: number}> = ({frame, pop}) => {
  const levels = allLevels(frame);
  const meterTop = MIXER.y + 60;
  const meterH = 140;
  return (
    <Panel rect={MIXER} title="Mixer" pop={pop}>
      {STRIPS.map((name, k) => {
        const x = MIXER_STRIP_X0 + k * MIXER_STRIP_PITCH;
        const lvl = levels[k];
        const master = k === 4;
        return (
          <div key={name}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: MIXER.y + 52,
                width: MIXER_STRIP_W,
                height: 206,
                borderRadius: 10,
                background: master ? '#2A2520' : '#24282C',
                border: `1.5px solid ${master ? '#5A4630' : C.border}`,
                boxSizing: 'border-box',
              }}
            />
            <Meter x={x + 18} y={meterTop} w={22} h={meterH} level={lvl} />
            <Meter x={x + 44} y={meterTop} w={22} h={meterH} level={lvl * (0.93 + 0.07 * Math.sin(frame * 2.3 + k))} />
            {/* fader */}
            <div style={{position: 'absolute', left: x + 88, top: meterTop, width: 6, height: meterH, borderRadius: 3, background: '#141618'}} />
            <div
              style={{
                position: 'absolute',
                left: x + 77,
                top: meterTop + 34,
                width: 28,
                height: 16,
                borderRadius: 4,
                background: master ? C.orange : '#AEB4BB',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x,
                top: meterTop + meterH + 8,
                width: MIXER_STRIP_W,
                textAlign: 'center',
                fontFamily: FONT_UI,
                fontWeight: 700,
                fontSize: 19,
                color: master ? C.orange : C.text,
              }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </Panel>
  );
};
