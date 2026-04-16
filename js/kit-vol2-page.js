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

})();
