import HeroBackground from "@/components/HeroBackground";
import ReviewForm from "@/components/ReviewForm";
import { tournament } from "@/lib/config";

export const metadata = {
  title: "Leave a Review",
  description:
    `Tell us what you thought of ${tournament.name}. Anonymous feedback in under a minute - ` +
    `it's how ${tournament.organizer} makes the next CS2 tournament in Lebanon better.`,
  alternates: { canonical: "/review" },
};

export default function ReviewPage() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-14 pb-10 text-center sm:pt-20 sm:pb-12">
          <p className="section-eyebrow animate-rise">{tournament.shortName} · Feedback</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase leading-tight animate-rise sm:text-6xl">
            Rate the <span className="neon-cyan">tournament</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400 animate-rise sm:text-lg">
            Give us a {" "}
            <span className="text-neon-magenta font-semibold">100% anonymous</span>review so we can be better!
          </p>
        </div>
      </section>

      {/* ---------- FORM ---------- */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <ReviewForm />

        <p className="mt-8 text-center text-xs text-muted">
          Got something that needs an actual reply? Reach us on{" "}
          <a
            href={tournament.discordServerUrl}
            target="_blank"
            rel="noreferrer"
            className="text-neon-cyan hover:underline"
          >
            Discord
          </a>{" "}
          instead - this form can't be replied to, by design.
        </p>
      </section>
    </>
  );
}
