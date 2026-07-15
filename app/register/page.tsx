import Link from "next/link";
import { serviceClient } from "@/lib/supabase-server";
import { tournament } from "@/lib/config";
import RegisterForm from "@/components/RegisterForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Register Your CS2 Team",
  description: `Register your 5v5 CS2 team for ${tournament.name} - a ${tournament.prizePool} esports tournament in Lebanon by ${tournament.organizer} × ${tournament.partner}. Limited to ${tournament.maxTeams} teams.`,
  alternates: { canonical: "/register" },
};

/** Slots taken by any team not rejected - rejected teams give their slot back. */
async function getOpenSlots(): Promise<number | null> {
  try {
    const db = serviceClient();
    const { count, error } = await db
      .from("teams")
      .select("id", { count: "exact", head: true })
      .neq("status", "rejected");
    if (error) return null;
    return Math.max(0, tournament.maxTeams - (count ?? 0));
  } catch {
    return null;
  }
}

export default async function RegisterPage() {
  const deadlinePassed = Date.now() > tournament.registrationDeadline.getTime();
  // If the slot count can't be read, don't block registration on it - the
  // /api/register route re-checks capacity server-side on submit anyway.
  const openSlots = await getOpenSlots();
  const isFull = openSlots !== null && openSlots <= 0;

  if (deadlinePassed || isFull) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="card p-10">
          <p className="section-eyebrow">Team Registration</p>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-black uppercase text-rose-300">
            Registration closed
          </h1>
          <p className="mt-4 text-zinc-400">
            {deadlinePassed
              ? "The registration deadline has passed - no new teams can be registered."
              : `All ${tournament.maxTeams} team slots are filled.`}{" "}
            Check the Discord server for waitlist openings or last-minute updates.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <a href={tournament.discordServerUrl} target="_blank" rel="noreferrer" className="btn-primary">
              Join Discord
            </a>
            <Link href="/status" className="btn-ghost">Check your status</Link>
            <Link href="/" className="btn-ghost">Back home</Link>
          </div>
        </div>
      </div>
    );
  }

  return <RegisterForm />;
}
