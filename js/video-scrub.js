/* ============================================================
   stxrm808 — VIDEO SCROLL SCRUB (home) + optional static hero
   With #scrubVideo: iOS unlock, seek by scroll, UI overlay.
   Without video: headline + progress only (scroll-linked).
   ============================================================ */

'use strict';

(function initVideoScrub() {
  const section = document.getElementById('videoScrub');
  if (!section) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const video = document.getElementById('scrubVideo');
  const bar = document.getElementById('scrubProgress');

  if (video) {
    initWithVideo(section, video, bar);
  } else {
    initStaticHeroOnly(section, bar);
  }

  function initWithVideo(sectionEl, videoEl, barEl) {
    videoEl.addEventListener('error', () => {
      sectionEl.classList.add('video-scrub--hidden');
    });

    videoEl.pause();
    videoEl.currentTime = 0;

    function setup() {
      const duration = videoEl.duration;
      if (!duration || isNaN(duration)) return;

      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        videoEl.play();
        return;
      }

      const needsUnlock = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (needsUnlock) {
        videoEl.play().then(() => {
          videoEl.pause();
          videoEl.currentTime = 0;
          setupScrollScrub(duration);
        }).catch(() => setupScrollScrub(duration));
      } else {
        setupScrollScrub(duration);
      }
    }

    function setupScrollScrub(duration) {
      const headline = document.getElementById('scrubHeadline');
      const counter = document.getElementById('scrubCounter');
      const pctEl = document.getElementById('scrubPct');

      let lastSet = -1;
      const FRAME = 1 / 30;

      ScrollTrigger.create({
        trigger: sectionEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2,
        onUpdate(self) {
          const p = self.progress;
          const t = p * duration;

          if (Math.abs(t - lastSet) >= FRAME) {
            videoEl.currentTime = t;
            lastSet = t;
          }

          if (barEl) {
            barEl.style.width = `${p * 100}%`;
            barEl.classList.toggle('is-hot', p > 0.6);
          }

          if (headline) {
            let hlOpacity; let hlY;
            if (p < 0.55) {
              hlOpacity = 1;
              hlY = 0;
            } else if (p > 0.80) {
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
            if (p < 0.10) cOpacity = 0;
            else if (p < 0.20) cOpacity = (p - 0.10) / 0.10;
            else if (p < 0.82) cOpacity = 1;
            else if (p > 0.95) cOpacity = 0;
            else cOpacity = 1 - (p - 0.82) / 0.13;
            counter.style.opacity = cOpacity;
            pctEl.textContent = String(Math.round(p * 100));
          }
        },
      });
    }

    if (videoEl.readyState >= 1) {
      setup();
    } else {
      videoEl.addEventListener('loadedmetadata', setup, { once: true });
    }
  }

  function initStaticHeroOnly(sectionEl, barEl) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }

    const headline = document.getElementById('scrubHeadline');
    const counter = document.getElementById('scrubCounter');
    const pctEl = document.getElementById('scrubPct');

    ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate(self) {
        const p = self.progress;

        if (barEl) {
          barEl.style.width = `${p * 100}%`;
          barEl.classList.toggle('is-hot', p > 0.6);
        }

        if (headline) {
          let hlOpacity; let hlY;
          if (p < 0.55) {
            hlOpacity = 1;
            hlY = 0;
          } else if (p > 0.80) {
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
          if (p < 0.10) cOpacity = 0;
          else if (p < 0.20) cOpacity = (p - 0.10) / 0.10;
          else if (p < 0.82) cOpacity = 1;
          else if (p > 0.95) cOpacity = 0;
          else cOpacity = 1 - (p - 0.82) / 0.13;
          counter.style.opacity = cOpacity;
          pctEl.textContent = String(Math.round(p * 100));
        }
      },
    });
  }
})();
