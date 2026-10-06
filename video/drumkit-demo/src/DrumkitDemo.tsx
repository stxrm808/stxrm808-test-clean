import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {C} from './theme';
import {Daw} from './daw/Daw';
import {Cursor} from './ui/Cursor';
import {Ripple} from './ui/Ripple';
import {camTransform, getCam, getCursorScreen, getCursorWorld, isPressed, toScreen} from './motion';
import {CURSOR_IN, PRESSES, SCENES} from './timeline';
import {IntroScene} from './scenes/IntroScene';
import {BrowserScene} from './scenes/BrowserScene';
import {ChannelRackScene} from './scenes/ChannelRackScene';
import {PianoRollScene} from './scenes/PianoRollScene';
import {PlayScene} from './scenes/PlayScene';
import {OutroScene} from './scenes/OutroScene';

const span = (s: {from: number; to: number}, lead = 0) => ({from: s.from - lead, durationInFrames: s.to - s.from + lead});

export const DrumkitDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = getCam(frame);
  const cursorScreen = getCursorScreen(frame);
  const cursorWorld = getCursorWorld(frame);
  const cursorOpacity = interpolate(frame, [CURSOR_IN - 4, CURSOR_IN + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {/* World layer: the DAW, moved by the camera */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: camTransform(cam)}}>
        <Daw frame={frame} cursorWorld={cursorWorld} cursorVisible={cursorOpacity > 0.5} />
      </div>

      {/* Header / title (scene 1, stays as header) */}
      <IntroScene />

      {/* Per-scene overlays */}
      <Sequence {...span(SCENES.browser)} layout="none">
        <BrowserScene />
      </Sequence>
      <Sequence {...span(SCENES.rack, 30)} layout="none">
        <ChannelRackScene />
      </Sequence>
      <Sequence {...span({from: SCENES.piano.from, to: SCENES.piano.to + 10})} layout="none">
        <PianoRollScene />
      </Sequence>
      <Sequence {...span(SCENES.play)} layout="none">
        <PlayScene />
      </Sequence>
      <Sequence {...span(SCENES.outro)} layout="none">
        <OutroScene />
      </Sequence>

      {/* Cursor + click ripples (screen space, constant size) */}
      {PRESSES.map((p) => {
        // anchor the ripple in world space so it sticks to the clicked element
        const pos = toScreen(cam, getCursorWorld(p.f));
        return <Ripple key={p.f} x={pos.x} y={pos.y} age={frame - p.f} color={p.color} />;
      })}
      <Cursor x={cursorScreen.x} y={cursorScreen.y} pressed={isPressed(frame)} opacity={cursorOpacity} />
    </AbsoluteFill>
  );
};
