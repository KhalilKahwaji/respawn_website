import Link from "next/link";
import { prizes, tournament } from "@/lib/config";
import Countdown from "@/components/Countdown";
import HeroBackground from "@/components/HeroBackground";

const firstPlace = prizes[0];

const stats = [
  { label: "Prize Pool", value: tournament.prizePool, accent: "neon-magenta" },
  { label: "1st Place", value: firstPlace.label, accent: "prize-gold" },
  { label: "Format", value: "5v5", accent: "" },
  { label: "Team Slots", value: `${tournament.maxTeams}`, accent: "neon-cyan" },
];

const flow = [
  { title: "Rosters locked", desc: `Registration is closed - the ${tournament.maxTeams} approved teams are the ones playing.` },
  { title: "Online bracket", desc: "Double elimination on Faceit. Upper bracket BO1, lower bracket BO3 - two losses and you're out." },
  { title: "Live semifinals", desc: `The final four play on stage at ${tournament.organizer}, in front of a crowd.` },
  { title: "Grand final", desc: `A BO5 for the title and the ${firstPlace.label} top prize - the podium is paid on the night.` },
];

export default function HomePage() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <p className="section-eyebrow animate-rise">
            Official Tournament · A {tournament.organizer} × {tournament.partner} Collaboration
          </p>

          {/* Co-branded lockup - Respawn × LERF */}
          <div className="mx-auto mt-6 flex items-center justify-center gap-5 sm:gap-8 animate-rise">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/respawn-headshot.webp"
              alt="Respawn"
              className="h-20 sm:h-32 w-auto drop-shadow-[0_0_30px_rgba(168,85,247,0.45)]"
            />
            <span className="font-display text-3xl sm:text-5xl font-black text-muted/70 leading-none">×</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lerf.webp"
              alt={tournament.partner}
              className="h-16 sm:h-24 w-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.35)]"
            />
          </div>

          <h1 className="mt-4 font-display font-black uppercase leading-none tracking-tight">
            <span className="heatwave-text block text-4xl sm:text-7xl">Heatwave 2026</span>
            <span className="mt-2 block text-lg sm:text-3xl tracking-[0.3em] text-zinc-300">Tournament</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-zinc-400">
            {tournament.organizer} & {tournament.partner} present a {tournament.format.toLowerCase()} battle for{" "}
            <span className="text-neon-magenta font-semibold">{tournament.prizePool}</span>.
            Bring your five. Earn your respawn.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-rise">
            <Link href="/prizes" className="btn-primary text-base px-9 py-4 animate-pulseGlow">
              See the Prize Pool
            </Link>
            <Link href="/rules" className="btn-ghost text-base px-9 py-4">
              View Rules
            </Link>
          </div>

          <div className="mt-14">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-muted">Tournament starts in</p>
            <Countdown target={tournament.startDate} />
            <p className="mt-5 text-sm text-zinc-500">
              {tournament.startDateLabel} · {tournament.location}
            </p>
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border-2 border-neon-magenta/60 bg-neon-magenta/5 px-6 py-5 animate-pulseGlow">
              <p className="flex items-center justify-center gap-2 font-display text-sm sm:text-base font-bold uppercase tracking-[0.2em] text-neon-magenta">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-magenta opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon-magenta" />
                </span>
                Playing for {tournament.prizePool} in cash
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted">Champions take home</p>
              <p className="prize-gold mt-1 font-display text-3xl sm:text-4xl font-black">{firstPlace.label}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {prizes.slice(1).map((p) => `${p.ordinal} ${p.label}`).join(" · ")}
              </p>
              <Link href="/prizes" className="btn-primary btn-sm mt-4">
                Full prize breakdown
              </Link>
            </div>
          </div>
        </div>
      </section>

      <hr className="tube mx-auto max-w-4xl" />

      {/* ---------- KEY FACTS ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card-glow p-6 text-center">
              <p className={`font-display text-2xl sm:text-3xl font-bold ${s.accent}`}>{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="card mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4">
          <p className="text-sm text-zinc-400">
            <span className="text-neon-cyan font-semibold">Prize distribution:</span>{" "}
            {prizes.map((p) => `${p.ordinal} ${p.label}`).join(" · ")}
          </p>
          <Link href="/prizes" className="text-sm font-semibold text-neon-magenta hover:text-neon-pink transition-colors">
            See the full breakdown →
          </Link>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-10 pb-4">
        <p className="section-eyebrow text-center">Path to the server</p>
        <h2 className="mt-3 text-center font-display text-3xl sm:text-4xl font-bold uppercase">
          From first pistol round to <span className="neon-cyan">the payout</span>
        </h2>

        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {flow.map((step, i) => (
            <li key={step.title} className="card-glow relative p-6">
              <span className="font-mono text-xs text-neon-magenta">STEP {i + 1} / 4</span>
              <h3 className="mt-3 font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- ABOUT / SEO ---------- */}
      <section className="mx-auto max-w-4xl px-4 py-14 text-center">
        <p className="section-eyebrow">The Venue</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold uppercase">
          Lebanon&apos;s <span className="neon-magenta">esports arena</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-zinc-400 leading-relaxed">
          {tournament.organizer} is a premier gaming lounge in Lebanon and the home of competitive
          Counter-Strike 2. Together with {tournament.partner}, the Lebanese Esports Federation, we host
          esports tournaments that bring the local scene together - online on Faceit, with the semifinals
          and finals played live on stage at the lounge in front of a crowd.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-400 leading-relaxed">
          Whether you grind Faceit from home or pull up to the best gaming setup in town, {tournament.shortName}{" "}
          is your shot at a {tournament.prizePool} prize pool - and at settling who really runs Lebanon&apos;s CS2 scene.
        </p>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="card relative overflow-hidden p-10 sm:p-14">
          <div className="absolute inset-0 grid-bg" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase">
              <span className="prize-gold">{tournament.prizePool}</span> on the line
            </h2>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              {tournament.maxTeams} teams, one bracket, four places that pay. See exactly what every
              podium finish is worth.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/prizes" className="btn-primary px-9 py-4">
                Prize Distribution
              </Link>
              <a
                href={tournament.discordServerUrl}
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
