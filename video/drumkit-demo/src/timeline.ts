import {
  KIT_ROW_CY,
  PLAY_BTN,
  browserChildCenterY,
  prRowCY,
  prStepX,
  rackRowCY,
  stepCX,
} from './layout';

// ---------------------------------------------------------------------------
// Scene ranges (frames @ 60 fps)
// ---------------------------------------------------------------------------
export const SCENES = {
  intro: {from: 0, to: 120},
  browser: {from: 120, to: 300},
  rack: {from: 300, to: 540},
  piano: {from: 540, to: 780},
  play: {from: 780, to: 960},
  outro: {from: 960, to: 1200},
} as const;

// ---------------------------------------------------------------------------
// Intro
// ---------------------------------------------------------------------------
export const TITLE_SHRINK = {from: 62, to: 100};
export const PANEL_POP = {
  window: 70,
  toolbar: 80,
  browser: 89,
  rack: 98,
  mixer: 107,
  piano: 116,
};

// ---------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------
export const CURSOR_IN = 132;
export const KIT_CLICK = 172;
export const KIT_CHILD_STAGGER = 7;
export const kitChildStart = (j: number) => KIT_CLICK + 5 + j * KIT_CHILD_STAGGER;

// ---------------------------------------------------------------------------
// Channel rack
// ---------------------------------------------------------------------------
export type Drag = {grab: number; drop: number; label: string; channel: number};
export const DRAGS: Drag[] = [
  {grab: 278, drop: 310, label: 'stx Kick 01.wav', channel: 0},
  {grab: 330, drop: 362, label: 'stx Snare 04.wav', channel: 1},
  {grab: 382, drop: 414, label: 'stx Hat 07.wav', channel: 2},
  {grab: 572, drop: 606, label: 'stx 808 Glide.wav', channel: 3},
];

export const CHANNELS = [
  {name: 'Kick', drop: DRAGS[0].drop},
  {name: 'Snare', drop: DRAGS[1].drop},
  {name: 'Hi-Hat', drop: DRAGS[2].drop},
  {name: '808', drop: DRAGS[3].drop},
];

// Step clicks: [channel, step, frame]
export const STEP_CLICKS: Array<[number, number, number]> = [
  [0, 0, 436],
  [0, 10, 454],
  [1, 4, 472],
  [1, 12, 490],
];
// Hi-hat "paint" sweep across even steps
export const HAT_SWEEP = {press: 508, release: 534};
export const HAT_STEPS = [0, 2, 4, 6, 8, 10, 12, 14];
const hatOnFrame = (i: number) =>
  Math.round(HAT_SWEEP.press + (i / 14) * (HAT_SWEEP.release - 2 - HAT_SWEEP.press));

// onFrame for every active step: pattern[channel][step] = frame it turns on
export const PATTERN: Array<Record<number, number>> = [{}, {}, {}];
for (const [ch, step, f] of STEP_CLICKS) PATTERN[ch][step] = f;
for (const s of HAT_STEPS) PATTERN[2][s] = hatOnFrame(s);

// ---------------------------------------------------------------------------
// Piano roll
// ---------------------------------------------------------------------------
export type PrNote = {step: number; len: number; row: number; press: number; release: number};
export const NOTES: PrNote[] = [
  {step: 0, len: 3, row: 12, press: 624, release: 642},
  {step: 4, len: 2, row: 12, press: 654, release: 670},
  {step: 8, len: 2, row: 5, press: 684, release: 700},
  {step: 11, len: 4, row: 9, press: 714, release: 734},
];
export const SLIDE = {noteIndex: 1, click: 746, drawFrom: 748, drawTo: 766};

// ---------------------------------------------------------------------------
// Play
// ---------------------------------------------------------------------------
export const BPM = 140;
export const FRAMES_PER_STEP = (60 * 60) / (BPM * 4); // 6.43 frames per 16th
export const PLAY_CLICK = 816;
export const PLAY_START = PLAY_CLICK + 2;
export const playPos = (frame: number) =>
  frame < PLAY_START ? -1 : ((frame - PLAY_START) / FRAMES_PER_STEP) % 16;

// ---------------------------------------------------------------------------
// Outro
// ---------------------------------------------------------------------------
export const OUTRO = {
  headline: 1000,
  typeFrom: 1018,
  typeTo: 1058,
  button: 1056,
  click: 1094,
};
export const DOWNLOAD_BTN_SCREEN = {x: 540, y: 620, w: 460, h: 124};

// ---------------------------------------------------------------------------
// Callouts
// ---------------------------------------------------------------------------
export const CALLOUTS = {
  browser: {from: 176, to: 286, text: 'Kit-Ordner im Browser', anchor: {x: 316, y: KIT_ROW_CY}},
  rack: {from: 300, to: 534, text: 'Sounds reinziehen & Pattern klicken', anchor: {x: 690, y: 420}},
  piano: {from: 552, to: 790, text: '808 im Piano Roll', anchor: {x: 690, y: 1142}},
  play: {from: 836, to: 956, text: 'Fertig ist der Beat', anchor: {x: 690, y: 420}},
};

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------
export type CamKey = {f: number; s: number; cx: number; cy: number};
const FULL = {s: 1.04, cx: 540, cy: 1040};
export const CAM_KEYS: CamKey[] = [
  {f: 0, ...FULL},
  {f: 140, ...FULL},
  {f: 174, s: 1.85, cx: 300, cy: 640}, // browser
  {f: 262, s: 1.85, cx: 300, cy: 640},
  {f: 294, s: 1.2, cx: 490, cy: 812}, // browser + rack (drag)
  {f: 410, s: 1.2, cx: 490, cy: 812},
  {f: 438, s: 1.46, cx: 690, cy: 570}, // rack
  {f: 540, s: 1.46, cx: 690, cy: 570},
  {f: 572, s: 1.04, cx: 540, cy: 1060}, // browser + piano roll (drag)
  {f: 608, s: 1.04, cx: 540, cy: 1060},
  {f: 632, s: 1.48, cx: 690, cy: 1450}, // piano roll
  {f: 790, s: 1.48, cx: 690, cy: 1450},
  {f: 812, s: 1.5, cx: 400, cy: 560}, // transport
  {f: 822, s: 1.5, cx: 400, cy: 560},
  {f: 856, s: 1.4, cx: 690, cy: 755}, // rack + mixer while playing
  {f: 962, s: 1.4, cx: 690, cy: 755},
  {f: 1014, s: 0.56, cx: 540, cy: 602}, // zoom out for outro
];

// ---------------------------------------------------------------------------
// Cursor (world coordinates unless space === 'screen')
// ---------------------------------------------------------------------------
export type CursorKey = {
  f: number;
  x: number;
  y: number;
  space?: 'world' | 'screen';
  ease?: 'linear' | 'inOut';
};

const kitLabelX = 175;
const rowX = 190;
const noteKeys: CursorKey[] = NOTES.flatMap((n) => [
  {f: n.press - 1, x: prStepX(n.step) + 12, y: prRowCY(n.row)},
  {f: n.press + 2, x: prStepX(n.step) + 12, y: prRowCY(n.row)},
  {f: n.release - 2, x: prStepX(n.step + n.len) - 2, y: prRowCY(n.row)},
  {f: n.release + 2, x: prStepX(n.step + n.len) - 2, y: prRowCY(n.row)},
]);
const slideNote = NOTES[SLIDE.noteIndex];
const playCX = PLAY_BTN.x + PLAY_BTN.w / 2;
const playCY = PLAY_BTN.y + PLAY_BTN.h / 2;

export const CURSOR_KEYS: CursorKey[] = [
  {f: 0, x: 560, y: 1010},
  {f: CURSOR_IN, x: 560, y: 1010},
  {f: KIT_CLICK - 6, x: kitLabelX, y: KIT_ROW_CY},
  {f: KIT_CLICK + 26, x: kitLabelX, y: KIT_ROW_CY},
  {f: 216, x: rowX, y: browserChildCenterY(0)}, // 808s
  {f: 238, x: rowX, y: browserChildCenterY(3)}, // Hi-Hats
  {f: 256, x: rowX, y: browserChildCenterY(5)}, // Loops
  {f: 274, x: rowX, y: browserChildCenterY(1)}, // Kicks
  {f: DRAGS[0].grab + 2, x: rowX, y: browserChildCenterY(1)},
  {f: DRAGS[0].drop - 2, x: 640, y: rackRowCY(0)},
  {f: DRAGS[0].drop + 2, x: 640, y: rackRowCY(0)},
  {f: DRAGS[1].grab - 2, x: rowX, y: browserChildCenterY(2)}, // Snares
  {f: DRAGS[1].grab + 2, x: rowX, y: browserChildCenterY(2)},
  {f: DRAGS[1].drop - 2, x: 640, y: rackRowCY(1)},
  {f: DRAGS[1].drop + 2, x: 640, y: rackRowCY(1)},
  {f: DRAGS[2].grab - 2, x: rowX, y: browserChildCenterY(3)}, // Hi-Hats
  {f: DRAGS[2].grab + 2, x: rowX, y: browserChildCenterY(3)},
  {f: DRAGS[2].drop - 2, x: 640, y: rackRowCY(2)},
  {f: DRAGS[2].drop + 4, x: 640, y: rackRowCY(2)},
  ...STEP_CLICKS.flatMap(([ch, step, f]) => [
    {f: f - 3, x: stepCX(step), y: rackRowCY(ch) + 6},
    {f: f + 3, x: stepCX(step), y: rackRowCY(ch) + 6},
  ]),
  {f: HAT_SWEEP.press - 1, x: stepCX(0), y: rackRowCY(2) + 6},
  {f: HAT_SWEEP.press + 1, x: stepCX(0), y: rackRowCY(2) + 6},
  {f: HAT_SWEEP.release - 2, x: stepCX(14) + 4, y: rackRowCY(2) + 6, ease: 'linear'},
  {f: HAT_SWEEP.release + 4, x: stepCX(14) + 4, y: rackRowCY(2) + 6},
  {f: DRAGS[3].grab - 2, x: rowX, y: browserChildCenterY(0)}, // 808s
  {f: DRAGS[3].grab + 2, x: rowX, y: browserChildCenterY(0)},
  {f: DRAGS[3].drop - 2, x: 720, y: 1450},
  {f: DRAGS[3].drop + 4, x: 720, y: 1450},
  ...noteKeys,
  {f: SLIDE.click - 3, x: prStepX(slideNote.step) + 40, y: prRowCY(slideNote.row)},
  {f: SLIDE.click + 6, x: prStepX(slideNote.step) + 40, y: prRowCY(slideNote.row)},
  {f: 784, x: prStepX(slideNote.step) + 40, y: prRowCY(slideNote.row) - 20},
  {f: PLAY_CLICK - 4, x: playCX, y: playCY},
  {f: PLAY_CLICK + 8, x: playCX, y: playCY},
  {f: 862, x: 610, y: 838},
  {f: 990, x: 610, y: 838},
  {f: 1040, x: 800, y: 900, space: 'screen'},
  {f: OUTRO.click - 4, x: DOWNLOAD_BTN_SCREEN.x + 165, y: DOWNLOAD_BTN_SCREEN.y + 22, space: 'screen'},
  {f: 1200, x: DOWNLOAD_BTN_SCREEN.x + 165, y: DOWNLOAD_BTN_SCREEN.y + 22, space: 'screen'},
];

// Mouse-down events (click ripple + pressed cursor). `release` makes it a hold/drag.
export type Press = {f: number; release?: number; color?: string};
export const PRESSES: Press[] = [
  {f: KIT_CLICK},
  ...DRAGS.map((d) => ({f: d.grab, release: d.drop})),
  ...STEP_CLICKS.map(([, , f]) => ({f})),
  {f: HAT_SWEEP.press, release: HAT_SWEEP.release},
  ...NOTES.map((n) => ({f: n.press, release: n.release})),
  {f: SLIDE.click},
  {f: PLAY_CLICK},
  {f: OUTRO.click, color: '#FFFFFF'},
];
