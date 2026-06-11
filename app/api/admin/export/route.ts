import { NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/supabase-server";
import { STATUS_LABELS, TeamStatus } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Exports one row per PLAYER with team columns repeated — opens cleanly in
 * Excel / Google Sheets and pivots easily. Import into Google Sheets via
 * File > Import, or set up an Apps Script to pull it on a schedule.
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = serviceClient();
  const { data: teams, error } = await db
    .from("teams")
    .select("*, players(*)")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Export failed" }, { status: 500 });

  const header = [
    "registration_code", "team_name", "status", "captain_name", "captain_phone",
    "captain_email", "captain_discord", "preferred_contact", "registered_at",
    "player_full_name", "player_nickname", "player_role", "player_is_captain",
    "player_phone", "player_steam64_id", "player_steam_profile", "player_faceit_username",
    "player_faceit_profile", "player_discord", "admin_notes",
  ];

  const rows: string[] = [header.join(",")];
  for (const t of teams ?? []) {
    const players = (t.players ?? []).sort((a: any, b: any) =>
      a.role === b.role ? 0 : a.role === "main" ? -1 : 1,
    );
    for (const p of players) {
      rows.push(
        [
          t.registration_code, t.team_name, STATUS_LABELS[t.status as TeamStatus] ?? t.status,
          t.captain_name, t.captain_phone, t.captain_email, t.captain_discord,
          t.preferred_contact, t.created_at,
          p.full_name, p.nickname, p.role, p.is_captain ? "yes" : "no",
          p.phone, p.steam64_id, p.steam_profile_url, p.faceit_username,
          p.faceit_profile_url, p.discord_username, t.admin_notes,
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }

  return new NextResponse("\uFEFF" + rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="respawn-cs2-teams-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
