"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const d = Math.max(0, target - Date.now());
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d / 3_600_000) % 24),
    minutes: Math.floor((d / 60_000) % 60),
    seconds: Math.floor((d / 1000) % 60),
    done: d === 0,
  };
}

export default function Countdown({ target }: { target: string }) {
  const ts = new Date(target).getTime();
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(ts));
    const id = setInterval(() => setT(diff(ts)), 1000);
    return () => clearInterval(id);
  }, [ts]);

  const cells = [
    { v: t?.days, label: "Days" },
    { v: t?.hours, label: "Hours" },
    { v: t?.minutes, label: "Min" },
    { v: t?.seconds, label: "Sec" },
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-4 lg:gap-5" aria-label="Countdown to tournament start">
      {cells.map((c, i) => (
        <div key={c.label} className="flex items-center gap-1 sm:gap-3 lg:gap-5">
          <div className="card-glow flex h-14 w-14 sm:h-20 sm:w-20 lg:h-24 lg:w-24 flex-col items-center justify-center">
            <span className="font-display text-lg sm:text-3xl lg:text-4xl font-bold text-zinc-50 tabular-nums">
              {t ? String(c.v).padStart(2, "0") : "--"}
            </span>
            <span className="mt-0.5 sm:mt-1 text-[7px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.2em] text-muted">{c.label}</span>
          </div>
          {i < cells.length - 1 && (
            <span className="font-display text-base sm:text-2xl text-neon-magenta neon-magenta">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
