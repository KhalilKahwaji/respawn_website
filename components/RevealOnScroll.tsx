"use client";

import { useEffect } from "react";

/** Reveal anything whose top edge has reached this far up the viewport. */
const TRIGGER = 0.92;

/**
 * Scroll-reveal for server-rendered markup: drop this once on a page and mark
 * anything that should animate in with `data-reveal` (plus an optional inline
 * `transitionDelay` to stagger a row). Nothing is wrapped, so the markup and
 * layout stay exactly as the page author wrote them.
 *
 * Deliberately a position sweep rather than an IntersectionObserver: a fast
 * flick (or a programmatic jump) can carry an element from below the fold to
 * above it between two frames, which never registers as an intersection and
 * would leave that block invisible for good. Measuring position on scroll
 * catches those, because "already scrolled past" also counts as revealed.
 *
 * Elements start hidden in CSS, so the page also ships a <noscript> override.
 */
export default function RevealOnScroll() {
  useEffect(() => {
    let pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (pending.length === 0) return;

    let frame = 0;

    const sweep = () => {
      frame = 0;
      const limit = window.innerHeight * TRIGGER;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top > limit) return true;
        el.classList.add("is-in");
        return false;
      });
      if (pending.length === 0) stop();
    };

    // Coalesce bursts of scroll events into one measurement per frame.
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(sweep);
    };

    function stop() {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    sweep(); // whatever is already on screen at mount

    return stop;
  }, []);

  return null;
}
