import Link from "next/link";
import CountUp from "@/components/CountUp";
import LoungeHero from "@/components/LoungeHero";
import MagneticButton from "@/components/MagneticButton";
import Marquee from "@/components/Marquee";
import RevealOnScroll from "@/components/RevealOnScroll";
import SocialLinks from "@/components/SocialLinks";
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

/** Bento sizing - the first card is the wide one, then a 2/3 + 1/3 pair. */
const bentoSpan = ["md:col-span-4", "md:col-span-2", "md:col-span-3", "md:col-span-3"];

const statusStyles: Record<string, { label: string; cls: string }> = {
  finished: { label: "Completed", cls: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300" },
  upcoming: { label: "Upcoming", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  live: { label: "Live now", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
};

/** Shared section header: counter, eyebrow, title, drawn rule. */
function SectionHead({
  index,
  eyebrow,
  children,
  blurb,
}: {
  index: string;
  eyebrow: string;
  children: React.ReactNode;
  blurb?: string;
}) {
  return (
    <div data-reveal className="text-center">
      <div className="flex items-center justify-center gap-4">
        <span className="section-index">{index}</span>
        <span className="h-px w-8 bg-edge" />
        <p className="section-eyebrow">{eyebrow}</p>
      </div>
      <h2 className="section-title mt-4">{children}</h2>
      {blurb && <p className="mx-auto mt-5 max-w-2xl text-zinc-400">{blurb}</p>}
      <div className="rule-draw mx-auto mt-7 max-w-[14rem]" />
    </div>
  );
}

export default function LoungeHomePage() {
  const event = tournamentIndex[0];
  const status = statusStyles[event.status];

  return (
    <>
      <RevealOnScroll />
      {/* Scroll-revealed blocks start hidden - show everything if JS is off. */}
      <noscript>
        <style>{"[data-reveal]{opacity:1 !important;transform:none !important}"}</style>
      </noscript>
      <div className="grain" aria-hidden />

      <LoungeHero />

      <Marquee items={tickerItems} />

      {/* ---------- 01 · BY THE NUMBERS ---------- */}
      <section className="relative overflow-hidden py-24">
        <div className="mesh mesh-cyan" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionHead index="01 / 04" eyebrow="Track record">
            What we&apos;ve <span className="neon-cyan">put on</span>
          </SectionHead>

          <div data-reveal className="mt-14">
            <div className="hud card grid grid-cols-2 gap-px overflow-hidden bg-edge/60 lg:grid-cols-4">
              {loungeStats.map((s, i) => (
                <div key={s.label} className="group bg-panel/90 px-5 py-9 text-center transition-colors hover:bg-panel">
                  <p className="font-display text-4xl font-black sm:text-5xl">
                    <CountUp
                      value={s.value}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      className={i === 0 ? "prize-gold" : "text-zinc-100"}
                    />
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-muted">{s.label}</p>
                  <span className="mx-auto mt-4 block h-px w-8 bg-neon-cyan/0 transition-all duration-500 group-hover:w-16 group-hover:bg-neon-cyan/60" />
                </div>
              ))}
            </div>
          </div>

          <p data-reveal className="mt-6 text-center text-xs text-muted">
            Figures from {tournament.name} · {tournament.startDateLabel}.
          </p>
        </div>
      </section>

      {/* ---------- 02 · THE ARENA ---------- */}
      <section id="arena" className="relative scroll-mt-24 overflow-hidden border-y border-edge/50 py-24">
        <div className="mesh mesh-magenta" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionHead
            index="02 / 04"
            eyebrow="The arena"
            blurb={`${lounge.name} runs the competitive end of Lebanese gaming - brackets that pay out, finals with an audience, and a community that shows up for both.`}
          >
            More than a room <span className="neon-magenta">full of PCs</span>
          </SectionHead>

          <div className="mt-16 grid gap-4 md:grid-cols-6">
            {loungeOfferings.map((o, i) => (
              <div
                key={o.title}
                data-reveal
                className={`${bentoSpan[i]} h-full`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <TiltCard max={4} className="h-full">
                  <article
                    className={`hud ${i % 2 ? "hud-magenta" : ""} card-glow flex h-full flex-col p-7 sm:p-8`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border font-display text-sm font-black ${accentRing[o.accent]} ${accentText[o.accent]}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-edge to-transparent" />
                    </div>
                    <h3
                      className={`mt-5 font-display font-bold uppercase tracking-wide ${accentText[o.accent]} ${
                        i === 0 ? "text-2xl sm:text-3xl" : "text-xl"
                      }`}
                    >
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

      {/* ---------- 03 · TOURNAMENTS ---------- */}
      <section id="tournaments" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24">
        <SectionHead index="03 / 04" eyebrow="Tournaments">
          The <span className="neon-cyan">events</span>
        </SectionHead>

        <div data-reveal className="mt-16">
          <Link href={event.href} className="group block">
            <article className="poster p-8 sm:p-12">
              <span className="poster-year" aria-hidden>
                2026
              </span>

              <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`pill ${status.cls}`}>{status.label}</span>
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
                      {event.game}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-5xl font-black uppercase leading-[0.9] sm:text-7xl">
                    <span className="heatwave-text">{event.shortName}</span>
                  </h3>

                  <p className="mt-4 text-sm text-zinc-400">
                    {event.format} · {event.dateLabel}
                    {event.partner ? ` · with ${event.partner}` : ""}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                    <div>
                      <p className="prize-gold font-display text-3xl font-black">{event.prizePool}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted">Prize pool</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl font-black text-neon-cyan">{tournament.maxTeams}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted">Teams</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl font-black text-neon-magenta">
                        {tournament.maxTeams * 5}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted">Players</p>
                    </div>
                  </div>

                  <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">
                    Prizes · Rules · Sponsors · Leave a review
                  </p>
                </div>

                <div className="flex shrink-0 justify-center lg:justify-end">
                  <span className="disc">
                    Open
                    <br />
                    archive
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </div>

        <p data-reveal className="mt-10 text-center text-sm text-zinc-500">
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
      <section className="relative overflow-hidden border-y border-edge/50 py-24">
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-12 px-4 text-center lg:flex-row lg:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/respawn-death-respawn.webp"
            alt=""
            data-reveal
            className="float h-40 w-auto drop-shadow-[0_0_36px_rgba(232,121,249,0.4)] sm:h-56"
          />
          <div data-reveal style={{ transitionDelay: "120ms" }}>
            <h2 className="font-display text-4xl font-black uppercase leading-[1.05] sm:text-6xl">
              <span className="glitch" data-text="Lose the round.">
                Lose the round.
              </span>
              <br />
              <span className="neon-cyan">Respawn.</span>{" "}
              <span className="text-zinc-300">Run it back.</span>
            </h2>
            <p className="mt-6 max-w-lg text-zinc-400">
              Every bracket has one winner and fifteen teams that come back sharper. That is the whole
              point of the name - and of the room.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- 04 · VISIT ---------- */}
      <section id="visit" className="relative scroll-mt-24 overflow-hidden py-24">
        <div className="mesh mesh-cyan" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionHead index="04 / 04" eyebrow="Get in touch">
            Find <span className="neon-magenta">the lounge</span>
          </SectionHead>

          <div className="mt-16 grid gap-4 lg:grid-cols-5">
            {/* Directions */}
            <div data-reveal className="lg:col-span-3">
              <a
                href={lounge.mapsUrl ?? lounge.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="map-card group flex h-full min-h-[19rem] flex-col justify-between p-8"
              >
                <div className="relative flex items-center gap-3">
                  <span className="map-pin" aria-hidden />
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
                    Respawn · Lebanon
                  </span>
                </div>

                <div className="relative">
                  <p className="font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
                    {lounge.address ?? (
                      <>
                        Pull up to <span className="neon-cyan">the lounge</span>
                      </>
                    )}
                  </p>
                  {lounge.hours && <p className="mt-3 text-sm text-zinc-400">{lounge.hours}</p>}
                  <p className="mt-3 max-w-sm text-sm text-zinc-400">
                    Open the map for the exact spot, parking and the fastest way in.
                  </p>
                  <span className="btn-ghost btn-sm mt-6 inline-flex transition-transform duration-300 group-hover:translate-x-1">
                    Get directions →
                  </span>
                </div>
              </a>
            </div>

            {/* Instagram + Discord */}
            <div className="grid gap-4 lg:col-span-2">
              {lounge.instagramUrl && (
                <div data-reveal className="h-full" style={{ transitionDelay: "90ms" }}>
                  <TiltCard max={5} className="h-full">
                    <a
                      href={lounge.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hud hud-magenta card-glow block h-full p-7"
                    >
                      <p className="field-label">Follow</p>
                      <p className="font-display text-xl font-bold text-neon-magenta">@respawn.lb</p>
                      <p className="mt-2 text-sm text-zinc-400">
                        Clips, event nights and what the room actually looks like.
                      </p>
                      <span className="mt-4 inline-block text-sm font-semibold text-neon-cyan">
                        Instagram →
                      </span>
                    </a>
                  </TiltCard>
                </div>
              )}

              <div data-reveal className="h-full" style={{ transitionDelay: "180ms" }}>
                <TiltCard max={5} className="h-full">
                  <a
                    href={lounge.discordUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hud card-glow block h-full p-7"
                  >
                    <p className="field-label">Community</p>
                    <p className="font-display text-xl font-bold text-neon-violet">Discord</p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Announcements, scrims, roster hunting and every event drop.
                    </p>
                    <span className="mt-4 inline-block text-sm font-semibold text-neon-cyan">Join →</span>
                  </a>
                </TiltCard>
              </div>
            </div>
          </div>

          <div data-reveal className="mt-10 flex flex-col items-center gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
              Or just call · {lounge.phone}
            </p>
            <SocialLinks />
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div data-reveal className="hud card relative overflow-hidden p-12 text-center sm:p-16">
          <div className="absolute inset-0 grid-bg" aria-hidden />
          <div className="mesh mesh-magenta" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-4xl font-black uppercase sm:text-5xl">
              Ready for <span className="neon-cyan">the next one?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-zinc-400">
              Look at what {tournament.shortName} paid out, then get in the Discord so you hear about
              the next bracket before it fills.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton>
                <Link href={routes.prizes} className="btn-primary px-9 py-4">
                  See the prize pool
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a
                  href={lounge.discordUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost px-9 py-4"
                >
                  Join the Discord
                </a>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
