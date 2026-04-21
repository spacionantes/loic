/**
 * Custom cursor: luminous node + red-orange particle trail.
 * Disabled on touch devices. Uses the existing #cursor div
 * and #cursor-trail canvas from index.html.
 */
export function initCursor() {
  // Touch-only devices get the native cursor back
  if (matchMedia('(hover: none)').matches) {
    document.body.style.cursor = 'auto';
    return;
  }

  const nodeEl  = document.getElementById('cursor');
  const canvas  = document.getElementById('cursor-trail');
  if (!nodeEl || !canvas) return;

  const ctx = canvas.getContext('2d');

  // ── Resize ────────────────────────────────────────────────────
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── State ─────────────────────────────────────────────────────
  let mx = -300, my = -300; // raw mouse
  let nx = -300, ny = -300; // lagged node position
  let expanded  = false;
  let particles = [];
  let active    = false;    // true once mouse has moved

  // ── Particle emit ─────────────────────────────────────────────
  function emit(count = 1) {
    for (let i = 0; i < count; i++) {
      if (particles.length >= 50) particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.2;
      particles.push({
        x:    mx,
        y:    my,
        vx:   Math.cos(angle) * speed,
        vy:   Math.sin(angle) * speed,
        life: 1,
        size: 2.5 + Math.random() * 2.5,
      });
    }
  }

  // ── Interactive element detection ─────────────────────────────
  const INTERACTIVE = 'a, button, .project-card, input, textarea, [data-overlay-close], [data-nav]';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(INTERACTIVE)) {
      nodeEl.classList.add('expanded');
      expanded = true;
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(INTERACTIVE)) {
      nodeEl.classList.remove('expanded');
      expanded = false;
    }
  });

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!active) { nx = mx; ny = my; active = true; nodeEl.style.opacity = '1'; }
    emit(expanded ? 2 : 1);
  });

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => { nodeEl.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { if (active) nodeEl.style.opacity = '1'; });

  // ── Render loop ───────────────────────────────────────────────
  function tick() {
    requestAnimationFrame(tick);

    // Smooth-lag node position
    nx += (mx - nx) * 0.13;
    ny += (my - ny) * 0.13;

    nodeEl.style.transform = `translate(${nx}px,${ny}px) translate(-50%,-50%)`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Extra continuous emission when hovered over interactive element
    if (expanded && Math.random() < 0.35) emit(1);

    // Update + draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.x  += p.vx;
      p.y  += p.vy;
      p.vx *= 0.93;
      p.vy *= 0.93;
      p.life -= expanded ? 0.048 : 0.032;
      p.size *= 0.97;

      if (p.life <= 0.02 || p.size < 0.2) { particles.splice(i, 1); continue; }

      // Colour: orange (#FF6B35) → red (#8B0000), fading out
      const rr = 255;
      const gg = Math.round(107 * p.life * (expanded ? 0.6 : 1));
      const bb = Math.round(53  * p.life * 0.5);
      const aa = p.life * (expanded ? 0.75 : 0.55);

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${aa})`;
      ctx.fill();
    }
  }

  requestAnimationFrame(tick);
}
