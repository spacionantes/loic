/**
 * Glitch typography effects.
 * applyGlitch(el, opts) — scramble + RGB-split on any element.
 * initGlitch() — wires up IntersectionObserver on [data-scramble]
 * and hover RGB-split on .card-title elements.
 */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/—·';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Core scramble ─────────────────────────────────────────────────────────────
/**
 * @param {HTMLElement} el
 * @param {{ duration?: number, onDone?: () => void }} opts
 */
export function applyGlitch(el, { duration = 500, onDone } = {}) {
  if (reduced) {
    el.style.opacity = '1';
    onDone?.();
    return;
  }

  const original = el.dataset.original ?? el.textContent;
  el.dataset.original = original;
  const len   = original.length;
  const start = performance.now();

  // Each character resolves left-to-right over the duration
  function frame(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const resolved = Math.floor(progress * len);

    let out = '';
    for (let i = 0; i < len; i++) {
      if (original[i] === ' ') { out += ' '; continue; }
      if (i < resolved) {
        out += original[i];
      } else {
        // Noise chars slow down as they approach resolved
        out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
    }
    el.textContent = out;

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = original;
      onDone?.();
    }
  }

  requestAnimationFrame(frame);
}

// ── RGB split hover ───────────────────────────────────────────────────────────
function applyRGBSplit(el) {
  if (reduced) return;
  el.classList.add('rgb-split');
  setTimeout(() => el.classList.remove('rgb-split'), 180);
}

// ── IntersectionObserver for [data-scramble] ──────────────────────────────────
export function initGlitch() {
  // Add CSS for RGB split dynamically (keeps JS self-contained)
  if (!document.getElementById('glitch-styles')) {
    const style = document.createElement('style');
    style.id = 'glitch-styles';
    style.textContent = `
      [data-scramble] { opacity: 0; transition: opacity 0.1s; }
      [data-scramble].glitch-done { opacity: 1; }

      .rgb-split {
        position: relative;
        animation: rgb-split-anim 160ms steps(2) forwards;
      }
      @keyframes rgb-split-anim {
        0%   { text-shadow: none; transform: none; }
        25%  { text-shadow: -3px 0 #FF4A1C, 3px 0 #00eeff; transform: translateX(2px); }
        50%  { text-shadow: 3px 0 #FF4A1C, -3px 0 #00eeff; transform: translateX(-2px) skewX(-1deg); }
        75%  { text-shadow: -2px 0 #FF4A1C; transform: translateX(1px); }
        100% { text-shadow: none; transform: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        .rgb-split { animation: none; }
        [data-scramble] { opacity: 1 !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // Scramble on viewport entry
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        applyGlitch(el, {
          duration: 400 + Math.random() * 200,
          onDone: () => el.classList.add('glitch-done'),
        });
        el.style.opacity = '1';
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('[data-scramble]').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });

  // RGB-split on project card title hover
  document.addEventListener('mouseover', e => {
    const title = e.target.closest('.card-title');
    if (title) applyRGBSplit(title);
  });
}
