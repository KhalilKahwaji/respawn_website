"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TOURNAMENT_BASE, features, lounge, routes, tournament } from "@/lib/config";

type NavLink = { href: string; label: string };

const loungeLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/#tournaments", label: "Tournaments" },
  { href: "/#arena", label: "The Arena" },
  { href: "/#visit", label: "Visit" },
];

const tournamentLinks: NavLink[] = [
  { href: routes.tournament, label: "Overview" },
  { href: routes.prizes, label: "Prizes" },
  ...(features.publicTeamsPage ? [{ href: routes.teams, label: "Teams" }] : []),
  { href: routes.sponsors, label: "Sponsors" },
  { href: routes.rules, label: "Rules" },
  { href: routes.review, label: "Review" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Inside the tournament section the nav switches to that event's pages, so
  // visitors deep in the archive aren't stranded with only lounge links.
  const inTournament = pathname?.startsWith(TOURNAMENT_BASE) ?? false;
  const links = inTournament ? tournamentLinks : loungeLinks;

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href.includes("#") ? false : href === "/" ? pathname === "/" : pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-edge/60 bg-void/85 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          : "border-transparent bg-void/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={lounge.name}
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.6)]"
            />
            <span className="hidden font-display text-xs uppercase tracking-[0.25em] text-muted sm:block">
              {inTournament ? tournament.shortName : "Gaming Lounge"}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link rounded-lg px-3.5 py-2 font-display text-xs uppercase tracking-widest transition-colors ${
                  isActive(l.href) ? "text-neon-cyan" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {inTournament ? (
              <Link href={routes.prizes} className="btn-primary btn-sm ml-3">
                {tournament.prizePool} Prize Pool
              </Link>
            ) : (
              <Link href={routes.tournament} className="btn-primary btn-sm ml-3">
                {tournament.shortName}
              </Link>
            )}
          </nav>

          <button
            className="p-2 text-zinc-300 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="flex animate-rise flex-col gap-1 pb-4 md:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 font-display text-sm uppercase tracking-widest ${
                  isActive(l.href) ? "bg-neon-cyan/5 text-neon-cyan" : "text-zinc-300"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {inTournament && (
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-display text-sm uppercase tracking-widest text-muted"
              >
                ← {lounge.shortName} home
              </Link>
            )}
            <Link
              href={inTournament ? routes.prizes : routes.tournament}
              onClick={() => setOpen(false)}
              className="btn-primary mt-2"
            >
              {inTournament ? `${tournament.prizePool} Prize Pool` : tournament.shortName}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
