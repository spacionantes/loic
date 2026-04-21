/**
 * Project data + grid renderer + case-study overlay controller.
 * To add a project: push an entry to PROJECTS and re-deploy.
 */

export const PROJECTS = [
  {
    id:        'coachella-2024',
    title:     'COACHELLA 2024',
    client:    'Goldenvoice',
    year:      '2024',
    format:    '4K · DOLBY HDR',
    role:      'Director / DP',
    signal:    4,
    thumb:     'assets/thumb-coachella.jpg',
    preview:   '',
    heroImg:   'assets/hero-coachella.jpg',
    stills:    ['assets/still-coachella-1.jpg', 'assets/still-coachella-2.jpg'],
    video:     '',
    desc:      'Three days, six stages, two-hundred thousand nodes. A transmission document of the world\'s largest music signal — shot across the main stage, Sahara and Yuma tents during the weekend 1 run.',
    credits:   ['Direction & DP — BROOKE', 'Gaffer — Luc Moreau', 'Color — Studio 33', 'Sound — Sébastien Faure'],
  },
  {
    id:        'boiler-room-paris',
    title:     'BOILER ROOM — PARIS',
    client:    'Boiler Room',
    year:      '2023',
    format:    '4K · STEREO',
    role:      'Director',
    signal:    4,
    thumb:     'assets/thumb-br-paris.jpg',
    preview:   '',
    heroImg:   'assets/hero-br-paris.jpg',
    stills:    ['assets/still-br-1.jpg', 'assets/still-br-2.jpg'],
    video:     '',
    desc:      'An underground session document filmed in a former printing factory in the 19th arrondissement. The signal here is intimate, almost biological — 300 people in a space that hums.',
    credits:   ['Direction — BROOKE', 'DP — Amara Diallo', 'Edit — BROOKE'],
  },
  {
    id:        'smoothrecord-01',
    title:     'SMOOTHRECORD 001',
    client:    'Smoothrecord',
    year:      '2023',
    format:    '1080p · SURROUND',
    role:      'Director / Edit',
    signal:    3,
    thumb:     'assets/thumb-smooth.jpg',
    preview:   '',
    heroImg:   'assets/hero-smooth.jpg',
    stills:    [],
    video:     '',
    desc:      'Label documentary — tracing the signal from studio session to pressing plant. A portrait of the people who make analogue transmission possible.',
    credits:   ['Direction & Edit — BROOKE', 'Producer — Marie L.'],
  },
  {
    id:        'vieilles-charrues',
    title:     'VIEILLES CHARRUES',
    client:    'Association Carhaix',
    year:      '2023',
    format:    '4K · MULTI-CAM',
    role:      'Lead DP',
    signal:    3,
    thumb:     'assets/thumb-vc.jpg',
    preview:   '',
    heroImg:   'assets/hero-vc.jpg',
    stills:    [],
    video:     '',
    desc:      'Festival capture over four nights. Fields, stages, and the particular frequency of Brittany at 2am — a signal unlike anywhere else on the circuit.',
    credits:   ['DP — BROOKE', 'Director — Théo Garnier', 'Color — BROOKE'],
  },
  {
    id:        'arte-concert',
    title:     'ARTE CONCERT LIVE',
    client:    'ARTE',
    year:      '2022',
    format:    '4K · BROADCAST',
    role:      'Director / DP',
    signal:    3,
    thumb:     'assets/thumb-arte.jpg',
    preview:   '',
    heroImg:   'assets/hero-arte.jpg',
    stills:    [],
    video:     '',
    desc:      'Broadcast live session for ARTE Concert. Shot in a single night at La Gaîté Lyrique, Paris — a document for the archive.',
    credits:   ['Direction & DP — BROOKE', 'Broadcast — ARTE France'],
  },
  {
    id:        'red-bull-music',
    title:     'RED BULL MUSIC SESSION',
    client:    'Red Bull',
    year:      '2022',
    format:    '4K · DOLBY',
    role:      'Director',
    signal:    2,
    thumb:     'assets/thumb-rbm.jpg',
    preview:   '',
    heroImg:   'assets/hero-rbm.jpg',
    stills:    [],
    video:     '',
    desc:      'A rooftop session at sunrise. The light here is the subject — everything else is the instrument.',
    credits:   ['Direction — BROOKE', 'DP — Karim Sow', 'Edit — BROOKE'],
  },
];

// ── Card renderer ─────────────────────────────────────────────
function buildSignalBars(strength) {
  const bars = [1, 2, 3, 4].map(n => {
    const active = n <= strength ? ` style="background:var(--signal)"` : '';
    return `<span${active}></span>`;
  }).join('');
  return `<span class="signal-bars strength-${strength}" aria-label="Signal strength ${strength} of 4">${bars}</span>`;
}

function buildCard(p, index) {
  const hasBg = `background:linear-gradient(135deg,var(--bg-secondary),var(--red-deep))`;
  const thumbStyle = p.thumb
    ? `background-image:url('${p.thumb}');background-size:cover;background-position:center;`
    : hasBg;

  return `
  <article class="project-card" data-project-id="${p.id}" tabindex="0"
    role="button" aria-label="Open case study: ${p.title}">
    <div class="card-thumb">
      ${p.preview ? `<video src="${p.preview}" muted loop playsinline preload="none"></video>` : ''}
      <div class="card-thumb-bg" style="${thumbStyle}"></div>
      <div class="card-scan" aria-hidden="true"></div>
      <div class="card-glow" aria-hidden="true"></div>
      <div class="card-filament" aria-hidden="true"></div>
    </div>
    <h3 class="card-title">${p.title}</h3>
    <dl class="card-meta mono">
      <div><dt class="sr-only">Client</dt><dd>${p.client}</dd></div>
      <div><dt class="sr-only">Year</dt><dd>${p.year}</dd></div>
      <div><dt class="sr-only">Format</dt><dd>${p.format}</dd></div>
      ${buildSignalBars(p.signal)}
    </dl>
  </article>`;
}

// ── Grid init ─────────────────────────────────────────────────
export function initProjects() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((p, i) => buildCard(p, i)).join('');

  // Hover → play preview video
  grid.addEventListener('mouseover', e => {
    const card = e.target.closest('.project-card');
    card?.querySelector('video')?.play().catch(() => {});
  });
  grid.addEventListener('mouseout', e => {
    const card = e.target.closest('.project-card');
    const vid  = card?.querySelector('video');
    if (vid) { vid.pause(); vid.currentTime = 0; }
  });

  // Click / Enter → open overlay
  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-project-id]');
    if (card) openOverlay(card.dataset.projectId);
  });
  grid.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-project-id]');
      if (card) { e.preventDefault(); openOverlay(card.dataset.projectId); }
    }
  });
}

// ── Overlay ───────────────────────────────────────────────────
function openOverlay(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;

  const overlay = document.getElementById('overlay');
  if (!overlay) return;

  // Populate
  document.getElementById('overlay-node').textContent   = `NODE · ${p.id.toUpperCase()}`;
  document.getElementById('overlay-title').textContent  = p.title;
  document.getElementById('overlay-client').textContent = p.client;
  document.getElementById('overlay-year').textContent   = p.year;
  document.getElementById('overlay-format').textContent = p.format;
  document.getElementById('overlay-role').textContent   = p.role;
  document.getElementById('overlay-desc').textContent   = p.desc;

  const hero = document.getElementById('overlay-hero');
  hero.style.cssText = p.heroImg
    ? `background:url('${p.heroImg}') center/cover no-repeat`
    : `background:linear-gradient(135deg,var(--bg-secondary),var(--red-deep))`;

  const stills = document.getElementById('overlay-stills');
  stills.innerHTML = p.stills.map(s =>
    `<img src="${s}" alt="" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;">`
  ).join('');

  const credits = document.getElementById('overlay-credits');
  credits.innerHTML = p.credits.map(c => `<span>${c}</span>`).join('');

  // Red sweep before opening
  triggerSweep(() => {
    overlay.setAttribute('aria-hidden', 'false');
    overlay.querySelector('.overlay-panel')?.focus();
    document.body.style.overflow = 'hidden';
  });

  // Close handlers
  overlay.querySelectorAll('[data-overlay-close]').forEach(el => {
    el.addEventListener('click', closeOverlay, { once: true });
  });
  document.addEventListener('keydown', escClose);
}

function closeOverlay() {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', escClose);
}

function escClose(e) {
  if (e.key === 'Escape') closeOverlay();
}

// ── Sweep helper (shared) ─────────────────────────────────────
export function triggerSweep(onMid) {
  const sweep = document.getElementById('sweep');
  if (!sweep) { onMid?.(); return; }
  sweep.style.transition = 'none';
  sweep.style.transform  = 'translateX(-110%)';
  sweep.offsetWidth; // force reflow
  sweep.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
  sweep.style.transform  = 'translateX(110%)';
  setTimeout(() => onMid?.(), 280);
}
