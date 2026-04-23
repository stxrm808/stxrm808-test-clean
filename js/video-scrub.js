/* ============================================================
   stxrm808 — VIDEO SCROLL SCRUB (home) + optional static hero
   rAF folgt dem Layout bis es stillsteht (auch Scroll-Momentum ohne Events).
   Video-Seeks gedrosselt (Sekunden + Wandzeit), End-Frame immer exakt.
   Metadaten: mehrere Events wegen gecachtem Video.
   ============================================================ */

'use strict';

(function initVideoScrub() {
  const section = document.getElementById('videoScrub');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const video = document.getElementById('scrubVideo');
  const bar = document.getElementById('scrubProgress');

  function clamp01(x) {
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.min(1, x));
  }

  /** Weiche Kurve fürs Einblenden der Producer-Section (wirkt weniger „linear/kantig“). */
  function easeOutCubic(t) {
    const x = clamp01(t);
    return 1 - (1 - x) ** 3;
  }

  /** Früher Start = weicher Übergang Video → Untergrund; eigene Kurve für Demo-Content (startet später). */
  const HERO_EXIT_START = 0.3;
  const HERO_EXIT_RANGE = 0.7;
  const DEMOS_REVEAL_START = 0.48;
  const DEMOS_REVEAL_RANGE = 0.52;

  /** Scroll 0→1: --hero-exit / --hero-exit-smooth für Overlays; --hero-demos-reveal für #demos (verzögert). */
  function syncHeroTransitionVars(sectionEl, p) {
    const x = clamp01(p);
    const exit = Math.max(0, Math.min(1, (x - HERO_EXIT_START) / HERO_EXIT_RANGE));
    const exitSmooth = easeOutCubic(exit);
    const demosRaw = Math.max(0, Math.min(1, (x - DEMOS_REVEAL_START) / DEMOS_REVEAL_RANGE));
    const demosReveal = easeOutCubic(demosRaw);
    const ex = exit.toFixed(4);
    const exs = exitSmooth.toFixed(4);
    const dr = demosReveal.toFixed(4);
    sectionEl.style.setProperty('--scrub-p', x.toFixed(4));
    sectionEl.style.setProperty('--hero-exit', ex);
    sectionEl.style.setProperty('--hero-exit-smooth', exs);
    sectionEl.style.setProperty('--hero-demos-reveal', dr);
    const demosEl = document.getElementById('demos');
    if (demosEl) {
      demosEl.style.setProperty('--hero-exit', ex);
      demosEl.style.setProperty('--hero-exit-smooth', exs);
      demosEl.style.setProperty('--hero-demos-reveal', dr);
    }
  }

  /** Nur der Scroll-Range-Block (200vh) steuert p — nicht die ganze Section inkl. Demos. */
  function getScrubMetricsEl(sectionEl) {
    return sectionEl.querySelector('.video-scrub__scroll-range') || sectionEl;
  }

  function heroScrollProgress(sectionEl, rectIn) {
    const metricsEl = getScrubMetricsEl(sectionEl);
    const rect = rectIn || metricsEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const h = Math.max(metricsEl.offsetHeight || 0, vh + 50);
    const range = h - vh;
    if (range <= 1) return 0;
    return clamp01(-rect.top / range);
  }

  if (video) {
    initWithVideo(section, video, bar);
  } else {
    initStaticHeroOnly(section, bar);
  }

  function initWithVideo(sectionEl, videoEl, barEl) {
    videoEl.setAttribute('playsinline', '');
    videoEl.muted = true;

    videoEl.addEventListener('error', () => {
      sectionEl.classList.add('video-scrub--hidden');
    });

    videoEl.pause();
    try {
      videoEl.currentTime = 0;
    } catch (e) {
      // ignore
    }

    /** Kein Input seit so vielen ms — Ende nur zusammen mit Layout-Stillstand. */
    const INPUT_QUIET_MS = 145;
    /** So viele rAF mit ~gleichem rect.top = wirklich still. */
    const STABLE_FRAMES_NEED = 4;
    /** Pixel: kleiner = empfindlicher (Momentum erkannt). */
    const STABLE_TOP_EPS_PX = 0.45;
    /** Mindest-|Δ| in Sekunden am Video, sonst kein Seek (Decoder). */
    const MIN_SEEK_DELTA_SEC = 0.018;
    /** Spätestens alle so vielen ms seeken, wenn sich p bewegt (nicht hängen bleiben). */
    const MAX_SEEK_GAP_MS = 36;

    let durationSec = 0;
    let installed = false;

    let scrubRafId = 0;
    let lastActivityAt = 0;
    let lastRectTop = null;
    let stableFrames = 0;

    let lastCommittedTime = -1;
    let lastSeekWallMs = 0;

    function updateUi(p) {
      if (barEl) {
        barEl.style.width = `${p * 100}%`;
        barEl.classList.toggle('is-hot', p > 0.6);
      }

      const headline = document.getElementById('scrubHeadline');
      if (headline) {
        let hlOpacity;
        let hlY;
        if (p < 0.55) {
          hlOpacity = 1;
          hlY = 0;
        } else if (p > 0.8) {
          hlOpacity = 0;
          hlY = -140;
        } else {
          const frac = (p - 0.55) / 0.25;
          hlOpacity = 1 - frac;
          hlY = Math.round(frac * -140);
        }
        headline.style.opacity = hlOpacity;
        headline.style.transform = `translateY(${hlY}px)`;
      }

      const counter = document.getElementById('scrubCounter');
      const pctEl = document.getElementById('scrubPct');
      if (counter && pctEl) {
        let cOpacity;
        if (p < 0.1) cOpacity = 0;
        else if (p < 0.2) cOpacity = (p - 0.1) / 0.1;
        else if (p < 0.82) cOpacity = 1;
        else if (p > 0.95) cOpacity = 0;
        else cOpacity = 1 - (p - 0.82) / 0.13;
        counter.style.opacity = cOpacity;
        pctEl.textContent = String(Math.round(p * 100));
      }
      syncHeroTransitionVars(sectionEl, p);
    }

    function commitSeekThrottled(targetSec, force) {
      const now = performance.now();
      const prev = lastCommittedTime >= 0 ? lastCommittedTime : targetSec;
      const dt = Math.abs(targetSec - prev);
      const gap = now - lastSeekWallMs;

      if (
        force ||
        lastCommittedTime < 0 ||
        dt >= MIN_SEEK_DELTA_SEC ||
        gap >= MAX_SEEK_GAP_MS
      ) {
        try {
          videoEl.currentTime = targetSec;
        } catch (e) {
          // ignore
        }
        lastCommittedTime = targetSec;
        lastSeekWallMs = now;
      }
    }

    function applyLayoutHardSync() {
      if (!installed || !durationSec) return;
      const metricsEl = getScrubMetricsEl(sectionEl);
      const rect = metricsEl.getBoundingClientRect();
      const p = heroScrollProgress(sectionEl, rect);
      lastRectTop = rect.top;
      stableFrames = 0;
      lastCommittedTime = -1;
      const t = p * durationSec;
      try {
        videoEl.currentTime = t;
      } catch (e) {
        // ignore
      }
      lastCommittedTime = t;
      lastSeekWallMs = performance.now();
      updateUi(p);
    }

    function scrubFrame() {
      scrubRafId = 0;
      if (!installed || !durationSec) return;

      const metricsEl = getScrubMetricsEl(sectionEl);
      const rect = metricsEl.getBoundingClientRect();
      const p = heroScrollProgress(sectionEl, rect);
      const now = performance.now();
      const targetSec = p * durationSec;

      if (lastRectTop !== null && Math.abs(rect.top - lastRectTop) < STABLE_TOP_EPS_PX) {
        stableFrames++;
      } else {
        stableFrames = 0;
      }
      lastRectTop = rect.top;

      updateUi(p);
      commitSeekThrottled(targetSec, false);

      const inputQuiet = now - lastActivityAt >= INPUT_QUIET_MS;
      const settled = inputQuiet && stableFrames >= STABLE_FRAMES_NEED;

      if (!settled) {
        scrubRafId = requestAnimationFrame(scrubFrame);
      } else {
        commitSeekThrottled(targetSec, true);
      }
    }

    function ensureScrubLoop() {
      if (!installed || !durationSec) return;
      if (scrubRafId) return;
      scrubRafId = requestAnimationFrame(scrubFrame);
    }

    function pulseActivity() {
      lastActivityAt = performance.now();
      ensureScrubLoop();
    }

    function install() {
      if (installed) return;
      installed = true;
      sectionEl.classList.remove('video-scrub--hidden');

      window.addEventListener('scroll', pulseActivity, { passive: true });
      window.addEventListener('wheel', pulseActivity, { passive: true });
      window.addEventListener('touchmove', pulseActivity, { passive: true });
      window.addEventListener('resize', applyLayoutHardSync, { passive: true });
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(applyLayoutHardSync).observe(getScrubMetricsEl(sectionEl));
      }
      window.addEventListener('load', applyLayoutHardSync, { once: true });
      applyLayoutHardSync();
      pulseActivity();
    }

    function setup() {
      const d = videoEl.duration;
      if (!d || !Number.isFinite(d) || d <= 0) return;
      if (durationSec) return;

      durationSec = d;

      const needsUnlock = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (needsUnlock) {
        videoEl
          .play()
          .then(() => {
            videoEl.pause();
            try {
              videoEl.currentTime = 0;
            } catch (e) {
              // ignore
            }
            install();
          })
          .catch(() => install());
      } else {
        install();
      }
    }

    videoEl.addEventListener('loadedmetadata', setup);
    videoEl.addEventListener('durationchange', setup);
    videoEl.addEventListener('loadeddata', setup);
    videoEl.addEventListener('canplay', setup);
    queueMicrotask(setup);
    if (videoEl.readyState >= 1) {
      requestAnimationFrame(setup);
    }
  }

  function initStaticHeroOnly(sectionEl, barEl) {
    const headline = document.getElementById('scrubHeadline');
    const counter = document.getElementById('scrubCounter');
    const pctEl = document.getElementById('scrubPct');

    function updateUi(p) {
      if (barEl) {
        barEl.style.width = `${p * 100}%`;
        barEl.classList.toggle('is-hot', p > 0.6);
      }
      if (headline) {
        let hlOpacity;
        let hlY;
        if (p < 0.55) {
          hlOpacity = 1;
          hlY = 0;
        } else if (p > 0.8) {
          hlOpacity = 0;
          hlY = -140;
        } else {
          const frac = (p - 0.55) / 0.25;
          hlOpacity = 1 - frac;
          hlY = Math.round(frac * -140);
        }
        headline.style.opacity = hlOpacity;
        headline.style.transform = `translateY(${hlY}px)`;
      }
      if (counter && pctEl) {
        let cOpacity;
        if (p < 0.1) cOpacity = 0;
        else if (p < 0.2) cOpacity = (p - 0.1) / 0.1;
        else if (p < 0.82) cOpacity = 1;
        else if (p > 0.95) cOpacity = 0;
        else cOpacity = 1 - (p - 0.82) / 0.13;
        counter.style.opacity = cOpacity;
        pctEl.textContent = String(Math.round(p * 100));
      }
      syncHeroTransitionVars(sectionEl, p);
    }

    let raf = 0;
    function tick() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateUi(heroScrollProgress(sectionEl));
      });
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }
})();
