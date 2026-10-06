// Renders preview stills (default: the QA frames) to out/stills/.
// Usage: node scripts/stills.mjs [frame ...]
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const frames = process.argv.slice(2).map(Number);
const list = frames.length ? frames : [60, 220, 420, 660, 880, 1100];

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'DrumkitDemo'});
for (const frame of list) {
  const output = path.resolve(`out/stills/frame_${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame});
  console.log('rendered', output);
}
