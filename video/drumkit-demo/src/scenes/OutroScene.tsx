import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT_HEAD, FONT_UI} from '../theme';
import {DOWNLOAD_BTN_SCREEN, OUTRO, SCENES} from '../timeline';
import {pop, softSpring} from '../motion';
import {DownloadIcon} from '../ui/Icons';

const URL = 'flamesbounce.com';

// Scene 6 — DAW shrinks away (camera), headline + typewriter URL + Download button.
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame() + SCENES.outro.from;
  const head = softSpring(frame, OUTRO.headline);
  const chars = Math.floor(
    interpolate(frame, [OUTRO.typeFrom, OUTRO.typeTo], [0, URL.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  const caretOn = frame < OUTRO.typeTo + 30 ? Math.floor(frame / 15) % 2 === 0 || frame < OUTRO.typeTo : false;
  const btn = pop(frame, OUTRO.button);
  const press = interpolate(frame, [OUTRO.click - 2, OUTRO.click + 3, OUTRO.click + 14], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const clicked = frame >= OUTRO.click;
  const b = DOWNLOAD_BTN_SCREEN;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1080,
          top: 300,
          textAlign: 'center',
          fontFamily: FONT_HEAD,
          fontSize: 120,
          lineHeight: '130px',
          color: C.text,
          opacity: head,
          transform: `translateY(${(1 - head) * 50}px)`,
        }}
      >
        Jetzt erhältlich
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1080,
          top: 452,
          textAlign: 'center',
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 52,
          color: C.orange,
          whiteSpace: 'pre',
        }}
      >
        {/* keep the line centred on the full string while typing */}
        <span style={{position: 'relative'}}>
          <span style={{visibility: 'hidden'}}>{URL}</span>
          <span style={{position: 'absolute', left: 0, top: 0}}>
            {URL.slice(0, chars)}
            {frame >= OUTRO.typeFrom && caretOn ? (
              <span style={{display: 'inline-block', width: 4, height: 50, background: C.orange, marginLeft: 3, verticalAlign: -6}} />
            ) : null}
          </span>
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: b.x - b.w / 2,
          top: b.y - b.h / 2,
          width: b.w,
          height: b.h,
          borderRadius: b.h / 2,
          background: C.orange,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          fontFamily: FONT_UI,
          fontWeight: 800,
          fontSize: 48,
          color: C.dark,
          opacity: Math.min(1, btn * 1.4),
          transform: `scale(${(0.6 + 0.4 * btn) * (1 - 0.07 * press)})`,
          boxShadow: clicked ? `0 0 0 ${interpolate(frame - OUTRO.click, [0, 20], [0, 14], {extrapolateRight: 'clamp'})}px rgba(255,122,0,0.25)` : '0 14px 30px rgba(0,0,0,0.4)',
        }}
      >
        <DownloadIcon color={C.dark} size={46} />
        Download
      </div>
    </>
  );
};
