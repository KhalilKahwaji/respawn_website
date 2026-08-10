import { CSSProperties } from "react";
import HeroBackground from "@/components/HeroBackground";
import RevealOnScroll from "@/components/RevealOnScroll";
import { PRIZE_SPLIT_PLAYERS, prizePoolTotal, prizes, tournament } from "@/lib/config";

export const metadata = {
  title: "Prize Pool & Distribution",
  description:
    `${tournament.prizePool} prize pool for ${tournament.name} - $1,600 for 1st, $900 for 2nd, $500 for 3rd, ` +
    `plus a $150 ${tournament.organizer} voucher for 4th. The CS2 tournament in Lebanon by ` +
    `${tournament.organizer} × ${tournament.partner}.`,
  alternates: { canonical: "/prizes" },
};

const cashPrizes = prizes.filter((p) => p.amount > 0);

/** "1600" -> "1,600" - grouped by hand so server and client render identically. */
function group(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Percentage of the cash pool a placement takes home. */
function share(amount: number) {
  return (amount / prizePoolTotal) * 100;
}

/** Podium blocks read 2nd - 1st - 3rd, tallest in the middle. */
const podiumOrder = [2, 1, 3]
  .map((place) => cashPrizes.find((p) => p.place === place))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

/** Static class strings so Tailwind keeps them in the build. */
const podiumStyles: Record<number, { column: string; fill: string; text: string; ring: string }> = {
  1: { column: "h-32 sm:h-44", fill: "podium-1", text: "prize-gold", ring: "border-amber-300/40 bg-amber-300/5" },
  2: { column: "h-24 sm:h-32", fill: "podium-2", text: "neon-cyan", ring: "border-neon-cyan/40 bg-neon-cyan/5" },
  3: { column: "h-16 sm:h-24", fill: "podium-3", text: "text-neon-violet", ring: "border-neon-violet/40 bg-neon-violet/5" },
};

const splitClass: Record<number, string> = { 1: "split-1", 2: "split-2", 3: "split-3" };

function Trophy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a4 4 0 0 0 3.5 4" />
      <path d="M17 6h3v1a4 4 0 0 1-3.5 4" />
      <path d="M12 15v3" />
      <path d="M8.5 21h7l-.6-2.2a1 1 0 0 0-1-.8h-3.8a1 1 0 0 0-1 .8L8.5 21Z" />
    </svg>
  );
}

function Medal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M8.5 9.6 6 3h5l1.8 3.6" />
      <path d="M15.5 9.6 18 3h-5" />
    </svg>
  );
}

export default function PrizesPage() {
  return (
    <>
      <RevealOnScroll />
      {/* Scroll-revealed blocks start hidden - show everything if JS is off. */}
      <noscript>
        <style>{"[data-reveal]{opacity:1 !important;transform:none !important}"}</style>
      </noscript>

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-5xl px-4 pt-14 pb-14 sm:pt-20 sm:pb-16 text-center">
          <p className="section-eyebrow animate-rise">{tournament.shortName} · Prize Pool</p>

          <p className="mt-6 font-display text-xs sm:text-sm uppercase tracking-[0.35em] text-zinc-400 animate-rise">
            Total cash on the line
          </p>
          <h1 className="mt-2 font-display font-black uppercase leading-none animate-rise">
            <span className="prize-gold tabular block text-6xl sm:text-8xl">${group(prizePoolTotal)}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-zinc-400 animate-rise">
            Split across the top three teams - plus a{" "}
            <span className="text-neon-magenta font-semibold">$150 {tournament.organizer} voucher</span>{" "}
            for the team that finishes 4th.
          </p>
        </div>
      </section>

      {/* ---------- PODIUM ---------- */}
      <section className="mx-auto max-w-4xl px-4 pb-12">
        <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-6">
          {podiumOrder.map((p, i) => {
            const s = podiumStyles[p.place];
            const delay = `${i * 140}ms`;
            return (
              <div
                key={p.place}
                data-reveal
                className="flex w-full flex-col items-center"
                style={{ transitionDelay: delay }}
              >
                <div className={`w-full rounded-2xl border ${s.ring} px-2 py-4 sm:px-4 sm:py-5 text-center`}>
                  <span className={`mx-auto flex h-9 w-9 items-center justify-center ${s.text}`}>
                    {p.place === 1 ? <Trophy className="h-7 w-7" /> : <Medal className="h-6 w-6" />}
                  </span>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                    {p.ordinal} place
                  </p>
                  <p className={`tabular mt-1.5 font-display text-xl sm:text-3xl font-black ${s.text}`}>
                    {p.label}
                  </p>
                  <p className="mt-1 text-[0.65rem] sm:text-xs text-zinc-500">
                    ≈ ${group(Math.round(p.amount / PRIZE_SPLIT_PLAYERS))} / player
                  </p>
                </div>

                <div className={`relative mt-3 w-full ${s.column}`}>
                  <div className={`podium-fill ${s.fill}`} style={{ animationDelay: delay }} />
                  <span className="podium-rank text-4xl sm:text-6xl">{p.place}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Floor the podium rests on. */}
        <div className="podium-floor" />
      </section>

      <hr className="tube mx-auto max-w-4xl" />

      {/* ---------- SPLIT BAR ---------- */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p data-reveal className="section-eyebrow text-center">The split</p>
        <h2
          data-reveal
          className="mt-3 text-center font-display text-3xl sm:text-4xl font-bold uppercase"
          style={{ transitionDelay: "80ms" }}
        >
          How the <span className="neon-cyan">pool</span> breaks down
        </h2>

        <div data-reveal className="mt-10 split-bar">
          {cashPrizes.map((p) => (
            <div
              key={p.place}
              className={`split-seg ${splitClass[p.place]}`}
              style={{ width: `${share(p.amount)}%` }}
              title={`${p.ordinal} place - ${p.label}`}
            >
              {Math.round(share(p.amount))}%
            </div>
          ))}
        </div>

        <div
          data-reveal
          className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400"
          style={{ transitionDelay: "160ms" }}
        >
          {cashPrizes.map((p) => (
            <span key={p.place} className="inline-flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-sm ${splitClass[p.place]}`} />
              {p.ordinal} · <span className="tabular text-zinc-200">{p.label}</span>
            </span>
          ))}
        </div>

        {/* Per-placement detail */}
        <ul className="mt-10 space-y-3">
          {prizes.map((p, i) => {
            const isCash = p.amount > 0;
            return (
              <li
                key={p.place}
                data-reveal
                className="card-glow flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center gap-4 sm:w-52">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-display text-sm font-black ${
                      isCash ? podiumStyles[p.place].ring : "border-neon-magenta/40 bg-neon-magenta/5"
                    } ${isCash ? podiumStyles[p.place].text : "text-neon-magenta"}`}
                  >
                    {p.place}
                  </span>
                  <div>
                    <p className="font-display text-sm uppercase tracking-widest text-zinc-300">
                      {p.ordinal} place
                    </p>
                    <p className="text-xs text-zinc-500">{p.note}</p>
                  </div>
                </div>

                <div className="flex-1">
                  {isCash ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className={`tabular font-display text-2xl font-black ${podiumStyles[p.place].text}`}>
                          {p.label}
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {Math.round(share(p.amount))}% of pool
                        </span>
                      </div>
                      <div className="share-bar mt-2.5">
                        <i
                          className={splitClass[p.place]}
                          style={
                            { "--w": `${share(p.amount)}%`, animationDelay: `${i * 90}ms` } as CSSProperties
                          }
                        />
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        ≈ ${group(Math.round(p.amount / PRIZE_SPLIT_PLAYERS))} per player across a{" "}
                        {PRIZE_SPLIT_PLAYERS}-man roster
                      </p>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-2xl font-black text-neon-magenta">{p.label}</span>
                      <span className="font-mono text-xs text-muted">on top of the pool</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p data-reveal className="mt-5 text-center text-xs text-muted">
          Cash placements add up to exactly {tournament.prizePool}. The 4th-place voucher is an extra from{" "}
          {tournament.organizer}, not a slice of the pool.
        </p>
      </section>
    </>
  );
}
