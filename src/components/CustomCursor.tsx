import { useEffect, useRef, useState } from "react";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Custom cursor: instant dot + lagged ring.
 * Uses mix-blend-mode: difference so it's always visible on any background.
 * Desktop/pointer only — hides itself on touch devices.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const isHovering = useRef(false);
  const isClicking = useRef(false);
  const rafRef = useRef<number>();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Touch / pointer-incapable devices — don't mount
    if (window.matchMedia("(hover: none)").matches) return;
    setActive(true);

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      isHovering.current = !!el.closest(
        "a, button, [role='button'], input, textarea, select, label, [data-cursor-pointer]"
      );
    };

    const onDown = () => { isClicking.current = true; };
    const onUp   = () => { isClicking.current = false; };

    const tick = () => {
      const { x, y } = pos.current;

      // Dot — instant
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
      }

      // Ring — lerp (lag)
      ringPos.current.x = lerp(ringPos.current.x, x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, y, 0.1);

      if (ringRef.current) {
        const size = isClicking.current ? 18 : isHovering.current ? 46 : 30;
        const half = size / 2;
        ringRef.current.style.transform = `translate(${ringPos.current.x - half}px, ${ringPos.current.y - half}px)`;
        ringRef.current.style.width  = `${size}px`;
        ringRef.current.style.height = `${size}px`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!active) return null;

  return (
    <>
      {/* Instant dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-white"
        style={{ mixBlendMode: "difference", willChange: "transform" }}
      />
      {/* Lagged ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border-[1.5px] border-white transition-[width,height] duration-150 ease-out"
        style={{ mixBlendMode: "difference", willChange: "transform" }}
      />
    </>
  );
}
