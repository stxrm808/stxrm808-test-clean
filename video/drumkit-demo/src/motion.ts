import {Easing, interpolate, spring} from 'remotion';
import {VIEW} from './layout';
import {CAM_KEYS, CURSOR_KEYS, CamKey, PRESSES} from './timeline';

const easeInOut = Easing.inOut(Easing.cubic);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const pop = (frame: number, start: number, fps = 60) =>
  spring({frame: frame - start, fps, config: {damping: 14, stiffness: 170, mass: 0.8}});

export const softSpring = (frame: number, start: number, fps = 60) =>
  spring({frame: frame - start, fps, config: {damping: 200, stiffness: 120}});

export const fade = (frame: number, from: number, to: number, dur = 12) =>
  interpolate(frame, [from, from + dur, to - dur, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------
export type Cam = {s: number; cx: number; cy: number};
export type Pt = {x: number; y: number};

export const getCam = (frame: number): Cam => {
  const keys = CAM_KEYS;
  if (frame <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a: CamKey = keys[i];
    const b: CamKey = keys[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const t = easeInOut(clamp01((frame - a.f) / (b.f - a.f)));
      // interpolate scale in log space so zooms feel even
      const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t);
      return {s, cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t};
    }
  }
  return keys[keys.length - 1];
};

export const toScreen = (cam: Cam, p: Pt): Pt => ({
  x: (p.x - cam.cx) * cam.s + VIEW.cx,
  y: (p.y - cam.cy) * cam.s + VIEW.cy,
});

export const toWorld = (cam: Cam, p: Pt): Pt => ({
  x: (p.x - VIEW.cx) / cam.s + cam.cx,
  y: (p.y - VIEW.cy) / cam.s + cam.cy,
});

export const camTransform = (cam: Cam) =>
  `translate(${VIEW.cx - cam.cx * cam.s}px, ${VIEW.cy - cam.cy * cam.s}px) scale(${cam.s})`;

// ---------------------------------------------------------------------------
// Cursor
// ---------------------------------------------------------------------------
export const getCursorScreen = (frame: number): Pt => {
  const cam = getCam(frame);
  const keys = CURSOR_KEYS;
  const keyToScreen = (k: (typeof keys)[number]) =>
    k.space === 'screen' ? {x: k.x, y: k.y} : toScreen(cam, k);
  if (frame <= keys[0].f) return keyToScreen(keys[0]);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const raw = clamp01((frame - a.f) / (b.f - a.f));
      const t = b.ease === 'linear' ? raw : easeInOut(raw);
      const pa = keyToScreen(a);
      const pb = keyToScreen(b);
      return {x: pa.x + (pb.x - pa.x) * t, y: pa.y + (pb.y - pa.y) * t};
    }
  }
  return keyToScreen(keys[keys.length - 1]);
};

export const getCursorWorld = (frame: number): Pt =>
  toWorld(getCam(frame), getCursorScreen(frame));

export const isPressed = (frame: number) =>
  PRESSES.some((p) => frame >= p.f && frame <= (p.release ?? p.f + 6));
