'use strict';

(function initKitPage() {

  /* ── Finder Sidebar Navigation ─────────────────────────── */
  const sidebarItems = document.querySelectorAll('.finder__sidebar-item[data-folder]');
  const fileGroups   = document.querySelectorAll('.finder__file-group');
  const crumbEl      = document.getElementById('finderCrumb');
  const statusEl     = document.getElementById('finderStatus');

  /* Finder status bar = Listen-Zahlen pro Ordner (Flames Bounce Kit vs Vol. 2) */
  const folderMetaVol1 = {
    '808s':   { label: '808s',    count: 34 },
    'hihats': { label: 'Hi Hats', count: 23 },
    'kicks':  { label: 'Kicks',   count: 16 },
    'percs':  { label: 'Percs',   count: 43 },
    'rims':   { label: 'Rims',    count: 23 },
    'snares': { label: 'Snares',  count: 16 },
  };
  const folderMetaVol2 = {
    '808s':      { label: '808s',       count: 30 },
    'chants':    { label: 'Chants',     count: 17 },
    'claps':     { label: 'Claps',      count: 26 },
    'cymbals':   { label: 'Cymbals',    count: 8 },
    'fills':     { label: 'Fills',      count: 19 },
    'fx':        { label: 'FX',         count: 23 },
    'hihats':    { label: 'Hi Hats',    count: 26 },
    'kicks':     { label: 'Kicks',      count: 35 },
    'openhats':  { label: 'Open Hats',  count: 17 },
    'percloops': { label: 'Percloops',  count: 10 },
    'percs':     { label: 'Percs',      count: 79 },
    'rims':      { label: 'Rims',       count: 31 },
    'scratches': { label: 'Scratches',  count: 15 },
    'shaker':    { label: 'Shaker',     count: 34 },
    'snares':    { label: 'Snares',     count: 37 },
    'stomps':    { label: 'Stomps',     count: 22 },
  };
  const folderMeta = document.body.classList.contains('page-kit-vol2')
    ? folderMetaVol2
    : folderMetaVol1;

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const folder = item.dataset.folder;

      // Stop any playing audio when switching folders
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      if (activeRow) activeRow.classList.remove('is-playing', 'is-selected');
      activeRow = null;
      activeAudio = null;

      // Update sidebar active state
      sidebarItems.forEach(i => {
        i.classList.remove('is-active');
        i.setAttribute('aria-pressed', 'false');
      });
      item.classList.add('is-active');
      item.setAttribute('aria-pressed', 'true');

      // Show correct file group
      fileGroups.forEach(g => g.classList.remove('is-active'));
      const group = document.getElementById(`fg-${folder}`);
      if (group) group.classList.add('is-active');

      // Update breadcrumb + status
      const meta = folderMeta[folder];
      if (crumbEl && meta) crumbEl.textContent = meta.label;
      if (statusEl && meta) statusEl.textContent = `${meta.count} items`;
    });
  });

  /* ── File row click → play real WAV ───────────────────── */
  let activeRow   = null;
  let activeAudio = null;

  document.querySelectorAll('.finder__file:not(.finder__file--locked)').forEach(row => {
    row.addEventListener('click', () => {
      const src = row.dataset.src;
      if (!src) return;

      // Same row → stop
      if (activeRow === row) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        row.classList.remove('is-playing', 'is-selected');
        activeRow = null;
        activeAudio = null;
        return;
      }

      // Stop previous
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      if (activeRow) activeRow.classList.remove('is-playing', 'is-selected');

      // Play real file
      const audio = new Audio(src);
      audio.play().catch(() => {});
      row.classList.add('is-playing', 'is-selected');
      activeRow   = row;
      activeAudio = audio;

      audio.addEventListener('ended', () => {
        row.classList.remove('is-playing', 'is-selected');
        if (activeRow === row) { activeRow = null; activeAudio = null; }
      });
    });
  });

  /* ── Hero trailer sound toggle ─────────────────────────── */
  const heroSoundBtn = document.getElementById('kitHeroSoundBtn');
  const heroVideo    = document.querySelector('.kit-hero__video-bg');

  if (heroSoundBtn && heroVideo) {
    const offIcon = heroSoundBtn.querySelector('.sound-off-icon');
    const onIcon  = heroSoundBtn.querySelector('.sound-on-icon');

    heroSoundBtn.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      const isOn = !heroVideo.muted;
      heroSoundBtn.classList.toggle('is-on', isOn);
      heroSoundBtn.setAttribute('aria-pressed', String(isOn));
      heroSoundBtn.setAttribute('aria-label', isOn ? 'Turn sound off' : 'Turn sound on');
      if (offIcon) offIcon.style.display = isOn ? 'none' : '';
      if (onIcon)  onIcon.style.display  = isOn ? '' : 'none';
      if (isOn && heroVideo.paused) heroVideo.play().catch(() => {});
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !heroVideo.muted) {
        heroVideo.muted = true;
        heroSoundBtn.classList.remove('is-on');
        heroSoundBtn.setAttribute('aria-pressed', 'false');
        if (offIcon) offIcon.style.display = '';
        if (onIcon)  onIcon.style.display  = 'none';
      }
    });
  }

  /* ── Kit page reveal animations (GSAP) ────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal-item').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        opacity: 0, y: 28, duration: 0.65, ease: 'power2.out',
      });
    });
  }

  /* Producer fp-cards: main.js → initFeaturedPlayers() (Web Audio bars, play/pause icons, one-player-at-a-time). Do not duplicate here. */

})();
