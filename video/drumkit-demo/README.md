# stxrm808 Drumkit – Demo-Video (Remotion)

20 s, 1080×1920, 60 fps. Fertiger Render: `out/drumkit_demo.mp4`.

```bash
npm install
npm run studio   # Live-Vorschau
npm run stills   # QA-Standbilder (Frames 60, 220, 420, 660, 880, 1100) -> out/stills/
npm run render   # H.264 -> out/drumkit_demo.mp4
```

## Aufbau
- `src/timeline.ts` – alle Timings (Szenen, Klicks, Drags, Noten, Kamera- und Cursor-Keyframes)
- `src/layout.ts` – Geometrie der DAW in Welt-Koordinaten
- `src/motion.ts` – Kamera (Scale/Translate), Cursor-Pfad, Springs
- `src/audio.ts` – Meter-Pegel synchron zu 140 BPM
- `src/daw/` – DAW-Panels (Toolbar, Browser, Channel Rack, Mixer, Piano Roll)
- `src/ui/` – wiederverwendbare Bausteine (Panel, Step, Note, Meter, Cursor, Ripple, Callout, DragChip)
- `src/scenes/` – je Szene eine Komponente (Intro, Browser, Channel Rack, Piano Roll, Play, Outro)
