/* ============================================================
   stxrm808 — MOUSE INTERACTIONS
   1. Custom fire cursor + particle trail
   2. Magnetic buttons
   3. 3D card tilt on kit cards
   4. Hero parallax on mouse move
   ============================================================ */

'use strict';

(function initInteractions() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Touch devices — skip
  if (window.matchMedia('(hover: none)').matches) return;

  /* ── 1. CUSTOM CURSOR + FIRE TRAIL ─────────────────────── */
  const cursor    = document.createElement('div');
  const cursorDot = document.createElement('div');
  cursor.id    = 'customCursor';
  cursorDot.id = 'customCursorDot';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let mouseX = -200, mouseY = -200;
  let curX   = -200, curY   = -200;

  /* mouseX / mouseY updated in combined handler below */

  // Smooth cursor follow
  function animateCursor() {
    const ease = 0.14;
    curX += (mouseX - curX) * ease;
    curY += (mouseY - curY) * ease;
    cursor.style.transform    = `translate(${curX - 20}px, ${curY - 20}px)`;
    cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Fire trail particles
  const trailCanvas = document.createElement('canvas');
  trailCanvas.id = 'trailCanvas';
  trailCanvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;';
  document.body.appendChild(trailCanvas);
  const tctx = trailCanvas.getContext('2d');

  function resizeTrail() {
    trailCanvas.width  = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeTrail();
  window.addEventListener('resize', resizeTrail, { passive: true });

  const trailParticles = [];

  const finderWindow = document.querySelector('body.page-kit-flames .finder-window');

  function isOverFinder(clientX, clientY) {
    if (!finderWindow) return false;
    const r = finderWindow.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }

  let nativeCursorInFinder = false;

  function enableNativeCursorInFinder() {
    if (nativeCursorInFinder) return;
    nativeCursorInFinder = true;
    document.body.classList.add('native-cursor-finder');
    document.body.style.cursor = '';
    cursor.style.visibility = 'hidden';
    cursorDot.style.visibility = 'hidden';
    trailCanvas.style.visibility = 'hidden';
    trailParticles.length = 0;
    tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  }

  function disableNativeCursorInFinder() {
    if (!nativeCursorInFinder) return;
    nativeCursorInFinder = false;
    document.body.classList.remove('native-cursor-finder');
    document.body.style.cursor = 'none';
    cursor.style.visibility = '';
    cursorDot.style.visibility = '';
    trailCanvas.style.visibility = '';
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (finderWindow) {
      const over = isOverFinder(e.clientX, e.clientY);
      if (over && !nativeCursorInFinder) enableNativeCursorInFinder();
      if (!over && nativeCursorInFinder) disableNativeCursorInFinder();
    }

    if (nativeCursorInFinder) return;

    for (let i = 0; i < 2; i++) {
      trailParticles.push({
        x:     e.clientX + (Math.random() - 0.5) * 8,
        y:     e.clientY + (Math.random() - 0.5) * 8,
        vx:    (Math.random() - 0.5) * 1.2,
        vy:    -(Math.random() * 2 + 0.5),
        life:  1,
        decay: 0.06 + Math.random() * 0.06,
        size:  2 + Math.random() * 4,
      });
    }
  });

  function drawTrail() {
    if (nativeCursorInFinder) {
      tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      requestAnimationFrame(drawTrail);
      return;
    }
    tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy *= 0.96;
      p.life -= p.decay;
      p.size *= 0.93;
      if (p.life <= 0 || p.size < 0.3) { trailParticles.splice(i, 1); continue; }

      const g = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      g.addColorStop(0,   `rgba(255,240,${Math.round(100 * p.life)},${p.life})`);
      g.addColorStop(0.4, `rgba(255,${Math.round(100 * p.life)},0,${p.life * 0.7})`);
      g.addColorStop(1,   'rgba(200,0,0,0)');
      tctx.beginPath();
      tctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      tctx.fillStyle = g;
      tctx.fill();
    }
    // Cap particles
    if (trailParticles.length > 120) trailParticles.splice(0, trailParticles.length - 120);
    requestAnimationFrame(drawTrail);
  }
  drawTrail();

  // Cursor hover states — scale up on interactive elements
  const hoverTargets = 'a, button, .kit-card, .audio-player__play, .btn';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });

  // Hide default cursor
  document.body.style.cursor = 'none';
  document.querySelectorAll('a, button, input, select, textarea, [role="button"]').forEach(el => {
    el.style.cursor = 'none';
  });

  /* ── 2. MAGNETIC BUTTONS ────────────────────────────────── */
  document.querySelectorAll('.btn--fire, .btn--nav, .btn--primary').forEach(btn => {
    if (btn.closest('#navMobile')) return;
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = e.clientX - cx;
      const dy     = e.clientY - cy;
      const dist   = Math.hypot(dx, dy);
      const range  = 80;
      if (dist < range) {
        const pull = (1 - dist / range) * 0.35;
        btn.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      btn.style.transform  = '';
      setTimeout(() => { btn.style.transition = ''; }, 400);
    });
  });

  /* ── 3. 3D CARD TILT ─────────────────────────────────────── */
  document.querySelectorAll('.kit-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const cx    = rect.width  / 2;
      const cy    = rect.height / 2;
      const rotX  = ((y - cy) / cy) * -8;  // max ±8deg
      const rotY  = ((x - cx) / cx) *  8;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;

      // Dynamic light spot
      const glow = card.querySelector('.kit-card__hover-glow');
      if (glow) {
        const pctX = (x / rect.width)  * 100;
        const pctY = (y / rect.height) * 100;
        glow.style.background = `radial-gradient(ellipse at ${pctX}% ${pctY}%, rgba(255,68,0,0.18) 0%, transparent 60%)`;
        glow.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      card.style.transform  = '';
      setTimeout(() => { card.style.transition = ''; }, 500);
      const glow = card.querySelector('.kit-card__hover-glow');
      if (glow) glow.style.opacity = '0';
    });
  });

  /* ── 4. HERO PARALLAX ON MOUSE MOVE ─────────────────────── */
  const hero        = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero__content');
  const heroCanvas  = document.getElementById('heroCanvas');

  if (hero && heroContent) {
    hero.addEventListener('mousemove', (e) => {
      const rect  = hero.getBoundingClientRect();
      const x     = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
      const y     = (e.clientY - rect.top)  / rect.height - 0.5;

      heroContent.style.transform = `translate(${x * 12}px, ${y * 8}px)`;
      if (heroCanvas) {
        heroCanvas.style.transform = `translate(${x * -20}px, ${y * -14}px)`;
      }
    });

    hero.addEventListener('mouseleave', () => {
      heroContent.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
      heroContent.style.transform  = '';
      if (heroCanvas) {
        heroCanvas.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        heroCanvas.style.transform  = '';
      }
      setTimeout(() => {
        heroContent.style.transition = '';
        if (heroCanvas) heroCanvas.style.transition = '';
      }, 800);
    });
  }

  /* ── 5. PRODUCER CARD — TILT + GLOW + FIRE PARTICLES ────── */
  document.querySelectorAll('.fp-card').forEach(card => {
    const glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;opacity:0;pointer-events:none;z-index:4;transition:opacity 0.25s;border-radius:inherit;';
    card.appendChild(glow);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;
      const rotX = ((y - cy) / cy) * -10;
      const rotY = ((x - cx) / cx) *  10;

      // 3D tilt
      card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;

      // Moving fire spotlight
      const pctX = (x / rect.width)  * 100;
      const pctY = (y / rect.height) * 100;
      glow.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255,68,0,0.38) 0%, rgba(255,68,0,0.08) 35%, transparent 65%)`;
      glow.style.opacity = '1';

      if (nativeCursorInFinder) return;
      // Fire particles burst from cursor position on card
      if (Math.random() > 0.55) {
        trailParticles.push({
          x:     e.clientX + (Math.random() - 0.5) * 6,
          y:     e.clientY + (Math.random() - 0.5) * 6,
          vx:    (Math.random() - 0.5) * 1.8,
          vy:    -(Math.random() * 2.5 + 1),
          life:  0.9,
          decay: 0.045 + Math.random() * 0.04,
          size:  2.5 + Math.random() * 4,
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      card.style.transform  = '';
      glow.style.opacity    = '0';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  });

  /* ── 6. CLICK BURST ─────────────────────────────────────── */
  document.addEventListener('click', (e) => {
    if (finderWindow && isOverFinder(e.clientX, e.clientY)) return;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      trailParticles.push({
        x:     e.clientX,
        y:     e.clientY,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 1,
        life:  1,
        decay: 0.04,
        size:  3 + Math.random() * 5,
      });
    }
  });

})();
