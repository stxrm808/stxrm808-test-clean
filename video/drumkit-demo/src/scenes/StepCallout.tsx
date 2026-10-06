import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Callout} from '../ui/Callout';
import {getCam, softSpring, toScreen} from '../motion';

type Spec = {from: number; to: number; text: string; anchor: {x: number; y: number}};

// Shared helper for scenes: a callout whose arrow follows a world anchor through camera moves.
// Expects to be rendered inside a <Sequence from={spec.from}>; frame offsets are re-added.
export const StepCallout: React.FC<{spec: Spec; index: number; sceneFrom: number}> = ({spec, index, sceneFrom}) => {
  const local = useCurrentFrame();
  const frame = local + sceneFrom;
  const pIn = softSpring(frame, spec.from);
  const pOut = softSpring(frame, spec.to - 14);
  const progress = Math.max(0, pIn - pOut);
  const anchor = toScreen(getCam(frame), spec.anchor);
  return <Callout index={index} text={spec.text} anchor={anchor} progress={progress} />;
};
