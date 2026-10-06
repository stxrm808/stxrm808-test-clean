// Fake "audio engine": derives meter levels from the pattern so the mixer
// reacts exactly in time with the 140 BPM playback (and with step previews).
import {FRAMES_PER_STEP, NOTES, PATTERN, PLAY_START, STEP_CLICKS} from './timeline';

type Hit = {abs: number; len?: number};

const DRUM_PROFILE = [
  {peak: 0.96, decay: 16},
  {peak: 0.86, decay: 13},
  {peak: 0.62, decay: 7},
];

const latestPlayHit = (frame: number, steps: Hit[]) => {
  if (frame < PLAY_START) return null;
  const pos = (frame - PLAY_START) / FRAMES_PER_STEP;
  const loop = Math.floor(pos / 16);
  let best: Hit | null = null;
  for (const L of [loop - 1, loop]) {
    if (L < 0) continue;
    for (const h of steps) {
      const abs = L * 16 + h.abs;
      if (abs <= pos && (!best || abs > best.abs)) best = {abs, len: h.len};
    }
  }
  if (!best) return null;
  return {dt: (pos - best.abs) * FRAMES_PER_STEP, len: best.len};
};

const jitter = (frame: number, ch: number) => 0.9 + 0.1 * Math.sin(frame * 1.9 + ch * 2.1);

export const channelLevel = (ch: number, frame: number): number => {
  if (ch < 3) {
    const prof = DRUM_PROFILE[ch];
    const steps = Object.keys(PATTERN[ch]).map((s) => ({abs: Number(s)}));
    let dt = Infinity;
    const play = latestPlayHit(frame, steps);
    if (play) dt = play.dt;
    // preview when a step is clicked in the editor
    for (const [c, , f] of STEP_CLICKS) if (c === ch && frame >= f) dt = Math.min(dt, frame - f);
    if (ch === 2) {
      for (const f of Object.values(PATTERN[2])) if (frame >= f && frame < PLAY_START) dt = Math.min(dt, frame - f);
    }
    if (!isFinite(dt)) return 0;
    return prof.peak * Math.exp(-dt / prof.decay) * jitter(frame, ch);
  }
  // 808
  let level = 0;
  const play = latestPlayHit(
    frame,
    NOTES.map((n) => ({abs: n.step, len: n.len})),
  );
  if (play) {
    const noteFrames = (play.len ?? 1) * FRAMES_PER_STEP;
    const body = Math.max(0.55, 0.94 * Math.exp(-play.dt / 30));
    level = play.dt < noteFrames ? body : body * Math.exp(-(play.dt - noteFrames) / 5);
  }
  for (const n of NOTES) {
    if (frame >= n.press && frame < PLAY_START) {
      const dt = frame - n.press;
      level = Math.max(level, 0.85 * Math.exp(-dt / 22));
    }
  }
  return level * jitter(frame, ch);
};

export const allLevels = (frame: number) => {
  const ch = [0, 1, 2, 3].map((c) => channelLevel(c, frame));
  const max = Math.max(...ch);
  const sum = ch.reduce((a, b) => a + b, 0);
  const master = Math.min(0.98, 0.55 * max + 0.22 * sum);
  return [...ch, master];
};
