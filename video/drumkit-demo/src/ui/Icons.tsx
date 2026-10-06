import React from 'react';

export const FolderIcon: React.FC<{color: string; size?: number}> = ({color, size = 26}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 30 24">
    <path d="M1 4 Q1 1 4 1 L11 1 L14 4 L26 4 Q29 4 29 7 L29 20 Q29 23 26 23 L4 23 Q1 23 1 20 Z" fill={color} />
  </svg>
);

export const Chevron: React.FC<{rotate: number; color: string}> = ({rotate, color}) => (
  <svg width={14} height={14} viewBox="0 0 14 14" style={{transform: `rotate(${rotate}deg)`}}>
    <path d="M4 2 L10 7 L4 12" stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PlayIcon: React.FC<{color: string; size?: number}> = ({color, size = 26}) => (
  <svg width={size} height={size} viewBox="0 0 26 26">
    <path d="M6 3 L22 13 L6 23 Z" fill={color} strokeLinejoin="round" />
  </svg>
);

export const DownloadIcon: React.FC<{color: string; size?: number}> = ({color, size = 40}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M20 5 L20 25 M11 17 L20 26 L29 17" stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 29 L7 34 L33 34 L33 29" stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
