/* ============================================================
   DNA PLUGINS — STUDIO MONITOR BURN ANIMATION
   Scroll-driven: dead silent → peak power → cabinet on fire
   Requires: GSAP + ScrollTrigger (already on page)
   ============================================================ */

'use strict';

(function initSpeakerAnimation() {
  const section = document.getElementById('speakerAnim');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Canvas setup ────────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.className = 'speaker-canvas';
  section.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let progress = 0;   // 0 = standby, 1 = fully burning
  let raf = null;

  // Particle pools
  const fire   = [];
  const smoke  = [];
  const sparks = [];

  /* ── Resize ──────────────────────────────────────────────── */
  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── Scroll driver (GSAP) or auto-cycle fallback ─────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: 1.8,
        onUpdate: (self) => { progress = self.progress; },
      },
    });
  } else {
    // Auto-cycle: 0 → 1 → 0 over ~10 s so the full animation is always visible
    let t = 0;
    setInterval(() => {
      t += 0.003;
      progress = Math.abs(Math.sin(t * Math.PI));
    }, 16);
  }

  /* ── Particle spawners ───────────────────────────────────── */
  function spawnFire(x, y, intensity) {
    if (fire.length > 180) return;
    fire.push({
      x, y,
      vx: (Math.random() - 0.5) * 2.8 * intensity,
      vy: -(1.4 + Math.random() * 3.2) * intensity,
      life: 1,
      decay: 0.014 + Math.random() * 0.014,
      size: 4 + Math.random() * 12 * intensity,
    });
  }

  function spawnSmoke(x, y, intensity) {
    if (smoke.length > 50) return;
    smoke.push({
      x, y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.25 + Math.random() * 0.45) * intensity,
      life: 1,
      decay: 0.004 + Math.random() * 0.004,
      size: 10 + Math.random() * 18,
    });
  }

  function spawnSpark(x, y) {
    if (sparks.length > 70) return;
    const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI;
    const speed = 3 + Math.random() * 6;
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.03 + Math.random() * 0.04,
      size: 1.5 + Math.random() * 2.5,
    });
  }

  /* ── Rounded rect path helper ────────────────────────────── */
  function rRect(x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h,     x, y + h - r,     r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y,         x + r, y,         r);
    ctx.closePath();
  }

  /* ── Draw one studio monitor  (centered at cx, cy) ──────── */
  function drawMonitor(cx, cy, p, side) {
    const now  = Date.now();
    const CW   = Math.max(100, Math.min(155, W * 0.175)); // cabinet width
    const CH   = CW * 1.52;                                // cabinet height
    const half = CW / 2;

    /* cabinet shake increases quadratically with intensity */
    let sx = 0, sy = 0;
    if (p > 0.52) {
      const sh = ((p - 0.52) / 0.48) ** 1.5;
      sx = Math.sin(now * 0.031 * (1 + sh * 12)) * sh * 7;
      sy = Math.cos(now * 0.027 * (1 + sh * 9))  * sh * 4.5;
    }

    ctx.save();
    ctx.translate(cx + sx, cy + sy);

    /* ── Outer heat glow ───────────────────────────────────── */
    if (p > 0.22) {
      const gi = (p - 0.22) / 0.78;
      const gr = ctx.createRadialGradient(0, 0, CW * 0.2, 0, 0, CW * 1.6);
      if (p < 0.62) {
        gr.addColorStop(0, `rgba(232,160,32,${gi * 0.22})`);
        gr.addColorStop(1, 'rgba(232,160,32,0)');
      } else {
        const fi = (p - 0.62) / 0.38;
        gr.addColorStop(0, `rgba(255,${Math.round(100 - fi * 90)},0,${gi * 0.45})`);
        gr.addColorStop(0.55, `rgba(220,60,0,${gi * 0.12})`);
        gr.addColorStop(1, 'rgba(180,0,0,0)');
      }
      ctx.beginPath();
      ctx.rect(-CW * 1.1, -CH * 0.8, CW * 2.2, CH * 1.6);
      ctx.fillStyle = gr;
      ctx.fill();
    }

    /* ── Cabinet body ──────────────────────────────────────── */
    ctx.beginPath();
    rRect(-half, -CH / 2, CW, CH, 10);
    const bg = ctx.createLinearGradient(-half, -CH / 2, half, CH / 2);
    bg.addColorStop(0, '#1d1d1d');
    bg.addColorStop(0.45, '#141414');
    bg.addColorStop(1, '#0c0c0c');
    ctx.fillStyle = bg;
    ctx.fill();

    /* cabinet border — turns red when burning */
    const borderGlow = p > 0.62 ? (p - 0.62) / 0.38 : 0;
    ctx.strokeStyle = borderGlow > 0
      ? `rgba(255,${Math.round(70 - borderGlow * 60)},0,${borderGlow * 0.95})`
      : 'rgba(48,48,48,0.75)';
    ctx.lineWidth = borderGlow > 0 ? 2 + borderGlow * 1.5 : 1.2;
    ctx.stroke();

    /* inner baffle panel */
    const bOff = 9;
    ctx.beginPath();
    rRect(-half + bOff, -CH / 2 + bOff, CW - bOff * 2, CH - bOff * 2, 5);
    ctx.fillStyle = '#0e0e0e';
    ctx.fill();

    /* ── Tweeter (upper) ───────────────────────────────────── */
    const twY  = -CH * 0.21;
    const twR  = CW * 0.1;
    ctx.beginPath();
    ctx.arc(0, twY, twR + 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, twY, twR, 0, Math.PI * 2);
    const twg = ctx.createRadialGradient(-twR * 0.3, twY - twR * 0.3, 0, 0, twY, twR);
    twg.addColorStop(0, '#3e3e3e');
    twg.addColorStop(1, '#101010');
    ctx.fillStyle = twg;
    ctx.fill();
    /* tweeter glow when hot */
    if (p > 0.68) {
      const ti = (p - 0.68) / 0.32;
      ctx.beginPath();
      ctx.arc(0, twY, twR * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${Math.round(160 - ti * 155)},0,${ti * 0.55})`;
      ctx.fill();
    }

    /* ── Woofer (lower) ────────────────────────────────────── */
    const wfY = CH * 0.115;
    const wfR = CW * 0.37;

    /* surround rings */
    for (let r = 4; r >= 0; r--) {
      ctx.beginPath();
      ctx.arc(0, wfY, wfR - r * (wfR * 0.065), 0, Math.PI * 2);
      ctx.strokeStyle = r === 0 ? '#252525' : '#181818';
      ctx.lineWidth = wfR * 0.058;
      ctx.stroke();
    }

    /* cone pumping — frequency & amplitude driven by progress */
    const freq  = 0.005 + p * 0.022;
    const amp   = p * wfR * 0.14;
    const pump  = Math.sin(now * freq) * amp;

    /* cone fill gradient shifts with pump (simulates 3-D movement) */
    const coneR = wfR * 0.87;
    ctx.beginPath();
    ctx.arc(0, wfY, coneR, 0, Math.PI * 2);
    const cg = ctx.createRadialGradient(
      pump * 0.28, wfY + pump * 0.18, 0,
      0, wfY, coneR
    );
    if (p < 0.62) {
      cg.addColorStop(0, '#2c2c2c');
      cg.addColorStop(0.55, '#1a1a1a');
      cg.addColorStop(1, '#0d0d0d');
    } else {
      const fi = (p - 0.62) / 0.38;
      cg.addColorStop(0, `rgba(255,${Math.round(160 - fi * 155)},0,1)`);
      cg.addColorStop(0.4, `rgba(185,${Math.round(55 - fi * 50)},0,1)`);
      cg.addColorStop(1, '#080808');
    }
    ctx.fillStyle = cg;
    ctx.fill();

    /* spider arm detail lines on cone */
    if (p < 0.82) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, wfY, coneR, 0, Math.PI * 2);
      ctx.clip();
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, wfY);
        ctx.lineTo(Math.cos(ang) * coneR, wfY + Math.sin(ang) * coneR);
        ctx.strokeStyle = 'rgba(0,0,0,0.28)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    }

    /* dust cap */
    const dcR = wfR * 0.22;
    ctx.beginPath();
    ctx.arc(0, wfY, dcR, 0, Math.PI * 2);
    ctx.fillStyle = p > 0.68
      ? `rgba(255,${Math.round(80 - ((p - 0.68) / 0.32) * 75)},0,1)`
      : '#1e1e1e';
    ctx.fill();

    /* ── Bass-reflex port (bottom of baffle) ───────────────── */
    const phY = CH / 2 - 28;
    ctx.beginPath();
    rRect(-CW * 0.19, phY - 9, CW * 0.38, 15, 5);
    ctx.fillStyle = '#050505';
    ctx.fill();
    ctx.strokeStyle = '#1e1e1e';
    ctx.lineWidth = 1;
    ctx.stroke();
    /* port breathing glow */
    if (p > 0.72) {
      const pi2 = (p - 0.72) / 0.28;
      const pg = ctx.createLinearGradient(0, phY - 36, 0, phY);
      pg.addColorStop(0, 'rgba(0,0,0,0)');
      pg.addColorStop(1, `rgba(255,60,0,${pi2 * 0.55})`);
      ctx.fillStyle = pg;
      ctx.fillRect(-CW * 0.19, phY - 36, CW * 0.38, 36);
    }

    /* ── LED power indicator ───────────────────────────────── */
    const ledX = (side === 'left') ? -half + 18 : half - 22;
    const ledY = -CH / 2 + 20;

    let ledR2, ledColor;
    if (p < 0.09) {
      /* boot blink */
      ledColor = Math.sin(Date.now() * 0.01) > 0 ? 'rgba(0,210,75,0.9)' : 'rgba(0,0,0,0.3)';
    } else if (p < 0.38) {
      ledColor = 'rgba(0,220,75,0.95)';     // solid green
    } else if (p < 0.58) {
      const t2 = (p - 0.38) / 0.2;
      ledColor = `rgba(${Math.round(200 * t2)},${Math.round(220 - 160 * t2)},0,0.95)`;
    } else if (p < 0.74) {
      ledColor = 'rgba(255,110,0,0.95)';    // amber
    } else {
      /* red flicker */
      ledColor = Math.random() > 0.14 ? 'rgba(255,18,0,1)' : 'rgba(60,0,0,0.4)';
    }

    /* LED glow halo */
    if (p > 0.38) {
      const haloGi = (p - 0.38) / 0.62;
      const hg = ctx.createRadialGradient(ledX, ledY, 0, ledX, ledY, 14);
      hg.addColorStop(0, ledColor.replace(/[\d.]+\)$/, `${haloGi * 0.6})`));
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(ledX, ledY, 14, 0, Math.PI * 2);
      ctx.fillStyle = hg;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(ledX, ledY, 4, 0, Math.PI * 2);
    ctx.fillStyle = ledColor;
    ctx.fill();

    /* ── Brand mark ────────────────────────────────────────── */
    const fontSize = Math.max(7, CW * 0.066);
    ctx.font = `600 ${fontSize}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = p > 0.68
      ? `rgba(255,60,0,${((p - 0.68) / 0.32) * 0.7})`
      : 'rgba(75,75,75,0.55)';
    ctx.fillText('DNA', 0, -CH / 2 + 36);

    ctx.restore();

    /* ── Spawn particles from this monitor ───────────────────
       (in world space so shake doesn't affect particle origin) */
    const wx   = cx + sx;
    const wy   = cy + sy;
    const wwfY = wy + CH * 0.115;

    /* fire from woofer cone */
    if (p > 0.58 && Math.random() < ((p - 0.58) / 0.42) * 0.7) {
      spawnFire(
        wx + (Math.random() - 0.5) * wfR * 1.1,
        wwfY - wfR * 0.25,
        (p - 0.58) / 0.42
      );
    }
    /* fire from port hole */
    if (p > 0.76 && Math.random() < ((p - 0.76) / 0.24) * 0.35) {
      spawnFire(
        wx + (Math.random() - 0.5) * 18,
        wy + CH / 2 - 28,
        (p - 0.76) / 0.24 * 0.7
      );
    }
    /* smoke from top of cabinet */
    if (p > 0.48 && Math.random() < ((p - 0.48) / 0.52) * 0.18) {
      spawnSmoke(
        wx + (Math.random() - 0.5) * CW * 0.5,
        wy - CH / 2 - 8,
        (p - 0.48) / 0.52
      );
    }
    /* sparks */
    if (p > 0.78 && Math.random() < ((p - 0.78) / 0.22) * 0.32) {
      spawnSpark(
        wx + (Math.random() - 0.5) * wfR,
        wwfY - wfR * 0.45
      );
    }
  }

  /* ── Draw connecting cable between the two monitors ──────── */
  function drawCable(lx, rx, baseY, p) {
    const cabY = baseY + Math.min(H * 0.19, 130);
    ctx.beginPath();
    ctx.moveTo(lx, cabY);
    ctx.bezierCurveTo(
      lx + 55, cabY + 28 + p * 18,
      rx - 55, cabY + 28 + p * 18,
      rx, cabY
    );

    if (p < 0.58) {
      ctx.strokeStyle = `rgba(38,38,38,${0.7 + p * 0.3})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 0;
    } else if (p < 0.8) {
      const ci = (p - 0.58) / 0.22;
      ctx.strokeStyle = `rgba(255,${Math.round(80 - ci * 70)},0,0.9)`;
      ctx.lineWidth = 3 + ci * 1.5;
      ctx.shadowColor = 'rgba(255,80,0,0.6)';
      ctx.shadowBlur = 10 * ci;
    } else {
      /* cable fully glowing + flicker */
      ctx.strokeStyle = Math.random() > 0.08
        ? 'rgba(255,40,0,0.95)'
        : 'rgba(255,200,0,0.9)';
      ctx.lineWidth = 4.5;
      ctx.shadowColor = 'rgba(255,60,0,0.9)';
      ctx.shadowBlur = 18;
    }
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /* ── Waveform bars at bottom of canvas ───────────────────── */
  function drawWaveform(p) {
    const count  = 54;
    const totalW = Math.min(W * 0.62, 520);
    const startX = (W - totalW) / 2;
    const bW     = totalW / count - 1.8;
    const baseY  = H * 0.86;
    const maxH   = 16 + p * 95;
    const t      = Date.now();
    const speed  = 0.0018 + p * 0.013;

    for (let i = 0; i < count; i++) {
      const phi = (i / count) * Math.PI * 2;
      const h = Math.abs(
        Math.sin(phi * 2.6 + t * speed)        * 0.44 +
        Math.sin(phi * 4.5 - t * speed * 1.7)  * 0.32 +
        Math.sin(phi * 1.2 + t * speed * 0.75) * 0.24
      ) * maxH * (0.25 + p * 0.75);

      const bx = startX + i * (bW + 1.8);
      const by = baseY  - h / 2;

      let r, g, b, a;
      if (p < 0.42) {
        r = 232; g = 160; b = 32; a = 0.45 + p * 0.55;
      } else if (p < 0.72) {
        const t2 = (p - 0.42) / 0.30;
        r = 255; g = Math.round(160 - t2 * 140); b = 0; a = 0.85;
      } else {
        const t2 = (p - 0.72) / 0.28;
        r = 255; g = Math.round(20 - t2 * 20); b = 0; a = 1;
      }
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.fillRect(bx, by, bW, h);
    }
  }

  /* ── Draw all particle pools ─────────────────────────────── */
  function drawParticles() {
    /* Smoke (large, behind fire) */
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.x += p.vx;
      p.y += p.vy;
      p.size += 0.35;
      p.life -= p.decay;
      if (p.life <= 0) { smoke.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(55,55,55,${p.life * 0.14})`;
      ctx.fill();
    }

    /* Fire */
    for (let i = fire.length - 1; i >= 0; i--) {
      const p = fire[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy *= 0.972;
      p.vx *= 0.983;
      p.life -= p.decay;
      p.size *= 0.962;
      if (p.life <= 0 || p.size < 0.6) { fire.splice(i, 1); continue; }

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      const a = p.life;
      g.addColorStop(0,    `rgba(255,255,${Math.round(200 * p.life)},${a})`);
      g.addColorStop(0.3,  `rgba(255,${Math.round(140 * p.life)},0,${a * 0.85})`);
      g.addColorStop(0.65, `rgba(220,28,0,${a * 0.45})`);
      g.addColorStop(1,    'rgba(120,0,0,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    /* Sparks */
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.12;
      p.life -= p.decay;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${Math.round(190 + 65 * p.life)},0,${p.life})`;
      ctx.fill();
    }
  }

  /* ── HUD status label ─────────────────────────────────────── */
  function drawStatus(p) {
    let label = '';
    if      (p < 0.07) label = '';
    else if (p < 0.14) label = 'POWERING ON';
    else if (p < 0.44) label = 'SIGNAL ACTIVE';
    else if (p < 0.64) label = 'SIGNAL OVERLOAD';
    else if (p < 0.78) label = '⚠  CRITICAL LEVEL';
    else               label = 'SYSTEM FAILURE';

    if (!label) return;

    const size = Math.max(9, Math.min(13, W * 0.012));
    ctx.font = `600 ${size}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';

    if (p > 0.78) {
      const flicker = Math.random() > 0.1 ? 1 : 0;
      ctx.shadowColor = 'rgba(255,0,0,0.9)';
      ctx.shadowBlur  = 18;
      ctx.fillStyle   = `rgba(255,18,0,${flicker})`;
    } else if (p > 0.64) {
      ctx.fillStyle = 'rgba(255,95,0,0.9)';
    } else if (p > 0.44) {
      ctx.fillStyle = 'rgba(255,145,0,0.85)';
    } else {
      ctx.fillStyle = `rgba(232,160,32,${0.45 + p * 0.55})`;
    }

    ctx.fillText(label, W / 2, H - 18);
    ctx.shadowBlur = 0;
  }

  /* ── Main render loop ────────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Background */
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);

    /* Red atmosphere when burning */
    if (progress > 0.65) {
      const ri = (progress - 0.65) / 0.35;
      ctx.fillStyle = `rgba(160,0,0,${ri * 0.11})`;
      ctx.fillRect(0, 0, W, H);
    }

    /* Subtle floor gradient */
    const fg = ctx.createLinearGradient(0, H * 0.72, 0, H);
    fg.addColorStop(0, 'rgba(0,0,0,0)');
    fg.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, H * 0.72, W, H * 0.28);

    /* Speaker positions — responsive */
    const monY   = H * 0.41;
    const spread = Math.min(W * 0.215, 175);
    const lx     = W / 2 - spread;
    const rx     = W / 2 + spread;

    /* Draw order: smoke (behind) → cable → monitors → fire/sparks */
    drawParticles(); // smoke phase only, the rest drawn after monitors below

    drawCable(lx, rx, monY, progress);
    drawMonitor(lx, monY, progress, 'left');
    drawMonitor(rx, monY, progress, 'right');

    /* Fire & sparks re-drawn here (on top of monitors) — we handle
       layering by having drawParticles draw smoke first */

    /* Waveform */
    drawWaveform(progress);

    /* Vignette */
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, progress > 0.68
      ? `rgba(70,0,0,${((progress - 0.68) / 0.32) * 0.55 + 0.28})`
      : 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    /* Status */
    drawStatus(progress);

    raf = requestAnimationFrame(draw);
  }

  draw();

  /* Pause when tab hidden for performance */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf) {
      draw();
    }
  });

})();
