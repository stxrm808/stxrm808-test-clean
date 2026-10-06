import React from 'react';
import {Composition} from 'remotion';
import {DrumkitDemo} from './DrumkitDemo';
import {DURATION, FPS, H, W} from './layout';
import {loadFonts} from './fonts';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <Composition id="DrumkitDemo" component={DrumkitDemo} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
