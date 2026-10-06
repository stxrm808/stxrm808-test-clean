import React from 'react';
import {CALLOUTS, DRAGS, SCENES} from '../timeline';
import {StepCallout} from './StepCallout';
import {DragOverlay} from './DragOverlay';

// Scene 3 — drag Kick / Snare / Hi-Hat into the channel rack, then click the pattern.
export const ChannelRackScene: React.FC = () => (
  <>
    <DragOverlay drags={DRAGS.slice(0, 3)} sceneFrom={SCENES.rack.from - 30} />
    <StepCallout spec={CALLOUTS.rack} index={2} sceneFrom={SCENES.rack.from - 30} />
  </>
);
