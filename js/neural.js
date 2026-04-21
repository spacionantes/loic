/**
 * Radiant flow-field background.
 * Particles ride a curl-noise-like field, drawing short warm-toned
 * trails that cumulate into an organic, kirlian-aura glow.
 * Cursor is an attractor — the field bends toward it.
 *
 * Performance: 2D canvas, no trails array — we use a semi-transparent
 * dark overlay each frame to fade previous strokes naturally.
 */
export function initNeural() {
  const canvas = document.getElementById('neural');
  if (!canvas) return;

  const ctx     = canvas.getContext('2d', { alpha: false });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Config ────────────────────────────────────────────────────
  const isMobile  = () => window.innerWidth < 768;
  const PARTICLE_COUNT = () => isMobile() ? 260 : 560;
  const MAX_LIFE = 140;
  const FADE     = 0.055;   // dark overlay alpha per frame (controls trail length)
  const SPEED    = 1.4;

  let W = 0, H = 0;
  let particles = [];
  let animId = null;
  let t0 = 0;

  const mouse = { x: -9999, y: -9999, active: false };
  let lastMouseMove = 0;

  // ── Particle ──────────────────────────────────────────────────
  function spawn(p) {
    // Spawn biased toward center, some randomness
    const cx = W * 0.5, cy = H * 0.5;
    const r  = Math.random() * Math.min(W, H) * 0.45;
    const a  = Math.random() * Math.PI * 2;
    p.x  = cx + Math.cos(a) * r;
    p.y  = cy + Math.sin(a) * r;
    p.px = p.x;
    p.py = p.y;
    p.life = 10 + Math.random() * MAX_LIFE;
    p.maxLife = p.life;
    // Warmth 0..1 → color tint at render time
    p.warmth = Math.random();
    p.thickness = 0.4 + Math.random() * 0.9;
  }

  function initParticles() {
    const n = PARTICLE_COUNT();
    particles = new Array(n);
    for (let i = 0; i < n; i++) {
      particles[i] = {};
      spawn(particles[i]);
      // Stagger initial lives so they don't all die at once
      particles[i].life = Math.random() * MAX_LIFE;
    }
  }

  // ── Flow field (pseudo-noise via combined sines) ──────────────
  // Returns an angle in radians for position (x,y) at time t
  function fieldAngle(x, y, t) {
    const sx = x * 0.0018;
    const sy = y * 0.0018;
    const tt = t * 0.00012;
    // Combination of 3 bands → organic non-repeating swirl
    const n =
      Math.sin(sx * 1.3 + tt * 1.1) +
      Math.cos(sy * 1.1 - tt * 0.9) +
      Math.sin((sx + sy) * 0.9 + tt * 0.6);
    return n * Math.PI; // maps ~[-3π, 3π] but just used as angle seed
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    // Paint the dark background once so first frame is clean
    ctx.fillStyle = '#0A0A0B';
    ctx.fillRect(0, 0, W, H);
    initParticles();
  }

  // ── Main loop ─────────────────────────────────────────────────
  function tick(ts) {
    animId = requestAnimationFrame(tick);
    if (!t0) t0 = ts;
    const t = ts - t0;

    // Soft dark fade instead of clearing — creates persistent trails
    ctx.fillStyle = `rgba(10, 10, 11, ${FADE})`;
    ctx.fillRect(0, 0, W, H);

    // Additive glow
    ctx.globalCompositeOperation = 'lighter';

    const mouseActive = (performance.now() - lastMouseMove) < 1800;
    const mx = mouseActive ? mouse.x : W * 0.5;
    const my = mouseActive ? mouse.y : H * 0.5;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Flow direction
      let angle = fieldAngle(p.x, p.y, t);

      // Radial bias toward attractor (mouse or center) — makes the aura shape
      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.hypot(dx, dy);
      const pullStrength = mouseActive ? 0.35 : 0.15;
      if (dist > 1) {
        // Blend flow angle with angle pointing away from attractor (radiate outward)
        const outward = Math.atan2(p.y - my, p.x - mx);
        angle = angle * (1 - pullStrength) + outward * pullStrength;
      }

      p.px = p.x;
      p.py = p.y;
      p.x += Math.cos(angle) * SPEED;
      p.y += Math.sin(angle) * SPEED;

      // Draw segment
      const lifeRatio = p.life / p.maxLife;
      const alpha = Math.min(lifeRatio, 1 - lifeRatio) * 1.6 * 0.22; // fade in and out

      // Color ramp: white-hot → amber → deep red based on warmth + distance to attractor
      const heat = Math.max(0, 1 - dist / Math.max(W, H) * 1.3);
      const wm = p.warmth * 0.6 + heat * 0.4;

      // (255,245,220) white-hot → (255,140,40) amber → (180,25,30) red
      let r, g, b;
      if (wm < 0.5) {
        const k = wm * 2;
        r = 255;
        g = Math.round(245 + (140 - 245) * k);
        b = Math.round(220 + (40  - 220) * k);
      } else {
        const k = (wm - 0.5) * 2;
        r = Math.round(255 + (180 - 255) * k);
        g = Math.round(140 + (25  - 140) * k);
        b = Math.round(40  + (30  - 40)  * k);
      }

      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = p.thickness;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      p.life--;
      if (p.life <= 0 || p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) {
        spawn(p);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  // ── Static fallback ───────────────────────────────────────────
  function drawStatic() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    ctx.fillStyle = '#0A0A0B';
    ctx.fillRect(0, 0, W, H);

    // Radial sunrise gradient
    const g = ctx.createRadialGradient(W * 0.5, H * 0.8, 0, W * 0.5, H * 0.8, Math.max(W, H) * 0.7);
    g.addColorStop(0,    'rgba(255, 180, 80, 0.5)');
    g.addColorStop(0.25, 'rgba(220, 60, 30, 0.35)');
    g.addColorStop(0.6,  'rgba(80, 10, 10, 0.2)');
    g.addColorStop(1,    'rgba(10, 10, 11, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Events ────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    if (reduced) { drawStatic(); return; }
    cancelAnimationFrame(animId);
    resize();
    t0 = 0;
    animId = requestAnimationFrame(tick);
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    lastMouseMove = performance.now();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else if (!reduced) {
      t0 = 0;
      animId = requestAnimationFrame(tick);
    }
  });

  // ── Boot ──────────────────────────────────────────────────────
  if (reduced) {
    drawStatic();
    return { burst() {} };
  }

  resize();
  animId = requestAnimationFrame(tick);

  return {
    /** Transient burst: spawn extra energy near the attractor */
    burst() {
      // Inject 60 short-lived, high-thickness particles at the attractor
      const cx = mouse.active ? mouse.x : W * 0.5;
      const cy = mouse.active ? mouse.y : H * 0.5;
      for (let i = 0; i < 60; i++) {
        const p = particles[Math.floor(Math.random() * particles.length)];
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 80;
        p.x = p.px = cx + Math.cos(a) * r;
        p.y = p.py = cy + Math.sin(a) * r;
        p.life = 30 + Math.random() * 50;
        p.maxLife = p.life;
        p.warmth = Math.random() * 0.35; // bias white-hot
        p.thickness = 1.2 + Math.random() * 1.0;
      }
    },
  };
}
