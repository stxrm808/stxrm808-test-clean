'use strict';

(function initKitVol2Page() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Starfield (optional) ─────────────────────────────── */
  const canvas = document.getElementById('vol2Starscape');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(80 + (window.innerWidth / 40));
      stars = [];
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.2 + 0.2,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          tw: Math.random() * Math.PI * 2,
          tws: 0.02 + Math.random() * 0.03,
        });
      }
    }

    function tick() {
      if (document.hidden) {
        raf = 0;
        return;
      }
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;
        s.tw += s.tws;
        if (s.x < 0) s.x += window.innerWidth;
        if (s.x > window.innerWidth) s.x -= window.innerWidth;
        if (s.y < 0) s.y += window.innerHeight;
        if (s.y > window.innerHeight) s.y -= window.innerHeight;
        const a = 0.25 + Math.sin(s.tw) * 0.2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 160, ${a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      resize();
      tick();
    });
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) tick();
    });
  }

  /* ── Spec count-up ───────────────────────────────────── */
  const specNums = document.querySelectorAll('.kit-vol2-spec__num[data-target]');
  if (specNums.length) {
    if (reduced || typeof IntersectionObserver === 'undefined') {
      specNums.forEach((el) => {
        const t = parseInt(el.getAttribute('data-target'), 10);
        if (!isNaN(t)) el.textContent = t.toLocaleString('de-DE');
      });
    } else {
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);

      function animateEl(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        el.classList.add('is-counting');
        const dur = 1400;
        const t0 = performance.now();

        function frame(now) {
          const u = Math.min(1, (now - t0) / dur);
          const v = Math.round(target * easeOut(u));
          el.textContent = v.toLocaleString('de-DE');
          if (u < 1) requestAnimationFrame(frame);
          else el.classList.remove('is-counting');
        }
        requestAnimationFrame(frame);
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target;
            if (el.dataset.done) return;
            el.dataset.done = '1';
            animateEl(el);
            io.unobserve(el);
          });
        },
        { threshold: 0.35 }
      );

      specNums.forEach((el) => io.observe(el));
    }
  }

  /* ── Hero drop countdown (CET target from data-drop-iso) ─ */
  const cdRoot = document.getElementById('kitVol2Countdown');
  if (cdRoot) {
    /**
     * Production / Vercel review: skip lock + countdown so you can QA the full page.
     * Set to false and redeploy before the real drop.
     * While true, add ?vol2Lock=1 to the URL to see the normal countdown + lock overlay.
     */
    const VOL2_PROD_PREVIEW_SKIP_COUNTDOWN = true;

    const iso = cdRoot.getAttribute('data-drop-iso') || '2026-05-01T12:00:00+02:00';
    const params = new URLSearchParams(window.location.search || '');
    const host = (window.location.hostname || '').toLowerCase();
    const isLocalHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '[::1]' ||
      host === '::1';
    const isFlamesbounceProd =
      host === 'www.flamesbounce.com' || host === 'flamesbounce.com';
    const isVercelHost = host.endsWith('.vercel.app');
    const forceCountdownOnLocal =
      params.get('vol2Countdown') === '1' || params.get('countdown') === '1';
    const forceProdLock =
      params.get('vol2Lock') === '1' || params.get('vollock') === '1';
    const previewRaw =
      params.get('vol2Last') ||
      params.get('vol2last') ||
      params.get('vol2PreviewSec') ||
      params.get('vol2previewsec');
    let previewSec = previewRaw == null ? NaN : parseInt(previewRaw, 10);
    if (!Number.isFinite(previewSec)) previewSec = NaN;
    if (Number.isFinite(previewSec)) {
      previewSec = Math.min(600, Math.max(1, previewSec));
    }
    const skipCountdownOnLocal =
      isLocalHost && !forceCountdownOnLocal && !Number.isFinite(previewSec);
    const skipCountdownOnProdPreview =
      VOL2_PROD_PREVIEW_SKIP_COUNTDOWN &&
      (isFlamesbounceProd || isVercelHost) &&
      !forceProdLock &&
      !Number.isFinite(previewSec);
    const forceEnd =
      params.get('vol2End') === '1' ||
      params.get('vol2end') === '1' ||
      params.get('drop') === 'now' ||
      skipCountdownOnLocal ||
      skipCountdownOnProdPreview;

    let dropAt;
    if (forceEnd) {
      dropAt = new Date(Date.now() - 1000);
    } else if (Number.isFinite(previewSec)) {
      dropAt = new Date(Date.now() + previewSec * 1000);
    } else {
      dropAt = new Date(iso);
    }
    const body = document.body;
    const lockRoot = document.getElementById('vol2LockOverlay');
    const buyButtons = document.querySelectorAll('[data-vol2-buy]');
    const els = {
      days: cdRoot.querySelector('[data-cd="days"]'),
      hours: cdRoot.querySelector('[data-cd="hours"]'),
      minutes: cdRoot.querySelector('[data-cd="minutes"]'),
      seconds: cdRoot.querySelector('[data-cd="seconds"]'),
    };
    const lockEls = {
      days: lockRoot?.querySelector('[data-cd-lock="days"]'),
      hours: lockRoot?.querySelector('[data-cd-lock="hours"]'),
      minutes: lockRoot?.querySelector('[data-cd-lock="minutes"]'),
      seconds: lockRoot?.querySelector('[data-cd-lock="seconds"]'),
    };
    const row = cdRoot.querySelector('.kit-vol2-countdown__row');
    const eyebrow = cdRoot.querySelector('.kit-vol2-countdown__eyebrow');
    const liveEl = cdRoot.querySelector('.kit-vol2-countdown__live');

    function pauseOtherMedia() {
      document.querySelectorAll('audio').forEach((a) => {
        if (!a.paused) a.pause();
      });
      document.querySelectorAll('video').forEach((v) => {
        if (v.closest('#vol2UnlockCutscene')) return;
        if (!v.paused) v.pause();
      });
    }

    function playUnlockCutscene() {
      if (document.getElementById('vol2UnlockCutscene')) return;

      const heroVideo = document.querySelector('.kit-hero__video-bg');
      const src =
        (heroVideo && heroVideo.getAttribute('src')) ||
        'assets/FLAMESBOUNCEKIT2-TRAILER-new-text.mp4?v=4';

      pauseOtherMedia();

      const root = document.createElement('div');
      root.id = 'vol2UnlockCutscene';
      root.className = 'vol2-unlock-cutscene';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', 'Flames Bounce Vol. 2 trailer');

      const dim = document.createElement('div');
      dim.className = 'vol2-unlock-cutscene__dim';

      const frame = document.createElement('div');
      frame.className = 'vol2-unlock-cutscene__frame';

      const shell = document.createElement('div');
      shell.className = 'vol2-unlock-cutscene__video-shell';

      const video = document.createElement('video');
      video.className = 'vol2-unlock-cutscene__video';
      video.src = src;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.playsInline = true;
      video.muted = false;
      video.volume = 1;
      video.loop = false;
      video.controls = false;
      video.preload = 'auto';

      const soundBtn = document.createElement('button');
      soundBtn.type = 'button';
      soundBtn.className = 'vol2-unlock-cutscene__sound';
      soundBtn.textContent = 'Sound on';
      soundBtn.hidden = true;
      soundBtn.setAttribute('aria-label', 'Unmute trailer');

      const skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'vol2-unlock-cutscene__skip';
      skip.textContent = 'Skip';

      shell.appendChild(video);
      frame.appendChild(shell);
      root.appendChild(dim);
      root.appendChild(frame);
      root.appendChild(soundBtn);
      root.appendChild(skip);
      document.body.appendChild(root);

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const canGsap = typeof gsap !== 'undefined';
      let activeTl = null;

      soundBtn.addEventListener('click', () => {
        video.muted = false;
        video.volume = 1;
        soundBtn.hidden = true;
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      });
      const main = document.querySelector('body.page-kit-vol2 > main');
      const footer = document.querySelector('body.page-kit-vol2 .footer');

      const kill = () => {
        document.body.style.overflow = prevOverflow;
        root.remove();
      };

      function resetPageMotion() {
        if (!canGsap) return;
        gsap.killTweensOf([main, footer, root, dim, frame, shell, skip, soundBtn, video].filter(Boolean));
        if (main) gsap.set(main, { clearProps: 'transform,opacity,filter' });
        if (footer) gsap.set(footer, { clearProps: 'transform,opacity' });
      }

      function stopCutsceneVideo() {
        try {
          video.muted = true;
        } catch (e) {
          /* ignore */
        }
        soundBtn.hidden = true;
        try {
          video.pause();
        } catch (e) {
          /* ignore */
        }
        try {
          video.currentTime = 0;
        } catch (e) {
          /* ignore */
        }
      }

      /** After the one-shot trailer, hero loops muted — no audio on the page. */
      function finishHeroHandoff() {
        if (!(heroVideo instanceof HTMLVideoElement)) return;
        try {
          heroVideo.currentTime = 0;
        } catch (e) {
          /* ignore */
        }
        heroVideo.muted = true;
        heroVideo.setAttribute('muted', '');
        heroVideo.playsInline = true;
        heroVideo.loop = true;
        const hp = heroVideo.play();
        if (hp && typeof hp.catch === 'function') {
          hp.catch(() => {
            window.setTimeout(() => {
              heroVideo.play().catch(() => {});
            }, 200);
          });
        }
      }

      skip.addEventListener('click', () => {
        if (activeTl) activeTl.kill();
        stopCutsceneVideo();
        resetPageMotion();
        finishHeroHandoff();
        kill();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      function whenCutsceneHasData() {
        return new Promise((resolve) => {
          if (video.readyState >= 2) {
            resolve();
            return;
          }
          const fin = () => {
            video.removeEventListener('loadeddata', fin);
            video.removeEventListener('canplay', fin);
            resolve();
          };
          video.addEventListener('loadeddata', fin);
          video.addEventListener('canplay', fin);
          video.addEventListener('error', () => resolve(), { once: true });
          window.setTimeout(() => resolve(), 12000);
        });
      }

      function startCutscenePlayback() {
        video.muted = false;
        video.volume = 1;
        const p = video.play();
        if (!p || typeof p.catch !== 'function') return;
        p.catch(() => {
          try {
            video.muted = true;
          } catch (e2) {
            /* ignore */
          }
          soundBtn.hidden = false;
          const p2 = video.play();
          if (p2 && typeof p2.catch === 'function') p2.catch(() => {});
        });
      }

      void whenCutsceneHasData().then(() => {
        startCutscenePlayback();
      });

      if (!canGsap) {
        const done = () => {
          stopCutsceneVideo();
          finishHeroHandoff();
          kill();
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        };

        function waitForVideoEndPlain() {
          return new Promise((resolve) => {
            let settled = false;
            const finish = () => {
              if (settled) return;
              settled = true;
              resolve();
            };

            video.addEventListener('ended', finish, { once: true });

            const onMeta = () => {
              const d = video.duration;
              if (!Number.isFinite(d) || d <= 0) return;
              const remain = Math.max(0.1, (d - video.currentTime) * 1000 + 200);
              window.setTimeout(finish, Math.min(remain, 30 * 60 * 1000));
            };

            if (video.readyState >= 1) onMeta();
            else video.addEventListener('loadedmetadata', onMeta, { once: true });

            window.setTimeout(finish, 30 * 60 * 1000);
          });
        }

        void waitForVideoEndPlain().then(done);
        return;
      }

      function waitForVideoMetadata() {
        return new Promise((resolve) => {
          const done = () => resolve();
          if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
            done();
            return;
          }
          video.addEventListener('loadedmetadata', done, { once: true });
          video.addEventListener('error', done, { once: true });
          window.setTimeout(done, 8000);
        });
      }

      function computeHoldSeconds() {
        const d = video.duration;
        if (!Number.isFinite(d) || d <= 0) return 0.75;
        const remain = Math.max(0.05, d - video.currentTime);
        return Math.min(remain, 60 * 60);
      }

      void waitForVideoMetadata().then(() => {
        const holdSec = computeHoldSeconds();

        gsap.set(root, { opacity: 0 });
        gsap.set(dim, { opacity: 0 });
        gsap.set(frame, { y: 18, scale: 0.985, opacity: 0, transformOrigin: '50% 50%' });
        gsap.set(skip, { opacity: 0, y: 8 });
        if (main) {
          gsap.set(main, { yPercent: 10, opacity: 0.35, filter: 'blur(6px)' });
        }
        if (footer) {
          gsap.set(footer, { yPercent: 8, opacity: 0.25 });
        }

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            stopCutsceneVideo();
            resetPageMotion();
            finishHeroHandoff();
            kill();
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            activeTl = null;
          },
        });
        activeTl = tl;

        tl.to(root, { opacity: 1, duration: 0.35 }, 0)
          .to(dim, { opacity: 1, duration: 0.45 }, 0)
          .to(frame, { y: 0, scale: 1, opacity: 1, duration: 0.55 }, 0.05)
          .to(skip, { opacity: 1, y: 0, duration: 0.35 }, 0.18);

        tl.to({}, { duration: holdSec }, '+=0.05');

        tl.to(
          frame,
          {
            yPercent: -118,
            scale: 1.02,
            duration: 0.85,
            ease: 'power4.inOut',
          },
          '+=0.05'
        ).to(
          dim,
          {
            opacity: 0,
            duration: 0.55,
            ease: 'power2.out',
          },
          '-=0.55'
        );

        tl.fromTo(
          'body.page-kit-vol2 > main',
          { yPercent: 10, opacity: 0.35, filter: 'blur(6px)' },
          { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power4.out' },
          '-=0.72'
        ).fromTo(
          'body.page-kit-vol2 .footer',
          { yPercent: 8, opacity: 0.25 },
          { yPercent: 0, opacity: 1, duration: 0.75, ease: 'power4.out' },
          '-=0.78'
        );
      });
    }

    function pad2(n) {
      return String(n).padStart(2, '0');
    }

    function setBuyLocked(locked) {
      buyButtons.forEach((btn) => {
        if (!(btn instanceof HTMLElement)) return;
        btn.classList.toggle('is-locked', locked);
        if (locked) {
          btn.setAttribute('aria-disabled', 'true');
          btn.setAttribute('tabindex', '-1');
        } else {
          btn.removeAttribute('aria-disabled');
          btn.removeAttribute('tabindex');
        }
      });
    }

    function setLive() {
      cdRoot.classList.add('is-live');
      if (row) row.setAttribute('aria-hidden', 'true');
      if (eyebrow) eyebrow.hidden = true;
      if (liveEl) liveEl.hidden = false;
      cdRoot.setAttribute('aria-label', 'Drop is live');
      body.classList.remove('vol2-prelaunch');
      body.classList.add('vol2-live');
      if (lockRoot) lockRoot.hidden = true;
      setBuyLocked(false);
      if (reduced) return;
      requestAnimationFrame(() => playUnlockCutscene());
    }

    function tick() {
      if (Number.isNaN(dropAt.getTime())) return false;
      const ms = dropAt.getTime() - Date.now();
      if (ms <= 0) {
        setLive();
        return false;
      }
      const sec = Math.floor(ms / 1000);
      const days = Math.floor(sec / 86400);
      const hours = Math.floor((sec % 86400) / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      const seconds = sec % 60;

      if (els.days) els.days.textContent = String(days);
      if (els.hours) els.hours.textContent = pad2(hours);
      if (els.minutes) els.minutes.textContent = pad2(minutes);
      if (els.seconds) els.seconds.textContent = pad2(seconds);
      if (lockEls.days) lockEls.days.textContent = String(days);
      if (lockEls.hours) lockEls.hours.textContent = pad2(hours);
      if (lockEls.minutes) lockEls.minutes.textContent = pad2(minutes);
      if (lockEls.seconds) lockEls.seconds.textContent = pad2(seconds);

      cdRoot.setAttribute(
        'aria-label',
        `Time until drop: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
      );
      body.classList.add('vol2-prelaunch');
      body.classList.remove('vol2-live');
      if (lockRoot) lockRoot.hidden = false;
      setBuyLocked(true);
      return true;
    }

    if (tick() !== false) {
      const iv = setInterval(() => {
        if (tick() === false) clearInterval(iv);
      }, 1000);
    }
  }

})();
