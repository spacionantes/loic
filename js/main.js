/**
 * Main orchestrator — entry point loaded as type="module".
 * Init order: i18n → neural → cursor → glitch → projects → HUD → scroll → misc
 */

import { initI18n, getLang, CREDITS_ROTATOR } from './i18n.js';
import { initNeural }   from './neural.js';
import { initCursor }   from './cursor.js';
import { initGlitch }   from './glitch.js';
import { initProjects, triggerSweep } from './projects.js';

// ── Boot ──────────────────────────────────────────────────────
initI18n();
const neural = initNeural();
initCursor();
initGlitch();
initProjects();

// ── Smooth scroll (lightweight inertia, no deps) ──────────────
(function initScroll() {
  let current  = window.scrollY;
  let target   = current;
  let ticking  = false;
  const ease   = 0.085;

  window.addEventListener('wheel', e => {
    e.preventDefault();
    target += e.deltaY * 1.1;
    target  = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
    if (!ticking) { ticking = true; requestAnimationFrame(loop); }
  }, { passive: false });

  function loop() {
    const diff = target - current;
    if (Math.abs(diff) < 0.3) { current = target; ticking = false; return; }
    current += diff * ease;
    window.scrollTo(0, current);
    requestAnimationFrame(loop);
  }

  // Touch fallback: let native scroll handle it
  window.addEventListener('touchstart', () => { target = window.scrollY; current = target; });
  window.addEventListener('touchmove',  () => { target = window.scrollY; current = target; });
})();

// ── Nav active state + section-change burst ───────────────────
(function initNav() {
  const sections = [...document.querySelectorAll('.section[data-node]')];
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const nodeNames = { '00':'HERO', '01':'REEL', '02':'WORK', '03':'ABOUT', '04':'CLIENTS', '05':'CONTACT' };

  let lastNode = null;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id   = entry.target.id;
      const node = entry.target.dataset.node;

      // Update nav active link
      navLinks.forEach(a => {
        const match = a.getAttribute('href') === `#${id}`;
        a.toggleAttribute('aria-current', match);
      });

      // HUD node label (minimal, editorial)
      const hudNode = document.getElementById('hud-node');
      if (hudNode) hudNode.textContent = nodeNames[node] ?? id.toUpperCase();

      // Neural burst on node change
      if (node !== lastNode) {
        if (lastNode !== null) neural?.burst();
        lastNode = node;
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));

  // Nav anchor clicks → sweep then scroll
  navLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      triggerSweep(() => target.scrollIntoView({ behavior: 'smooth' }));
    });
  });

  // Mobile menu toggle
  const toggle = document.getElementById('nav-toggle');
  const links  = document.querySelector('.nav-links');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    links?.classList.toggle('open', !open);
  });
})();

// ── HUD: timecode only ───────────────────────────────────────
(function initHUD() {
  const hudTime = document.getElementById('hud-time');
  if (!hudTime) return;

  let last = '';
  function tick() {
    const d = new Date();
    const next = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(n => String(n).padStart(2, '0')).join(':');
    if (next !== last) { hudTime.textContent = next; last = next; }
    setTimeout(tick, 1000);
  }
  tick();
})();

// ── Hero credit rotator ───────────────────────────────────────
(function initRotator() {
  const el = document.getElementById('credit-rotator');
  if (!el) return;

  let index = 0;

  function rotate() {
    const credits = CREDITS_ROTATOR[getLang()] ?? CREDITS_ROTATOR.en;
    el.style.opacity = '0';
    el.style.transform = 'translateY(6px)';
    setTimeout(() => {
      index = (index + 1) % credits.length;
      el.textContent = credits[index];
      el.style.transition = 'opacity 0.4s, transform 0.4s';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 300);
    setTimeout(() => { el.style.transition = ''; }, 800);
  }

  el.style.transition = '';
  setInterval(rotate, 2500);
})();

// ── Reel: sound toggle ────────────────────────────────────────
(function initReel() {
  const btn   = document.getElementById('reel-sound');
  const video = document.getElementById('reel-video');
  if (!btn || !video) return;

  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted) video.play().catch(() => {});
    btn.querySelector('.reel-sound-waves')?.classList.toggle('hidden', video.muted);
    btn.querySelector('span')?.classList.toggle('active');
  });
})();

// ── Email click-to-copy ───────────────────────────────────────
(function initContact() {
  const btn = document.getElementById('contact-email');
  if (!btn) return;
  const email = btn.dataset.email ?? 'hello@brooke.film';

  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(email).then(() => {
      btn.classList.add('copied');
      triggerSweep(() => {});
      setTimeout(() => btn.classList.remove('copied'), 2200);
    }).catch(() => {
      // Fallback: select text
      const range = document.createRange();
      range.selectNode(btn.querySelector('.email-value') ?? btn);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    });
  });
})();

// ── Marquee duplication for seamless loop ────────────────────
(function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  // Duplicate children for seamless infinite scroll
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.parentElement.appendChild(clone);
})();

// ── Scroll-speed CSS var for marquee acceleration ─────────────
(function initMarqueeScroll() {
  const marquee = document.querySelector('.marquee-track');
  if (!marquee) return;
  let base = 28;

  window.addEventListener('wheel', e => {
    const boost = Math.abs(e.deltaY) * 0.012;
    base = Math.max(6, 28 - boost * 8);
    marquee.style.animationDuration = `${base}s`;
    clearTimeout(marquee._reset);
    marquee._reset = setTimeout(() => { marquee.style.animationDuration = '28s'; }, 600);
  }, { passive: true });
})();
