"use client";

import { useRef, type ReactNode } from "react";

/**
 * Wrapper that lets a button drift a few pixels toward the cursor as it
 * approaches, then springs back on leave.
 *
 * The offset is written to CSS variables rather than state, so tracking the
 * pointer costs no re-renders. Skipped on coarse pointers, where there is no
 * hover to anticipate.
 */
export default function MagneticButton({
  children,
  strength = 0.28,
}: {
  children: ReactNode;
  /** Fraction of the cursor's offset from centre that the element follows. */
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  function onMove(e: React.PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * strength;
    const dy = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.setProperty("--dx", `${dx}px`);
    el.style.setProperty("--dy", `${dy}px`);
  }

  function reset() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--dx", "0px");
    el.style.setProperty("--dy", "0px");
  }

  return (
    <span ref={ref} className="magnetic" onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </span>
  );
}
