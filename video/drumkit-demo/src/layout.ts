// All DAW geometry lives in "world" coordinates (a 1080x1920 canvas).
// The camera maps world -> screen; overlays (cursor, callouts) live in screen space.

export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const DURATION = 1200;

export const HEADER_H = 230;
// Centre of the area below the header — the camera's focus point lands here.
export const VIEW = {cx: 540, cy: 1075};

export type Rect = {x: number; y: number; w: number; h: number};

export const WIN: Rect = {x: 30, y: 250, w: 1020, h: 1580};
export const TITLEBAR: Rect = {x: 30, y: 250, w: 1020, h: 50};
export const TOOLBAR: Rect = {x: 30, y: 300, w: 1020, h: 90};
export const BROWSER: Rect = {x: 40, y: 400, w: 290, h: 1420};
export const RACK: Rect = {x: 340, y: 400, w: 700, h: 430};
export const MIXER: Rect = {x: 340, y: 840, w: 700, h: 270};
export const PIANO: Rect = {x: 340, y: 1120, w: 700, h: 700};
export const PANEL_HEADER_H = 44;

// Toolbar
export const PLAY_BTN: Rect = {x: 50, y: 315, w: 70, h: 60};
export const STOP_BTN: Rect = {x: 130, y: 315, w: 70, h: 60};
export const REC_BTN: Rect = {x: 210, y: 315, w: 70, h: 60};

// Browser rows
export const BROWSER_ROW_Y0 = 452;
export const BROWSER_ROW_H = 50;
export const KIT_ROW_INDEX = 2;
export const KIT_CHILDREN = ['808s', 'Kicks', 'Snares', 'Hi-Hats', 'Percs', 'Loops'];
export const browserChildCenterY = (j: number) =>
  BROWSER_ROW_Y0 + (KIT_ROW_INDEX + 1 + j) * BROWSER_ROW_H + BROWSER_ROW_H / 2;
export const KIT_ROW_CY = BROWSER_ROW_Y0 + KIT_ROW_INDEX * BROWSER_ROW_H + BROWSER_ROW_H / 2;

// Channel rack
export const RACK_ROW_Y0 = 456;
export const RACK_ROW_H = 66;
export const RACK_ROW_PITCH = 76;
export const rackRowTop = (r: number) => RACK_ROW_Y0 + r * RACK_ROW_PITCH;
export const rackRowCY = (r: number) => rackRowTop(r) + RACK_ROW_H / 2;
export const RACK_NAME_X = 380;
export const RACK_NAME_W = 140;
export const STEP_X0 = 536;
export const STEP_W = 26;
export const STEP_H = 46;
export const STEP_PITCH = 30;
export const STEP_GROUP_GAP = 6;
export const stepX = (i: number) => STEP_X0 + i * STEP_PITCH + Math.floor(i / 4) * STEP_GROUP_GAP;
export const stepCX = (i: number) => stepX(i) + STEP_W / 2;
// Continuous x position for the playhead (pos in steps, 0..16)
export const stepPosX = (pos: number) => {
  const i = Math.min(15, Math.floor(pos));
  const frac = pos - i;
  return stepX(i) + frac * (i === 15 ? STEP_W + 4 : stepX(i + 1) - stepX(i));
};

// Mixer
export const MIXER_STRIP_X0 = 354;
export const MIXER_STRIP_W = 120;
export const MIXER_STRIP_PITCH = 138;

// Piano roll
export const PR_KEYS_X = 350;
export const PR_KEYS_W = 80;
export const PR_GRID_X = 430;
export const PR_GRID_W = 600;
export const PR_STEP_W = PR_GRID_W / 16;
export const PR_ROW_Y0 = 1176;
export const PR_ROW_H = 42;
export const PR_ROWS = ['C3', 'B2', 'A#2', 'A2', 'G#2', 'G2', 'F#2', 'F2', 'E2', 'D#2', 'D2', 'C#2', 'C2', 'B1'];
export const prStepX = (step: number) => PR_GRID_X + step * PR_STEP_W;
export const prRowCY = (row: number) => PR_ROW_Y0 + row * PR_ROW_H + PR_ROW_H / 2;
