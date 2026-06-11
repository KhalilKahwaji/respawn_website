import { CSSProperties } from "react";

/**
 * Pure-CSS animated hero background: drifting aurora blobs, a slowly panning
 * blueprint grid, a periodic neon scan beam, and floating embers.
 * No client JS — all motion is CSS. Honors prefers-reduced-motion globally.
 */

// Deterministic particle field (fixed values → no hydration mismatch).
const COLORS = ["", "m", "v"] as const; // cyan / magenta / violet
const PARTICLES = Array.from({ length: 22 }, (_, i) => {
  // Cheap deterministic pseudo-spread based on the index.
  const left = (i * 53 + 7) % 100; // 0–99 %
  const delay = (i * 0.77) % 11; // s
  const duration = 11 + ((i * 37) % 10); // 11–20 s
  const size = 2 + (i % 3); // 2–4 px
  const drift = ((i % 5) - 2) * 18; // -36 → 36 px horizontal sway
  const color = COLORS[i % COLORS.length];
  return { left, delay, duration, size, drift, color };
});

export default function HeroBackground() {
  return (
    <div className="hero-fx" aria-hidden>
      <div className="fx-aurora a1" />
      <div className="fx-aurora a2" />
      <div className="fx-aurora a3" />
      <div className="fx-grid" />
      <div className="fx-beam" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`fx-particle ${p.color}`}
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
