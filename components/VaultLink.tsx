"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Total run time of the sequence. Must match --vault-dur below. */
const DURATION = 1750;
/** Navigate slightly before the doors finish, so the new page lands as they clear. */
const NAVIGATE_AT = 1560;

function VaultOverlay() {
  return (
    <div className="vault" style={{ ["--vault-dur" as string]: `${DURATION}ms` }} aria-hidden="true">
      <div className="vault-inner" />
      <div className="vault-door vault-door-l" />
      <div className="vault-door vault-door-r" />
      <div className="vault-seam" />

      <div className="vault-core">
        <div className="vault-bezel" />
        <div className="vault-ring" />
        <div className="vault-dial">
          <span className="vault-spoke" />
          <span className="vault-spoke" />
          <span className="vault-spoke" />
          <span className="vault-hub" />
        </div>
        {[0, 90, 180, 270].map((a) => (
          <span key={a} className="vault-bolt" style={{ ["--a" as string]: `${a}deg` }} />
        ))}
        <div className="vault-flash" />
      </div>

      <p className="vault-status">
        <span className="s1">Unlocking archive</span>
        <span className="s2">Access granted</span>
      </p>
      <p className="vault-skip">Click to skip</p>
    </div>
  );
}

/**
 * Link that plays a vault-opening sequence before navigating.
 *
 * Only the presentation is delayed - the destination is prefetched on hover
 * and again the moment the sequence starts, so the page is usually already
 * in cache by the time the doors part.
 *
 * Bails out to a plain navigation when the visitor asks for reduced motion,
 * and for modifier-clicks and middle-clicks so "open in new tab" still works.
 * The sequence can be skipped by clicking, or with Escape.
 */
export default function VaultLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const go = useCallback(() => router.push(href), [router, href]);

  useEffect(() => {
    if (!opening) return;

    const timer = window.setTimeout(go, NAVIGATE_AT);
    const skip = () => {
      window.clearTimeout(timer);
      go();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };

    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, [opening, go]);

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Leave modifier/middle clicks alone - they mean "open somewhere else".
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    router.prefetch(href);
    setOpening(true);
  }

  return (
    <>
      <Link
        href={href}
        className={className}
        onClick={onClick}
        onPointerEnter={() => router.prefetch(href)}
      >
        {children}
      </Link>
      {mounted && opening && createPortal(<VaultOverlay />, document.body)}
    </>
  );
}
