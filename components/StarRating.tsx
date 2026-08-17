"use client";

import { useState } from "react";
import { REVIEW_MAX_RATING } from "@/lib/config";

const STARS = Array.from({ length: REVIEW_MAX_RATING }, (_, i) => i + 1);

interface Props {
  /** Current value, or null when the question hasn't been answered. */
  value: number | null;
  onChange: (value: number | null) => void;
  /** Accessible name for the whole row (the question being rated). */
  label: string;
  disabled?: boolean;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3.2l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.4l5.9-.9L12 3.2Z" />
    </svg>
  );
}

/**
 * 1-to-N star picker. Clicking the star that's already selected clears the
 * answer again, since every review question is optional.
 *
 * Implemented as a radiogroup of buttons rather than <input type="radio">
 * so the "click to clear" behaviour works and the whole row can be driven
 * from the keyboard with the arrow keys.
 */
export default function StarRating({ value, onChange, label, disabled }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(REVIEW_MAX_RATING, (value ?? 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (value ?? 0) - 1;
      onChange(next < 1 ? null : next);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(REVIEW_MAX_RATING);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div
        role="radiogroup"
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHover(null)}
        className="flex gap-0.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon-cyan sm:gap-1"
      >
        {STARS.map((n) => {
          const on = n <= shown;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} out of ${REVIEW_MAX_RATING}`}
              disabled={disabled}
              tabIndex={-1}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(value === n ? null : n)}
              className={`h-7 w-7 shrink-0 transition-all duration-150 sm:h-8 sm:w-8 ${
                on ? "star-on scale-105" : "text-zinc-700 hover:text-zinc-500"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <Star filled={on} />
            </button>
          );
        })}
      </div>

      <span
        className={`tabular font-display text-sm font-bold ${
          value === null ? "text-zinc-600" : "text-neon-cyan"
        }`}
        aria-live="polite"
      >
        {value === null ? "Not rated" : `${value}/${REVIEW_MAX_RATING}`}
      </span>
    </div>
  );
}
