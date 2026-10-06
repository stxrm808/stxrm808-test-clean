import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT_HEAD, FONT_UI} from '../theme';
import {HEADER_H} from '../layout';
import {OUTRO, SCENES, TITLE_SHRINK} from '../timeline';
import {softSpring} from '../motion';

// Scene 1 — title flies in, then shrinks into the persistent header.
// Rendered for the whole video (absolute frame) because the header stays on screen.
// The DAW build-in (panels popping in) is driven by PANEL_POP in <Daw/>.
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tIn = softSpring(frame, 4);
  const subIn = softSpring(frame, 16);
  const shrink = interpolate(frame, [TITLE_SHRINK.from, TITLE_SHRINK.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  });
  const titleY = interpolate(shrink, [0, 1], [880, 92]);
  const titleScale = interpolate(shrink, [0, 1], [1, 0.68]);
  const subY = interpolate(shrink, [0, 1], [1010, 172]);
  const subScale = interpolate(shrink, [0, 1], [1, 0.72]);
  const bandOpacity = shrink;
  const subOut = interpolate(frame, [SCENES.outro.from, SCENES.outro.from + 20], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleOutroY = interpolate(frame, [SCENES.outro.from, OUTRO.headline], [0, 18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {/* header band — masks the DAW when the camera zooms */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          height: HEADER_H,
          background: C.bg,
          borderBottom: `2px solid #24282C`,
          opacity: bandOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1080,
          top: titleY + titleOutroY - 100,
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${titleScale}) translateY(${(1 - tIn) * 120}px)`,
          opacity: tIn,
          fontFamily: FONT_HEAD,
          fontSize: 124,
          color: C.text,
          letterSpacing: 1,
          whiteSpace: 'nowrap',
        }}
      >
        stxrm808&nbsp;<span style={{color: C.orange}}>Drumkit</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1080,
          top: subY - 40,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${subScale}) translateY(${(1 - subIn) * 60}px)`,
          opacity: subIn * subOut,
          fontFamily: FONT_UI,
          fontWeight: 600,
          fontSize: 50,
          color: C.textDim,
        }}
      >
        So benutzt du es
      </div>
    </>
  );
};
