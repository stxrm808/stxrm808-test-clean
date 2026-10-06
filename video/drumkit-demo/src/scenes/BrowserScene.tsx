import React from 'react';
import {CALLOUTS, SCENES} from '../timeline';
import {StepCallout} from './StepCallout';

// Scene 2 — browser: kit folder opens, sub-folders unfold, cursor hovers rows.
// (Folder animation + hover highlight live in <BrowserPanel/>, driven by the timeline.)
export const BrowserScene: React.FC = () => (
  <StepCallout spec={CALLOUTS.browser} index={1} sceneFrom={SCENES.browser.from} />
);
