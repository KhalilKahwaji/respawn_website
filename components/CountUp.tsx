"use client";

import { useEffect, useRef, useState } from "react";

/** "1600" -> "1,600" - grouped by hand so server and client agree exactly. */
function group(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Number that counts up from zero the first time it scrolls into view.
 *
 * Server-renders the final value, so the real number is in the HTML for
 * search engines and for anyone without JavaScript. On mount it resets to
 * zero and waits for the tile to be seen; visitors who ask for reduced
 * motion keep the final value and never see it move.
 */
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1600,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setShown(0);

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutExpo - fast out of the gate, gliding into the final number.
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setShown(value * eased);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {prefix}
      {group(shown)}
      {suffix}
    </span>
  );
}
