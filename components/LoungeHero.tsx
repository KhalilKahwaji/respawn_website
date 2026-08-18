"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import HeroBackground from "@/components/HeroBackground";
import { lounge, routes, tournament } from "@/lib/config";

/** Rendered letter by letter under the brand mark. */
const SUBTITLE = "GAMING LOUNGE".split("");

/** Cyan -> violet -> magenta, sampled across the wordmark. */
const RAMP = [
  [79, 227, 255],
  [167, 139, 250],
  [232, 121, 249],
] as const;

/** Colour for letter `i` of `n`, interpolated along RAMP. */
function letterColor(i: number, n: number) {
  const t = n < 2 ? 0 : (i / (n - 1)) * (RAMP.length - 1);
  const lo = Math.min(Math.floor(t), RAMP.length - 2);
  const f = t - lo;
  const [a, b] = [RAMP[lo], RAMP[lo + 1]];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/**
 * Landing hero: layered animated background, orbiting rings behind the
 * animated logo, and the wordmark assembling itself letter by letter.
 *
 * The only JavaScript here tracks the pointer to move a soft spotlight -
 * written to CSS variables on the section, so it never re-renders React.
 */
export default function LoungeHero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    let x = 50;
    let y = 38;
    const apply = () => {
      frame = 0;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 100;
      y = ((e.clientY - r.top) / r.height) * 100;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="scanlines vignette relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden"
    >
      <HeroBackground />
      <div className="spotlight" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 text-center sm:py-20">
        {/* Logo with orbiting rings */}
        <div className="relative mx-auto flex h-44 w-full items-center justify-center sm:h-56">
          <span className="orbit o1" aria-hidden />
          <span className="orbit o2 hidden sm:block" aria-hidden />
          <span className="orbit o3 hidden lg:block" aria-hidden />
          {/* Decorative: the brand mark already spells the name, and the name
              itself is in the h1 below for screen readers and search engines. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/respawn-logo-animated.webp"
            alt=""
            className="float relative h-24 w-auto drop-shadow-[0_0_44px_rgba(168,85,247,0.6)] sm:h-36 lg:h-44"
          />
        </div>

        <p className="section-eyebrow animate-rise">Esports venue · Lebanon</p>

        <h1 className="mt-5 font-display font-black uppercase leading-none">
          <span className="sr-only">{lounge.name}</span>
          <span
            aria-hidden
            className="wordmark kinetic block justify-center text-2xl tracking-[0.3em] sm:text-4xl lg:text-5xl"
          >
            {SUBTITLE.map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                style={{
                  animationDelay: `${400 + i * 55}ms`,
                  color: letterColor(i, SUBTITLE.length),
                }}
              >
                {ch === " " ? " " : ch}
              </span>
            ))}
          </span>
        </h1>

        <p
          className="mx-auto mt-7 max-w-2xl animate-rise text-base leading-relaxed text-zinc-400 sm:text-lg"
          style={{ animationDelay: "820ms" }}
        >
          {lounge.blurb}
        </p>

        <div
          className="mt-9 flex animate-rise flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "940ms" }}
        >
          <Link href={routes.tournament} className="btn-primary animate-pulseGlow px-9 py-4 text-base">
            {tournament.shortName} →
          </Link>
          <a
            href={lounge.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost px-9 py-4 text-base"
          >
            Join the Discord
          </a>
        </div>

        <div
          className="mt-10 flex animate-rise flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
          style={{ animationDelay: "1060ms" }}
        >
          <span className="inline-flex items-center gap-2 text-emerald-300">
            <span className="status-dot">
              <i />
              <i />
            </span>
            Community open
          </span>
          <span>{tournament.prizePool} paid out</span>
          <span>{tournament.maxTeams} teams hosted</span>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center" aria-hidden>
        <span className="scroll-cue" />
      </div>
    </section>
  );
}
