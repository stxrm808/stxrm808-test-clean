import React from 'react';
import {CALLOUTS, DRAGS, SCENES} from '../timeline';
import {StepCallout} from './StepCallout';
import {DragOverlay} from './DragOverlay';

// Scene 4 — 808 into the piano roll, draw notes, add a slide.
export const PianoRollScene: React.FC = () => (
  <>
    <DragOverlay drags={DRAGS.slice(3)} sceneFrom={SCENES.piano.from} />
    <StepCallout spec={CALLOUTS.piano} index={3} sceneFrom={SCENES.piano.from} />
  </>
);
