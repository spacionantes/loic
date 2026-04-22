import { useEffect, useRef } from "react";

type NodeKind = "space" | "assoc";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: NodeKind;
  size: number;
  phase: number;
  phaseSpeed: number;
}

// Orange-400 for spaces, Indigo-400 for associations
const SPACE_RGB = "251,146,60";
const ASSOC_RGB = "129,140,248";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rgb(kind: NodeKind) {
  return kind === "space" ? SPACE_RGB : ASSOC_RGB;
}

export function MutualizationCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initNodes = () => {
      const count = Math.min(30, Math.max(18, Math.floor(W / 55)));
      nodesRef.current = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        kind: (i % 2 === 0 ? "space" : "assoc") as NodeKind,
        size: i % 2 === 0 ? 4.5 : 3.5,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.007 + Math.random() * 0.013,
      }));
    };

    const CONNECT_DIST = 150;

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // ── Physics ──────────────────────────────────────────
      for (const n of nodes) {
        n.phase += n.phaseSpeed;

        // Gentle mouse attraction
        const dx = mx - n.x;
        const dy = my - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 220 && d > 0) {
          const f = (1 - d / 220) * 0.007;
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }

        // Damping
        n.vx *= 0.985;
        n.vy *= 0.985;

        // Speed cap
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 1.3) {
          n.vx = (n.vx / speed) * 1.3;
          n.vy = (n.vy / speed) * 1.3;
        }

        n.x += n.vx;
        n.y += n.vy;

        // Soft wrap-around
        if (n.x < -50) n.x = W + 50;
        if (n.x > W + 50) n.x = -50;
        if (n.y < -50) n.y = H + 50;
        if (n.y > H + 50) n.y = -50;
      }

      // ── Connections ──────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d >= CONNECT_DIST) continue;

          const t = 1 - d / CONNECT_DIST;
          const isCross = a.kind !== b.kind;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);

          if (isCross) {
            // Mutualization moment — warm gradient line
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            const alpha = t * 0.6;
            grad.addColorStop(0, `rgba(${rgb(a.kind)},${alpha})`);
            grad.addColorStop(1, `rgba(${rgb(b.kind)},${alpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = lerp(0.5, 2, t);
          } else {
            // Same-type — faint whisper line
            ctx.strokeStyle = `rgba(255,255,255,${t * 0.07})`;
            ctx.lineWidth = 0.6;
          }

          ctx.stroke();
        }
      }

      // ── Nodes ────────────────────────────────────────────
      for (const n of nodes) {
        const pulse = 0.78 + 0.22 * Math.sin(n.phase);
        const r = rgb(n.kind);
        const coreSize = n.size * pulse;

        // Outer glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, coreSize * 5.5);
        grd.addColorStop(0, `rgba(${r},${0.18 * pulse})`);
        grd.addColorStop(1, `rgba(${r},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, coreSize * 5.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core — square for spaces, circle for associations
        ctx.beginPath();
        if (n.kind === "space") {
          const s = coreSize * 1.5;
          const rx = n.x - s;
          const ry = n.y - s;
          const rr = s * 0.45;
          // roundRect with graceful fallback
          if (ctx.roundRect) {
            ctx.roundRect(rx, ry, s * 2, s * 2, rr);
          } else {
            ctx.rect(rx, ry, s * 2, s * 2);
          }
        } else {
          ctx.arc(n.x, n.y, coreSize, 0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(${r},${0.65 + 0.2 * pulse})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    const onResize = () => {
      resize();
      initNodes();
    };

    resize();
    initNodes();
    rafRef.current = requestAnimationFrame(frame);
    window.addEventListener("resize", onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onMouseLeave={() => {
        mouseRef.current = { x: -9999, y: -9999 };
      }}
    />
  );
}
