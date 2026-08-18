import Link from "next/link";
import CountUp from "@/components/CountUp";
import LoungeHero from "@/components/LoungeHero";
import Marquee from "@/components/Marquee";
import RevealOnScroll from "@/components/RevealOnScroll";
import TiltCard from "@/components/TiltCard";
import { lounge, loungeOfferings, loungeStats, routes, tournament, tournamentIndex } from "@/lib/config";

export const metadata = {
  alternates: { canonical: "/" },
};

const tickerItems = [
  "Counter-Strike 2",
  `${tournament.prizePool} prize pool`,
  "Live on-stage finals",
  "5v5 double elimination",
  "Faceit qualifiers",
  "Esports in Lebanon",
  `${tournament.maxTeams} teams`,
  "Respawn Gaming Lounge",
];

const accentText: Record<string, string> = {
  cyan: "text-neon-cyan",
  magenta: "text-neon-magenta",
  violet: "text-neon-violet",
};
const accentRing: Record<string, string> = {
  cyan: "border-neon-cyan/40 bg-neon-cyan/5",
  magenta: "border-neon-magenta/40 bg-neon-magenta/5",
  violet: "border-neon-violet/40 bg-neon-violet/5",
};

const statusStyles: Record<string, { label: string; cls: string }> = {
  finished: { label: "Completed", cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300" },
  upcoming: { label: "Upcoming", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  live: { label: "Live now", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
};

export default function LoungeHomePage() {
  const telHref = `tel:${lounge.phone.replace(/[^\d+]/g, "")}`;

  return (
    <>
      <RevealOnScroll />
      {/* Scroll-revealed blocks start hidden - show everything if JS is off. */}
      <noscript>
        <style>{"[data-reveal]{opacity:1 !important;transform:none !important}"}</style>
      </noscript>

      <LoungeHero />

      <Marquee items={tickerItems} />

      {/* ---------- BY THE NUMBERS ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div data-reveal className="text-center">
          <p className="section-eyebrow">Track record</p>
          <h2 className="section-title mt-3">
            What we&apos;ve <span className="neon-cyan">put on</span>
          </h2>
          <div className="rule-draw mx-auto mt-6 max-w-xs" />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {loungeStats.map((s, i) => (
            <div key={s.label} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <TiltCard>
                <div className="stat-tile">
                  <p className="font-display text-3xl font-black sm:text-4xl">
                    <CountUp
                      value={s.value}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      className={i === 0 ? "prize-gold" : "text-zinc-100"}
                    />
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted sm:text-xs">
                    {s.label}
                  </p>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>

        <p data-reveal className="mt-6 text-center text-xs text-muted">
          Figures from {tournament.name} · {tournament.startDateLabel}.
        </p>
      </section>

      {/* ---------- WHAT WE DO ---------- */}
      <section id="arena" className="scroll-mt-24 border-y border-edge/50 bg-panel/20 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div data-reveal className="text-center">
            <p className="section-eyebrow">The arena</p>
            <h2 className="section-title mt-3">
              More than a room <span className="neon-magenta">full of PCs</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
              {lounge.name} runs the competitive end of Lebanese gaming - brackets that pay out,
              finals with an audience, and a community that shows up for both.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {loungeOfferings.map((o, i) => (
              <div key={o.title} data-reveal style={{ transitionDelay: `${i * 100}ms` }}>
                <TiltCard max={5}>
                  <article className="card-glow h-full p-7">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border font-display text-sm font-black ${accentRing[o.accent]} ${accentText[o.accent]}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className={`mt-4 font-display text-xl font-bold uppercase tracking-wide ${accentText[o.accent]}`}>
                      {o.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{o.body}</p>
                  </article>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TOURNAMENTS ---------- */}
      <section id="tournaments" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
        <div data-reveal className="text-center">
          <p className="section-eyebrow">Tournaments</p>
          <h2 className="section-title mt-3">
            The <span className="neon-cyan">events</span>
          </h2>
          <div className="rule-draw mx-auto mt-6 max-w-xs" />
        </div>

        <div className="mt-12 space-y-5">
          {tournamentIndex.map((t) => {
            const status = statusStyles[t.status];
            return (
              <div key={t.slug} data-reveal>
                <Link href={t.href} className="group block">
                  <article className="neon-frame overflow-hidden rounded-2xl p-7 sm:p-9">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`pill ${status.cls}`}>{status.label}</span>
                          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                            {t.game}
                          </span>
                        </div>

                        <h3 className="mt-4 font-display text-3xl font-black uppercase leading-none sm:text-5xl">
                          <span className="heatwave-text">{t.shortName}</span>
                        </h3>

                        <p className="mt-3 text-sm text-zinc-400">
                          {t.format} · {t.dateLabel}
                          {t.partner ? ` · with ${t.partner}` : ""}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                          <div>
                            <p className="prize-gold font-display text-2xl font-black">{t.prizePool}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Prize pool</p>
                          </div>
                          <div>
                            <p className="font-display text-2xl font-black text-neon-cyan">
                              {tournament.maxTeams}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Teams</p>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 lg:text-right">
                        <span className="btn-primary btn-sm transition-transform duration-300 group-hover:translate-x-1">
                          Open the archive →
                        </span>
                        <p className="mt-3 text-xs text-muted">
                          Prizes · Rules · Sponsors · Leave a review
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            );
          })}
        </div>

        <p data-reveal className="mt-8 text-center text-sm text-zinc-500">
          Next event not announced yet -{" "}
          <a
            href={lounge.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="text-neon-cyan hover:underline"
          >
            the Discord hears first
          </a>
          .
        </p>
      </section>

      {/* ---------- BRAND MOMENT ---------- */}
      <section className="relative overflow-hidden border-y border-edge/50 py-20">
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 text-center lg:flex-row lg:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/respawn-death-respawn.webp"
            alt=""
            data-reveal
            className="h-40 w-auto drop-shadow-[0_0_36px_rgba(232,121,249,0.4)] sm:h-52"
          />
          <div data-reveal style={{ transitionDelay: "120ms" }}>
            <h2 className="font-display text-3xl font-black uppercase leading-tight sm:text-5xl">
              <span className="glitch" data-text="Lose the round.">
                Lose the round.
              </span>
              <br />
              <span className="neon-cyan">Respawn.</span>{" "}
              <span className="text-zinc-300">Run it back.</span>
            </h2>
            <p className="mt-5 max-w-lg text-zinc-400">
              Every bracket has one winner and fifteen teams that come back sharper. That is the whole
              point of the name - and of the room.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- VISIT ---------- */}
      <section id="visit" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
        <div data-reveal className="text-center">
          <p className="section-eyebrow">Get in touch</p>
          <h2 className="section-title mt-3">
            Find <span className="neon-magenta">the lounge</span>
          </h2>
          <div className="rule-draw mx-auto mt-6 max-w-xs" />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div data-reveal>
            <TiltCard max={5}>
              <a href={lounge.discordUrl} target="_blank" rel="noreferrer" className="card-glow block h-full p-7">
                <p className="field-label">Community</p>
                <p className="font-display text-xl font-bold text-neon-violet">Discord</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Announcements, scrims, roster hunting and every event drop.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-neon-cyan">Join →</span>
              </a>
            </TiltCard>
          </div>

          <div data-reveal style={{ transitionDelay: "90ms" }}>
            <TiltCard max={5}>
              <a href={telHref} className="card-glow block h-full p-7">
                <p className="field-label">Talk to us</p>
                <p className="font-display text-xl font-bold text-neon-cyan">{lounge.phone}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Bookings, tournament questions, or anything the site does not answer.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-neon-cyan">Call →</span>
              </a>
            </TiltCard>
          </div>

          {lounge.address ? (
            <div data-reveal style={{ transitionDelay: "180ms" }}>
              <TiltCard max={5}>
                <div className="card-glow h-full p-7">
                  <p className="field-label">Where</p>
                  <p className="font-display text-xl font-bold text-neon-magenta">{lounge.address}</p>
                  {lounge.hours && <p className="mt-2 text-sm text-zinc-400">{lounge.hours}</p>}
                  {lounge.mapsUrl && (
                    <a
                      href={lounge.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-sm font-semibold text-neon-cyan"
                    >
                      Get directions →
                    </a>
                  )}
                </div>
              </TiltCard>
            </div>
          ) : (
            <div data-reveal style={{ transitionDelay: "180ms" }}>
              <TiltCard max={5}>
                <div className="card-glow h-full p-7">
                  <p className="field-label">Where</p>
                  <p className="font-display text-xl font-bold text-neon-magenta">Lebanon</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Message us for directions and opening hours - we will point you straight to the door.
                  </p>
                </div>
              </TiltCard>
            </div>
          )}
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div data-reveal className="card relative overflow-hidden p-10 text-center sm:p-14">
          <div className="absolute inset-0 grid-bg" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-3xl font-black uppercase sm:text-4xl">
              Ready for <span className="neon-cyan">the next one?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              Look at what {tournament.shortName} paid out, then get in the Discord so you hear about
              the next bracket before it fills.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={routes.prizes} className="btn-primary px-9 py-4">
                See the prize pool
              </Link>
              <a
                href={lounge.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost px-9 py-4"
              >
                Join the Discord
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
