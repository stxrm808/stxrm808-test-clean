/* ============================================================
   stxrm808 — MAIN JAVASCRIPT
   GSAP + ScrollTrigger animations, Nav, Audio Players,
   Waveform Bars, Hero Canvas
   ============================================================ */

'use strict';

/* ─── Wait for GSAP to load ─────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initAnimations();
  } else {
    // Fallback: show all content if GSAP fails to load
    document.querySelectorAll('.reveal-item').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
  initNav();
  initNavActive();
  initMobileMenu();
  initAudioPlayers();
  initHeroCanvas();
  initWaveformBars();
  initTrailerSound();
  initFeaturedPlayers();
  initDemosCarousel();
  initDemosDeepLink();
});

/* ─── GSAP SCROLL ANIMATIONS ────────────────────────────── */
function initAnimations() {
  // Set initial states
  gsap.set('.reveal-item', { opacity: 0, y: 32 });

  // Batch all .reveal-item elements with ScrollTrigger
  ScrollTrigger.batch('.reveal-item', {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
      });
    },
    once: true,
    start: 'top 88%',
  });

  // Hero headline — set initial state immediately to avoid FOUC
  const heroLines = document.querySelectorAll('.hero__line');
  if (heroLines.length) {
    gsap.set(heroLines, { y: '105%', opacity: 0 });
    gsap.to(heroLines, {
      y: '0%',
      opacity: 1,
      duration: 1.1,
      stagger: 0.18,
      ease: 'power4.out',
      delay: 0.15,
    });
  }

  // Hero tag, sub, CTAs — set hidden immediately, then animate in
  gsap.set('.hero__tag, .hero__sub, .hero__ctas', { opacity: 0, y: 22 });
  gsap.to('.hero__tag, .hero__sub, .hero__ctas', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.13,
    ease: 'power3.out',
    delay: 0.6,
  });

  // Hero scroll indicator fades in last
  gsap.from('.hero__scroll-indicator', {
    opacity: 0,
    y: 12,
    duration: 1.1,
    delay: 1.5,
    ease: 'power2.out',
  });

  // Kit cards — stagger scale + fade on scroll
  ScrollTrigger.batch('.kit-card', {
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { opacity: 0, y: 48, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    },
    once: true,
    start: 'top 88%',
  });

  // Demo rows — light stagger
  ScrollTrigger.batch('.demo-row', {
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.07, ease: 'power2.out' }
      );
    },
    once: true,
    start: 'top 90%',
  });

  // Identity stats — count-up feel via stagger
  ScrollTrigger.batch('.identity__stat', {
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
      );
    },
    once: true,
    start: 'top 85%',
  });

  // Statement quote — scrub-scale
  const stmnt = document.querySelector('.statement__quote');
  if (stmnt) {
    gsap.fromTo(stmnt,
      { opacity: 0, scale: 0.93 },
      {
        opacity: 1,
        scale: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stmnt,
          start: 'top 82%',
          end: 'top 40%',
          scrub: 1.2,
        },
      }
    );
  }

  // Kits upcoming teaser — subtle horizontal reveal
  const upcoming = document.querySelector('.kits__upcoming-inner');
  if (upcoming) {
    gsap.from(upcoming, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: upcoming,
        start: 'top 90%',
        once: true,
      },
    });
  }

  // Parallax depth on identity heading
  const idHeading = document.querySelector('.identity__heading');
  if (idHeading) {
    gsap.to(idHeading, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: idHeading,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }
}

/* ─── NAVIGATION ────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ─── MOBILE MENU ───────────────────────────────────────── */
function initMobileMenu() {
  const burger    = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('navMobile');
  if (!burger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    mobileMenu.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      burger.focus();
    }
  });

  /* Menü zu bei Wechsel auf Desktop — verhindert body-scroll-lock + Overlay-Reste */
  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches && isOpen) closeMenu();
  });
}

/* ─── AUDIO PLAYERS ─────────────────────────────────────── */
function initAudioPlayers() {
  const players = document.querySelectorAll('.audio-player');
  const activeAudios = new Map();

  players.forEach(player => {
    const playBtn    = player.querySelector('.audio-player__play');
    const playIcon   = player.querySelector('.play-icon');
    const pauseIcon  = player.querySelector('.pause-icon');
    const timeDisplay = player.querySelector('.audio-player__time');
    const src        = player.dataset.src;

    if (!playBtn) return;

    const audio = new Audio();
    audio.preload = 'none';
    // NOTE: demo files in assets/demos/ — will 404 until real files are added
    // The play handler loads the src lazily on first click.

    let isPlaying = false;

    function resetThisPlayer() {
      isPlaying = false;
      playIcon.style.display  = '';
      pauseIcon.style.display = 'none';
      player.classList.remove('is-playing');
    }

    playBtn.addEventListener('click', () => {
      if (!src) return;

      // Pause all other active players
      activeAudios.forEach((otherAudio, otherPlayer) => {
        if (otherPlayer !== player) {
          otherAudio.pause();
          const oPlay  = otherPlayer.querySelector('.play-icon');
          const oPause = otherPlayer.querySelector('.pause-icon');
          if (oPlay)  oPlay.style.display  = '';
          if (oPause) oPause.style.display = 'none';
          otherPlayer.classList.remove('is-playing');
        }
      });

      // Lazy-load audio src on first interaction
      if (!audio.src) {
        audio.src = src;
      }

      if (isPlaying) {
        audio.pause();
        resetThisPlayer();
      } else {
        audio.play().catch(() => {
          // Demo file missing — silent fail
          resetThisPlayer();
        });
        isPlaying = true;
        playIcon.style.display  = 'none';
        pauseIcon.style.display = '';
        player.classList.add('is-playing');
        activeAudios.set(player, audio);
      }
    });

    // Time display update
    audio.addEventListener('timeupdate', () => {
      if (!timeDisplay) return;
      const t    = audio.currentTime;
      const mins = Math.floor(t / 60);
      const secs = Math.floor(t % 60).toString().padStart(2, '0');
      timeDisplay.textContent = `${mins}:${secs}`;
    });

    // Reset when track ends
    audio.addEventListener('ended', () => {
      resetThisPlayer();
      if (timeDisplay) timeDisplay.textContent = '0:00';
      activeAudios.delete(player);
    });
  });
}

/* ─── WAVEFORM BARS (decorative, CSS-animated) ──────────── */
function initWaveformBars() {
  const waveformContainers = document.querySelectorAll('.waveform-bars');

  waveformContainers.forEach(container => {
    const BAR_COUNT = 38;
    const fragment  = document.createDocumentFragment();

    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement('div');
      bar.className = 'waveform-bar';

      // Simulate waveform shape — sine envelope with noise
      const t      = i / BAR_COUNT;
      const sine   = Math.abs(Math.sin(t * Math.PI * 3.5 + i * 0.3));
      const height = 5 + sine * 20 + (Math.random() * 7);
      bar.style.height = `${height}px`;

      // Staggered pulse animation
      const delay    = (i * 0.025).toFixed(3);
      const duration = (0.45 + Math.random() * 0.55).toFixed(2);
      bar.style.animation = `waveformPulse ${duration}s ${delay}s ease-in-out infinite alternate`;

      fragment.appendChild(bar);
    }

    container.appendChild(fragment);
  });

  // Inject keyframes once
  if (!document.getElementById('waveform-keyframes')) {
    const style = document.createElement('style');
    style.id = 'waveform-keyframes';
    style.textContent = `
      @keyframes waveformPulse {
        from { opacity: 0.25; transform: scaleY(0.55); }
        to   { opacity: 1;    transform: scaleY(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .waveform-bar { animation: none !important; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ─── HERO CANVAS — Fire particle network ───────────────── */
function initHeroCanvas() {
  const container = document.getElementById('heroCanvas');
  if (!container) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;position:absolute;inset:0;';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, raf;
  const PARTICLE_COUNT = 55;
  const particles = [];

  function resize() {
    W = canvas.width  = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }

  function createParticle() {
    return {
      x:     Math.random() * (W || 800),
      y:     Math.random() * (H || 600),
      vx:    (Math.random() - 0.5) * 0.38,
      vy:    (Math.random() - 0.5) * 0.38,
      r:     Math.random() * 1.4 + 0.4,
      alpha: Math.random() * 0.55 + 0.15,
      // Random hue: fire orange (0°) to amber (35°)
      hue:   Math.random() * 35,
    };
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connection lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.1;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 68, 0, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw each particle
    particles.forEach(p => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 55%, ${p.alpha})`;
      ctx.fill();
    });

    raf = requestAnimationFrame(draw);
  }

  draw();

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      draw();
    }
  });
}

/* ─── TRAILER SOUND TOGGLE ──────────────────────────────── */
function initTrailerSound() {
  const btn   = document.getElementById('trailerSoundBtn');
  const video = document.querySelector('.kit-trailer__video');
  if (!btn || !video) return;

  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    const isOn = !video.muted;
    btn.classList.toggle('is-on', isOn);
    btn.setAttribute('aria-pressed', String(isOn));
    btn.setAttribute('aria-label', isOn ? 'Turn sound off' : 'Turn sound on');

    // If user unmutes, make sure video is playing
    if (isOn && video.paused) video.play().catch(() => {});
  });

  // Auto-mute again if tab loses focus (avoids surprise sound on return)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !video.muted) {
      video.muted = true;
      btn.classList.remove('is-on');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Sound einschalten');
    }
  });
}

/* ─── #demos deep link (index.html#demos from any page) ─── */
function initDemosDeepLink() {
  const demos = document.getElementById('demos');
  if (!demos) return;

  function navOffsetPx() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 72;
  }

  function scrollDemosIntoView() {
    const pad = 12;
    const y = demos.getBoundingClientRect().top + window.scrollY - navOffsetPx() - pad;
    window.scrollTo({ top: Math.max(0, y), left: 0, behavior: 'auto' });
  }

  function revealDemosRevealItems() {
    const nodes = demos.querySelectorAll('.reveal-item');
    if (typeof gsap !== 'undefined') {
      gsap.set(nodes, { opacity: 1, y: 0 });
    } else {
      nodes.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  function applyDemosLanding() {
    revealDemosRevealItems();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
    scrollDemosIntoView();
    requestAnimationFrame(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
      scrollDemosIntoView();
      const car = document.getElementById('fpDemosCarousel');
      if (car && document.activeElement !== car) {
        try {
          car.focus({ preventScroll: true });
        } catch (e) {
          car.focus();
        }
      }
    });
  }

  function hashIsDemos() {
    return (window.location.hash || '').trim() === '#demos';
  }

  if (!hashIsDemos()) {
    window.addEventListener('hashchange', () => {
      if (!hashIsDemos()) return;
      requestAnimationFrame(applyDemosLanding);
    });
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(applyDemosLanding);
  });

  window.addEventListener(
    'load',
    () => {
      if (!hashIsDemos()) return;
      applyDemosLanding();
    },
    { once: true }
  );

  window.addEventListener('hashchange', () => {
    if (!hashIsDemos()) return;
    requestAnimationFrame(applyDemosLanding);
  });
}

/* ─── DEMOS CAROUSEL (home #demos.fp-demos-carousel only) ─ */
function initDemosCarousel() {
  const fpRoot = document.getElementById('fpDemosCarousel');
  if (!fpRoot) return;

  const viewport = document.getElementById('fpCarouselViewport');
  const prevBtn = document.getElementById('fpCarouselPrev');
  const nextBtn = document.getElementById('fpCarouselNext');
  const dots = fpRoot.querySelectorAll('.fp-carousel__dot[data-fp-page]');
  const pages = fpRoot.querySelectorAll('.fp-carousel__page');

  let page = 0;
  const maxPage = pages.length - 1;

  function pauseAllDemosAudio() {
    document.querySelectorAll('#demos audio').forEach((a) => {
      if (!a.paused) a.pause();
    });
    document.querySelectorAll('#demos .fp-card__play-btn').forEach((btn) => {
      btn.classList.remove('is-playing');
      const pi = btn.querySelector('.fp-play-icon');
      const pau = btn.querySelector('.fp-pause-icon');
      if (pi) pi.style.display = '';
      if (pau) pau.style.display = 'none';
    });
  }

  function applyA11y() {
    pages.forEach((el, i) => {
      const hidden = i !== page;
      el.setAttribute('aria-hidden', String(hidden));
      el.querySelectorAll('a, button').forEach((x) => {
        if (hidden) x.setAttribute('tabindex', '-1');
        else x.removeAttribute('tabindex');
      });
    });
    dots.forEach((d, i) => {
      const active = i === page;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', String(active));
      d.setAttribute('tabindex', active ? '0' : '-1');
    });
    if (prevBtn) prevBtn.disabled = page <= 0;
    if (nextBtn) nextBtn.disabled = page >= maxPage;
  }

  function goTo(p) {
    if (p < 0 || p > maxPage || p === page) return;
    pauseAllDemosAudio();
    page = p;
    fpRoot.setAttribute('data-fp-active-page', String(page));
    applyA11y();
  }

  fpRoot.setAttribute('data-fp-active-page', '0');
  applyA11y();

  function equalizeDemoCardHeights() {
    const cards = fpRoot.querySelectorAll('.fp-carousel__page .fp-card');
    if (!cards.length) return;
    cards.forEach((el) => {
      el.style.minHeight = '';
    });
    void viewport?.offsetHeight;
    let maxH = 0;
    cards.forEach((el) => {
      const h = el.getBoundingClientRect().height;
      if (h > maxH) maxH = h;
    });
    if (maxH < 8) return;
    const px = `${Math.ceil(maxH)}px`;
    cards.forEach((el) => {
      el.style.minHeight = px;
    });
  }

  let equalizeTimer = null;
  function scheduleEqualize() {
    clearTimeout(equalizeTimer);
    equalizeTimer = setTimeout(equalizeDemoCardHeights, 48);
  }

  requestAnimationFrame(() => {
    equalizeDemoCardHeights();
    requestAnimationFrame(scheduleEqualize);
  });
  window.addEventListener('load', () => scheduleEqualize(), { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => scheduleEqualize());
  }
  window.addEventListener('resize', scheduleEqualize, { passive: true });
  if (viewport && typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => scheduleEqualize());
    ro.observe(viewport);
  }
  fpRoot.querySelectorAll('.fp-card__avatar-img').forEach((img) => {
    img.addEventListener('load', scheduleEqualize, { passive: true });
    if (img.complete) scheduleEqualize();
  });

  prevBtn?.addEventListener('click', () => goTo(page - 1));
  nextBtn?.addEventListener('click', () => goTo(page + 1));

  dots.forEach((d) => {
    d.addEventListener('click', () => {
      const n = parseInt(d.getAttribute('data-fp-page'), 10);
      if (!isNaN(n)) goTo(n);
    });
  });

  if (maxPage > 0) {
    let touchStartX = null;
    let touchStartY = null;
    viewport?.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      },
      { passive: true }
    );
    viewport?.addEventListener(
      'touchend',
      (e) => {
        if (touchStartX == null || touchStartY == null) return;
        const x = e.changedTouches[0].clientX;
        const y = e.changedTouches[0].clientY;
        const dx = x - touchStartX;
        const dy = y - touchStartY;
        touchStartX = null;
        touchStartY = null;
        if (Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) goTo(page + 1);
        else goTo(page - 1);
      },
      { passive: true }
    );

    fpRoot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(page + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(page - 1);
      }
    });
  }
}

/* ─── FEATURED PRODUCER PLAYERS ────────────────────────── */
function initFeaturedPlayers() {
  const configs = [
    {
      audioId:        'fpAudio',
      playBtnId:      'fpPlayBtn',
      waveformId:     'waveform-thisisyt',
      timelineId:     'fpTimeline',
      timelineFillId: 'fpTimelineFill',
      timelineThumbId:'fpTimelineThumb',
      timeCurrentId:  'fpTimeCurrent',
      timeDurationId: 'fpTimeDuration',
    },
    {
      audioId:        'fp2Audio',
      playBtnId:      'fp2PlayBtn',
      waveformId:     'waveform-stxrm808',
      timelineId:     'fp2Timeline',
      timelineFillId: 'fp2TimelineFill',
      timelineThumbId:'fp2TimelineThumb',
      timeCurrentId:  'fp2TimeCurrent',
      timeDurationId: 'fp2TimeDuration',
    },
    {
      audioId:        'fp3Audio',
      playBtnId:      'fp3PlayBtn',
      waveformId:     'waveform-kavo',
      timelineId:     'fp3Timeline',
      timelineFillId: 'fp3TimelineFill',
      timelineThumbId:'fp3TimelineThumb',
      timeCurrentId:  'fp3TimeCurrent',
      timeDurationId: 'fp3TimeDuration',
    },
    {
      audioId:        'fp4Audio',
      playBtnId:      'fp4PlayBtn',
      waveformId:     'waveform-moji',
      timelineId:     'fp4Timeline',
      timelineFillId: 'fp4TimelineFill',
      timelineThumbId:'fp4TimelineThumb',
      timeCurrentId:  'fp4TimeCurrent',
      timeDurationId: 'fp4TimeDuration',
    },
    {
      audioId:        'fp5Audio',
      playBtnId:      'fp5PlayBtn',
      waveformId:     'waveform-offbeat',
      timelineId:     'fp5Timeline',
      timelineFillId: 'fp5TimelineFill',
      timelineThumbId:'fp5TimelineThumb',
      timeCurrentId:  'fp5TimeCurrent',
      timeDurationId: 'fp5TimeDuration',
    },
  ];

  const allSetPaused = [];

  configs.forEach((cfg, idx) => {
    const audio        = document.getElementById(cfg.audioId);
    const playBtn      = document.getElementById(cfg.playBtnId);
    const waveformEl   = document.getElementById(cfg.waveformId);
    const timeline     = document.getElementById(cfg.timelineId);
    const timelineFill = document.getElementById(cfg.timelineFillId);
    const timelineThumb= document.getElementById(cfg.timelineThumbId);
    const timeCurrent  = document.getElementById(cfg.timeCurrentId);
    const timeDuration = document.getElementById(cfg.timeDurationId);
    if (!audio || !playBtn) return;

    const playIcon  = playBtn.querySelector('.fp-play-icon');
    const pauseIcon = playBtn.querySelector('.fp-pause-icon');

    /* ── Frequency bars ──────────────────────────────────── */
    const BAR_COUNT = 52;
    const bars = [];
    if (waveformEl) {
      waveformEl.innerHTML = '';
      for (let i = 0; i < BAR_COUNT; i++) {
        const b = document.createElement('div');
        b.className = 'fp-freq-bar';
        waveformEl.appendChild(b);
        bars.push(b);
      }
    }

    /* ── Web Audio API ───────────────────────────────────── */
    let audioCtx, analyser, dataArray, rafId;
    const useWebAudio = location.protocol !== 'file:';

    function setupAudio() {
      if (audioCtx || !useWebAudio) return;
      // @ts-ignore
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.82;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      const src = audioCtx.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
    }

    function animateBars() {
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        const step = Math.floor(dataArray.length / BAR_COUNT);
        bars.forEach((bar, i) => {
          const val = dataArray[Math.min(i * step, dataArray.length - 1)] || 0;
          const pct = val / 255;
          bar.style.height     = `${4 + pct * 36}px`;
          bar.style.opacity    = 0.35 + pct * 0.65;
          bar.style.background = `hsl(${28 - pct * 28}, 100%, ${48 + pct * 12}%)`;
        });
      } else {
        // Fallback: simulated waveform when Web Audio not available
        bars.forEach((bar, i) => {
          const t   = (Date.now() / 300 + i * 0.4) % (Math.PI * 2);
          const pct = Math.abs(Math.sin(t)) * 0.7 + 0.15;
          bar.style.height     = `${4 + pct * 32}px`;
          bar.style.opacity    = 0.35 + pct * 0.5;
          bar.style.background = `hsl(${28 - pct * 20}, 100%, ${48 + pct * 10}%)`;
        });
      }
      rafId = requestAnimationFrame(animateBars);
    }

    function idleBars() {
      cancelAnimationFrame(rafId);
      bars.forEach((bar, i) => {
        const t    = i / BAR_COUNT;
        const sine = Math.abs(Math.sin(t * Math.PI * 3.5 + i * 0.4));
        bar.style.height     = `${4 + sine * 10}px`;
        bar.style.opacity    = '0.35';
        bar.style.background = '';
      });
    }

    function setPlaying(playing) {
      playIcon.style.display  = playing ? 'none' : '';
      pauseIcon.style.display = playing ? '' : 'none';
      playBtn.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play beat');
      playing ? animateBars() : idleBars();
    }

    // Register pause callback so other players can stop this one
    allSetPaused[idx] = () => {
      if (!audio.paused) audio.pause();
      setPlaying(false);
    };

    playBtn.addEventListener('click', async () => {
      if (audio.paused) {
        // Pause all other players first
        allSetPaused.forEach((fn, i) => { if (i !== idx && fn) fn(); });
        const trailer = document.querySelector('.kit-trailer__video');
        if (trailer && !trailer.muted) trailer.muted = true;
        const heroBg = document.querySelector('.kit-hero__video-bg');
        if (heroBg && !heroBg.muted) {
          heroBg.muted = true;
          const heroBtn = document.getElementById('kitHeroSoundBtn');
          if (heroBtn) {
            heroBtn.classList.remove('is-on');
            heroBtn.setAttribute('aria-pressed', 'false');
            const offIcon = heroBtn.querySelector('.sound-off-icon');
            const onIcon = heroBtn.querySelector('.sound-on-icon');
            if (offIcon) offIcon.style.display = '';
            if (onIcon) onIcon.style.display = 'none';
          }
        }
        setupAudio();
        if (audioCtx) {
          try { await audioCtx.resume(); } catch(e) {}
        }
        try {
          await audio.play();
          setPlaying(true);
        } catch(e) {
          console.error('audio.play() failed:', e, audio.error);
        }
      } else {
        audio.pause();
        setPlaying(false);
      }
    });

    function fmt(t) {
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    audio.addEventListener('loadedmetadata', () => {
      if (timeDuration) timeDuration.textContent = fmt(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? audio.currentTime / audio.duration : 0;
      if (timeCurrent)    timeCurrent.textContent    = fmt(audio.currentTime);
      if (timelineFill)   timelineFill.style.width   = `${pct * 100}%`;
      if (timelineThumb)  timelineThumb.style.left   = `${pct * 100}%`;
    });

    if (timeline) {
      timeline.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = timeline.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
      });
    }

    audio.addEventListener('ended', () => {
      setPlaying(false);
      if (timelineFill)  timelineFill.style.width = '0%';
      if (timelineThumb) timelineThumb.style.left  = '0%';
      if (timeCurrent)   timeCurrent.textContent   = '0:00';
    });

    idleBars();
  });
}

/* ─── NAV ACTIVE SECTION ────────────────────────────────── */
function initNavActive() {
  const sections = [
    { id: 'demos', link: document.querySelector('.nav__link[href$="#demos"]') },
    { id: 'kits',  link: document.querySelector('.nav__link[href$="#kits"]') },
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const item = sections.find(s => s.id === entry.target.id);
      if (!item || !item.link) return;
      item.link.classList.toggle('nav__link--active', entry.isIntersecting);
    });
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

