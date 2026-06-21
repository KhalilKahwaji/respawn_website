"use client";

import { useEffect, useState, CSSProperties } from "react";
import Link from "next/link";
import HeroBackground from "@/components/HeroBackground";
import type { Sponsor } from "@/lib/types";

type LoadState = "loading" | "ready" | "error";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/sponsors", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (!alive) return;
        setSponsors(Array.isArray(data.sponsors) ? data.sponsors : []);
        setState("ready");
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const partners = sponsors.filter((s) => s.tier === "partner");
  const rest = sponsors.filter((s) => s.tier !== "partner");

  return (
    <>
      {/* ---------- HEADER ---------- */}
      <section className="relative overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-12 text-center">
          <p className="section-eyebrow animate-rise">Powered by our partners</p>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl font-black uppercase leading-none">
            <span className="neon-cyan">Sponsors</span> &amp; <span className="neon-magenta">Partners</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400">
            The brands fueling the prize pool and putting the showdown on the map.
            Tap any logo to visit them.
          </p>
        </div>
      </section>

      <hr className="tube mx-auto max-w-4xl" />

      {/* ---------- BODY ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        {state === "loading" && <SponsorSkeleton />}

        {state === "error" && (
          <div className="card mx-auto max-w-md p-10 text-center text-zinc-500">
            Couldn&apos;t load sponsors right now. Refresh in a moment.
          </div>
        )}

        {state === "ready" && sponsors.length === 0 && (
          <div className="card mx-auto max-w-md p-12 text-center">
            <p className="font-display text-xl text-zinc-300">Sponsor slots are open</p>
            <p className="mt-2 text-sm text-zinc-500">
              Want your brand on the board? Get in touch about partnering with us.
            </p>
            <Link href="/" className="btn-ghost mt-6">Back home</Link>
          </div>
        )}

        {state === "ready" && partners.length > 0 && (
          <div className="mb-14">
            <p className="section-eyebrow mb-6 text-center">Headline partner</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:max-w-3xl lg:mx-auto">
              {partners.map((s, i) => (
                <SponsorCard key={s.id} sponsor={s} index={i} featured />
              ))}
            </div>
          </div>
        )}

        {state === "ready" && rest.length > 0 && (
          <>
            {partners.length > 0 && <p className="section-eyebrow mb-6 text-center">Sponsors</p>}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((s, i) => (
                <SponsorCard key={s.id} sponsor={s} index={i + partners.length} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

/* ---------- Sponsor card ---------- */
function SponsorCard({
  sponsor,
  index,
  featured = false,
}: {
  sponsor: Sponsor;
  index: number;
  featured?: boolean;
}) {
  return (
    <a
      href={sponsor.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`sponsor-card group animate-rise ${featured ? "sponsor-card-featured" : ""}`}
      style={{ animationDelay: `${index * 90}ms` } as CSSProperties}
    >
      <div className="sponsor-logo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          className={`w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${
            featured ? "h-24 sm:h-28" : "h-16"
          }`}
        />
      </div>
      <div className="mt-5 text-center">
        <h3 className={`font-display font-bold uppercase tracking-wide ${featured ? "text-2xl" : "text-lg"}`}>
          {sponsor.name}
        </h3>
        {sponsor.blurb && <p className="mt-1 text-sm text-zinc-400">{sponsor.blurb}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neon-cyan opacity-70 transition-opacity group-hover:opacity-100">
          Visit website
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-200 group-hover:translate-x-0.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </a>
  );
}

/* ---------- Loading skeleton ---------- */
function SponsorSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card flex flex-col items-center p-8">
          <div className="sponsor-shimmer h-16 w-32 rounded-lg" />
          <div className="sponsor-shimmer mt-5 h-4 w-24 rounded" />
          <div className="sponsor-shimmer mt-3 h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}
