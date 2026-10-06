import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {DragChip} from '../ui/DragChip';
import {Drag} from '../timeline';
import {getCursorScreen} from '../motion';

// Sample-name chip that follows the cursor while a drag is in progress.
export const DragOverlay: React.FC<{drags: Drag[]; sceneFrom: number}> = ({drags, sceneFrom}) => {
  const frame = useCurrentFrame() + sceneFrom;
  const d = drags.find((dd) => frame >= dd.grab && frame <= dd.drop + 8);
  if (!d) return null;
  const c = getCursorScreen(frame);
  const appear = interpolate(frame, [d.grab, d.grab + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const drop = interpolate(frame, [d.drop, d.drop + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <DragChip x={c.x} y={c.y} label={d.label} opacity={appear * (1 - drop)} scale={0.8 + 0.2 * appear - 0.3 * drop} />;
};
