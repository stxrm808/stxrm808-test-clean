import React from 'react';
import {CALLOUTS, SCENES} from '../timeline';
import {StepCallout} from './StepCallout';

// Scene 5 — hit play: playhead runs, steps blink at 140 BPM, meters move.
export const PlayScene: React.FC = () => (
  <StepCallout spec={CALLOUTS.play} index={4} sceneFrom={SCENES.play.from} />
);
