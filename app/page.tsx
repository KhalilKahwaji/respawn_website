import Link from "next/link";
import { tournament } from "@/lib/config";
import Countdown from "@/components/Countdown";
import HeroBackground from "@/components/HeroBackground";

const stats = [
  { label: "Prize Pool", value: tournament.prizePool, accent: "neon-magenta" },
  { label: "Entry Fee", value: tournament.entryFee, accent: "" },
  { label: "Format", value: "5v5", accent: "" },
  { label: "Team Slots", value: `${tournament.maxTeams}`, accent: "neon-cyan" },
];

const flow = [
  { title: "Register your team", desc: "Captain submits the full roster — 5 mains + 1 bench — with Steam and Faceit details." },
  { title: "Pay via Whish", desc: "Send the entry fee to our Whish number and include your registration code in the note." },
  { title: "Upload proof", desc: "Upload your payment screenshot. Our admins review every payment manually." },
  { title: "Get approved", desc: "Once approved, your team goes public and the captain receives the Faceit tournament link." },
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

          {/* Co-branded lockup — Respawn × LERF */}
          <div className="mx-auto mt-6 flex items-center justify-center gap-5 sm:gap-8 animate-rise">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Respawn"
              className="h-20 sm:h-32 w-auto animate-flicker drop-shadow-[0_0_30px_rgba(168,85,247,0.45)]"
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
            <span className="block text-4xl sm:text-7xl">
              <span className="neon-cyan">CS2</span>{" "}
              <span className="neon-magenta">Showdown</span>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-zinc-400">
            {tournament.organizer} & {tournament.partner} present a {tournament.format.toLowerCase()} battle for{" "}
            <span className="text-neon-magenta font-semibold">{tournament.prizePool}</span>.
            Bring your five. Earn your respawn.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-rise">
            <Link href="/register" className="btn-primary text-base px-9 py-4 animate-pulseGlow">
              Register Your Team
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
                Registration closes {tournament.registrationClosesDaysBefore} days before kickoff
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted">Last day to register</p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-black text-white">
                {tournament.registrationDeadlineLabel}
              </p>
              <Link href="/register" className="btn-primary btn-sm mt-4">
                Register before it closes
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
            <span className="text-neon-cyan font-semibold">Registration deadline:</span>{" "}
            {tournament.registrationDeadlineLabel}{" "}
            <span className="text-muted">({tournament.registrationClosesDaysBefore} days before kickoff)</span>
          </p>
          <p className="text-sm text-zinc-400">
            Payment via <span className="text-neon-magenta font-semibold">Whish</span> · manual admin approval
          </p>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-10 pb-4">
        <p className="section-eyebrow text-center">Path to the server</p>
        <h2 className="mt-3 text-center font-display text-3xl sm:text-4xl font-bold uppercase">
          From sign-up to <span className="neon-cyan">first pistol round</span>
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

      {/* ---------- FINAL CTA ---------- */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="card relative overflow-hidden p-10 sm:p-14">
          <div className="absolute inset-0 grid-bg" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase">
              Slots are <span className="neon-magenta">limited</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              Only {tournament.maxTeams} teams make it in — and only approved teams hold a slot.
              Lock yours before the deadline.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary px-9 py-4">
                Register Your Team
              </Link>
              <Link href="/status" className="btn-ghost px-9 py-4">
                Check Registration
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
