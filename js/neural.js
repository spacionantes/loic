/**
 * Neural network canvas background.
 * Canvas 2D — lighter than WebGL for this node/filament density.
 * Exports initNeural() → { burst } for section-change signal bursts.
 */
export function initNeural() {
  const canvas = document.getElementById('neural');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobile = () => window.innerWidth < 768;

  // ── Config ────────────────────────────────────────────────────
  const CFG = {
    nodeCount:   () => isMobile() ? 32 : 68,
    maxDist:     () => isMobile() ? 130 : 190,
    cursorRange: 200,
    maxPulses:   10,
    idleTimeout: 3000,
  };

  let W = 0, H = 0;
  let nodes  = [];
  let pulses = [];
  let frame  = 0;
  let lastTs = 0;
  let animId = null;

  const mouse      = { x: -999, y: -999 };
  let lastMouseMove = 0;

  // ── Node factory ──────────────────────────────────────────────
  function makeNode() {
    return {
      x:      Math.random() * W,
      y:      Math.random() * H,
      vx:     (Math.random() - 0.5) * 0.25,
      vy:     (Math.random() - 0.5) * 0.25,
      phase:  Math.random() * Math.PI * 2,
      freqX:  0.00025 + Math.random() * 0.00035,
      freqY:  0.00025 + Math.random() * 0.00035,
      r:      1.2 + Math.random() * 1.4,
    };
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const n = CFG.nodeCount();
    nodes = Array.from({ length: n }, makeNode);
    pulses = [];
  }

  // ── Pulse factory ─────────────────────────────────────────────
  function spawnPulse(forced) {
    if (!forced && pulses.length >= CFG.maxPulses) return;
    const maxD = CFG.maxDist();
    let attempts = 0;
    while (attempts++ < 20) {
      const ai = (Math.random() * nodes.length) | 0;
      const bi = (Math.random() * nodes.length) | 0;
      if (ai === bi) continue;
      const a = nodes[ai], b = nodes[bi];
      if (Math.hypot(a.x - b.x, a.y - b.y) > maxD) continue;
      pulses.push({ a, b, t: 0 });
      break;
    }
  }

  // ── Main loop ─────────────────────────────────────────────────
  function tick(ts) {
    animId = requestAnimationFrame(tick);

    const dt   = Math.min(ts - lastTs, 33);
    lastTs = ts;
    frame++;

    const idle   = (ts - lastMouseMove) > CFG.idleTimeout;
    const speed  = idle ? 0.35 : 1.0;
    const maxD   = CFG.maxDist();
    const maxD2  = maxD * maxD;

    ctx.clearRect(0, 0, W, H);

    // ── Update nodes ───────────────────────────────────────────
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // Organic breathing via low-frequency sine
      n.vx += Math.sin(ts * n.freqX + n.phase)      * 0.007 * speed;
      n.vy += Math.cos(ts * n.freqY + n.phase + 1.3) * 0.007 * speed;
      // Micro-jitter
      n.vx += (Math.random() - 0.5) * 0.012 * speed;
      n.vy += (Math.random() - 0.5) * 0.012 * speed;
      // Damping
      n.vx *= 0.965;
      n.vy *= 0.965;

      // Cursor attraction
      if (!idle) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CFG.cursorRange * CFG.cursorRange && d2 > 1) {
          const inv = 1 / Math.sqrt(d2);
          const f   = (1 - Math.sqrt(d2) / CFG.cursorRange) * 0.12;
          n.vx += dx * inv * f;
          n.vy += dy * inv * f;
        }
      }

      n.x += n.vx;
      n.y += n.vy;

      // Toroidal wrap
      if (n.x < 0) n.x += W; else if (n.x > W) n.x -= W;
      if (n.y < 0) n.y += H; else if (n.y > H) n.y -= H;
    }

    // ── Draw filaments ─────────────────────────────────────────
    const mx = mouse.x, my = mouse.y;
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b  = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxD2) continue;

        const dist  = Math.sqrt(d2);
        const ratio = 1 - dist / maxD;

        // Cursor proximity tint (midpoint of filament vs cursor)
        const midX   = (a.x + b.x) * 0.5;
        const midY   = (a.y + b.y) * 0.5;
        const cdist  = Math.hypot(midX - mx, midY - my);
        const redMix = cdist < 220 ? (1 - cdist / 220) : 0;

        const alpha  = ratio * (0.5 + redMix * 0.4);
        // White → vivid red interpolation
        const rv = (220 - redMix * 36)  | 0;
        const gv = (220 - redMix * 220) | 0;
        const bv = (220 - redMix * 189) | 0;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${rv},${gv},${bv},${alpha})`;
        ctx.lineWidth   = 0.5 + ratio * 0.7;
        ctx.stroke();
      }
    }

    // ── Draw nodes (glow halo + core) ─────────────────────────
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const cdist = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      const hot   = cdist < CFG.cursorRange ? (1 - cdist / CFG.cursorRange) : 0;

      // Outer soft halo
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (4 + hot * 5), 0, Math.PI * 2);
      ctx.fillStyle = hot > 0.1
        ? `rgba(255,74,28,${0.07 + hot * 0.14})`
        : `rgba(244,241,236,0.05)`;
      ctx.fill();

      // Core node
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + hot * 2, 0, Math.PI * 2);
      ctx.fillStyle = hot > 0.15
        ? `rgba(255,107,53,${0.75 + hot * 0.25})`
        : `rgba(244,241,236,0.85)`;
      ctx.fill();
    }

    // ── Pulses ─────────────────────────────────────────────────
    if (frame % 38 === 0) spawnPulse(false);

    const pSpeed = idle ? 0.012 : 0.022;
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += pSpeed;
      if (p.t >= 1) { pulses.splice(i, 1); continue; }

      const px = p.a.x + (p.b.x - p.a.x) * p.t;
      const py = p.a.y + (p.b.y - p.a.y) * p.t;
      const fa = 1 - p.t;

      // Core dot
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,107,53,${fa})`;
      ctx.fill();

      // Bright inner flash
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,220,180,${fa * 0.9})`;
      ctx.fill();

      // Soft halo
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,74,28,${fa * 0.18})`;
      ctx.fill();
    }
  }

  // ── Reduced-motion static fallback ────────────────────────────
  function drawStatic() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const n    = Math.floor(CFG.nodeCount() * 0.6);
    const maxD = CFG.maxDist();
    const pts  = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
    }));

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < pts.length - 1; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d > maxD) continue;
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(200,200,200,${(1 - d / maxD) * 0.1})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(244,241,236,0.3)';
      ctx.fill();
    }
  }

  // ── Events ────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    if (reduced) { drawStatic(); return; }
    cancelAnimationFrame(animId);
    resize();
    lastTs = performance.now();
    animId = requestAnimationFrame(tick);
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lastMouseMove = performance.now();
  });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else if (!reduced) {
      lastTs = performance.now();
      animId = requestAnimationFrame(tick);
    }
  });

  // ── Boot ──────────────────────────────────────────────────────
  if (reduced) {
    drawStatic();
    return { burst() {} };
  }

  resize();
  lastTs = performance.now();
  animId = requestAnimationFrame(tick);

  return {
    /** Trigger a burst of pulses — call on section transitions */
    burst() {
      for (let i = 0; i < 14; i++) {
        setTimeout(() => spawnPulse(true), i * 55);
      }
    },
  };
}
