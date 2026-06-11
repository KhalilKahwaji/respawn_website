"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/teams", label: "Teams" },
  { href: "/rules", label: "Rules" },
  { href: "/status", label: "Check Status" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-edge/60 bg-void/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Respawn" className="h-12 w-auto" />
            <span className="hidden sm:block font-display text-xs tracking-[0.25em] text-muted uppercase">
              Gaming Lounge
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-2 font-display text-xs uppercase tracking-widest transition-colors ${
                  pathname === l.href
                    ? "text-neon-cyan bg-neon-cyan/5"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/register" className="btn-primary btn-sm ml-3">
              Register Team
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-zinc-300"
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
          <nav className="md:hidden pb-4 flex flex-col gap-1 animate-rise">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 font-display text-sm uppercase tracking-widest ${
                  pathname === l.href ? "text-neon-cyan bg-neon-cyan/5" : "text-zinc-300"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/register" onClick={() => setOpen(false)} className="btn-primary mt-2">
              Register Team
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
