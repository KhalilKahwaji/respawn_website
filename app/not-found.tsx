import Link from "next/link";
import HeroBackground from "@/components/HeroBackground";
import { routes } from "@/lib/config";

export const metadata = { title: "Page Not Found - Respawn" };

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-24 sm:py-32 text-center">
        <p className="section-eyebrow animate-rise">Error 404</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/respawn-logo-animated.gif"
          alt="Respawn"
          className="mx-auto mt-6 h-20 sm:h-28 w-auto animate-rise drop-shadow-[0_0_30px_rgba(168,85,247,0.45)]"
        />

        <h1 className="mt-6 font-display font-black uppercase leading-none tracking-tight text-4xl sm:text-6xl animate-rise">
          <span className="neon-cyan">Page</span>{" "}
          <span className="neon-magenta">Not Found</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base sm:text-lg text-zinc-400 animate-rise">
          This spot didn&apos;t make the bracket. The page you&apos;re looking for got taken out early.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-rise">
          <Link href="/" className="btn-primary text-base px-9 py-4">
            Back to Base
          </Link>
          <Link href={routes.rules} className="btn-ghost text-base px-9 py-4">
            View Rules
          </Link>
        </div>
      </div>
    </section>
  );
}
