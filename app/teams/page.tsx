import { serviceClient } from "@/lib/supabase-server";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PublicTeamRow {
  team_name: string;
  team_logo_url: string | null;
  players: { nickname: string; role: string; is_captain: boolean }[];
}

async function getApprovedTeams(): Promise<PublicTeamRow[] | null> {
  try {
    const db = serviceClient();
    // Only approved teams, only public-safe columns — no phones, no emails.
    const { data, error } = await db
      .from("teams")
      .select("team_name, team_logo_url, players(nickname, role, is_captain)")
      .eq("status", "approved")
      .order("updated_at", { ascending: true });
    if (error) return null;
    return data as unknown as PublicTeamRow[];
  } catch {
    return null;
  }
}

export default async function TeamsPage() {
  const teams = await getApprovedTeams();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="section-eyebrow">Confirmed Lineups</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black uppercase">
        Approved <span className="neon-magenta">teams</span>
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-400">
        Every team below has registered and had its payment verified by an admin. Player nicknames only —
        contact details stay private.
      </p>

      {teams === null ? (
        <div className="card mt-10 p-10 text-center text-zinc-500">
          Couldn&apos;t load teams right now. Refresh in a moment.
        </div>
      ) : teams.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <p className="font-display text-xl text-zinc-400">No approved teams yet</p>
          <p className="mt-2 text-sm text-zinc-500">Be the first lineup on the board.</p>
          <Link href="/register" className="btn-primary mt-6">Register your team</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => {
            const captain = t.players.find((p) => p.is_captain);
            const mains = t.players.filter((p) => p.role === "main");
            const bench = t.players.filter((p) => p.role === "bench");
            return (
              <article key={t.team_name} className="card-glow overflow-hidden">
                <div className="flex items-center gap-4 border-b border-edge p-5">
                  {t.team_logo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={t.team_logo_url} alt="" className="h-14 w-14 rounded-xl border border-edge object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-edge bg-void/60 font-display text-lg text-neon-cyan">
                      {t.team_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-lg font-bold">{t.team_name}</h2>
                    {captain && (
                      <p className="truncate text-xs text-muted">
                        CPT <span className="text-neon-magenta">{captain.nickname}</span>
                      </p>
                    )}
                  </div>
                  <span className="pill-approved">
                    <span className="pill-dot bg-current" /> Approved
                  </span>
                </div>
                <ul className="grid grid-cols-2 gap-2 p-5 text-sm">
                  {mains.map((p) => (
                    <li key={p.nickname} className="truncate rounded-lg border border-edge/70 bg-void/40 px-3 py-2 text-zinc-300">
                      <span className="mr-1.5 text-[10px] uppercase text-neon-cyan">M</span>
                      {p.nickname}
                      {p.is_captain && <span className="ml-1 text-neon-magenta">★</span>}
                    </li>
                  ))}
                  {bench.map((p) => (
                    <li key={p.nickname} className="truncate rounded-lg border border-neon-magenta/30 bg-neon-magenta/5 px-3 py-2 text-zinc-300">
                      <span className="mr-1.5 text-[10px] uppercase text-neon-magenta">B</span>
                      {p.nickname}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
