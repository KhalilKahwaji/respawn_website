"use client";

import { useRef, type ReactNode } from "react";

/**
 * Card that tips slightly toward the pointer, with a soft highlight following
 * the cursor across its surface.
 *
 * Pointer position is written straight to CSS custom properties instead of
 * React state, so moving the mouse never re-renders anything. Coarse pointers
 * (phones, tablets) are skipped entirely - there is no hover there, and the
 * tilt would only fight with scrolling.
 */
export default function TiltCard({
  children,
  className = "",
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees on either axis. */
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
    el.style.setProperty("--px", `${px * 100}%`);
    el.style.setProperty("--py", `${py * 100}%`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`tilt relative ${className}`}
    >
      <span className="tilt-sheen" aria-hidden />
      {children}
    </div>
  );
}
