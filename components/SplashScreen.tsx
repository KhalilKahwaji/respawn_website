"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Gamified loading splash: glowing logo with glitch ghosts, a scan-line sweep,
 * a neon progress bar, and a "boot sequence" counter. Shows on full page loads,
 * animates to 100%, then fades out and unmounts. Persists across client-side
 * navigation? No — it lives in the layout and only mounts on a fresh load.
 */

const BOOT_LINES = [
  { at: 0, text: "BOOTING RESPAWN OS" },
  { at: 22, text: "LOADING MATCH ENGINE" },
  { at: 48, text: "SYNCING TOURNAMENT GRID" },
  { at: 72, text: "CALIBRATING NEON" },
  { at: 92, text: "ENTERING LOBBY" },
];

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const raf = useRef<number>();

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const DURATION = reduce ? 500 : 2100; // ms to reach 100%
    let start: number | null = null;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      // Ease-out so it races up then settles.
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 2.2);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        // Hold a beat at 100%, then fade out and unmount.
        window.setTimeout(() => setOut(true), reduce ? 60 : 1280);
        window.setTimeout(() => setGone(true), reduce ? 260 : 1950);
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  if (gone) return null;

  const line =
    [...BOOT_LINES].reverse().find((l) => progress >= l.at)?.text ?? BOOT_LINES[0].text;

  return (
    <div className={`splash ${out ? "is-out" : ""}`} role="status" aria-live="polite" aria-label="Loading">
      {/* Reuse the hero animated backdrop for ambience. */}
      <div className="hero-fx">
        <div className="fx-aurora a1" />
        <div className="fx-aurora a2" />
        <div className="fx-aurora a3" />
        <div className="fx-grid" />
      </div>

      <div className="splash-scan" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="splash-logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/respawn-logo-animated.webp" alt="Respawn" className="splash-logo" />
        </div>

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.4em] text-neon-cyan">
          {line}
          <span className="ml-1 animate-pulse">_</span>
        </p>

        <div className="splash-bar mt-5">
          <i style={{ width: `${progress}%` }} />
        </div>

        <p className="mt-3 font-display text-sm tabular-nums tracking-[0.3em] text-zinc-500">
          {String(progress).padStart(3, "0")}%
        </p>
      </div>
    </div>
  );
}
