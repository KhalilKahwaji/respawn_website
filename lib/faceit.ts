/**
 * Faceit Data API integration — fully optional.
 *
 * The Faceit Data API does NOT support registering teams into a championship
 * programmatically on behalf of users, so the official bracket stays on Faceit
 * and this site handles registration/payment/approval. Approved captains get
 * the championship link.
 *
 * If you set FACEIT_API_KEY in .env.local, registration will *verify* each
 * player's Faceit username exists and enrich it with level/ELO. Without a key,
 * everything still works — verification is simply skipped.
 *
 * Docs: https://docs.faceit.com/docs/data-api/data
 */

export interface FaceitPlayer {
  player_id: string;
  nickname: string;
  country?: string;
  skill_level?: number; // 1–10
  elo?: number;
  steam_id_64?: string;
  faceit_url?: string;
}

const BASE = "https://open.faceit.com/data/v4";

function apiKey(): string | null {
  return process.env.FACEIT_API_KEY || null;
}

export function faceitEnabled(): boolean {
  return Boolean(apiKey());
}

/** Look up a Faceit player by nickname. Returns null if not found or API disabled. */
export async function getFaceitPlayer(nickname: string): Promise<FaceitPlayer | null> {
  const key = apiKey();
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}/players?nickname=${encodeURIComponent(nickname)}`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const cs2 = data?.games?.cs2;
    return {
      player_id: data.player_id,
      nickname: data.nickname,
      country: data.country,
      skill_level: cs2?.skill_level,
      elo: cs2?.faceit_elo,
      steam_id_64: data?.steam_id_64 || data?.games?.cs2?.game_player_id,
      faceit_url: data?.faceit_url?.replace("{lang}", "en"),
    };
  } catch {
    return null;
  }
}

export interface FaceitCheckResult {
  username: string;
  exists: boolean;
  level?: number;
  elo?: number;
  steamMatches?: boolean; // Steam64 on Faceit matches the one submitted
}

/**
 * Soft verification used during registration: never blocks a registration on
 * API failure — results are surfaced to admins for review instead.
 */
export async function verifyFaceitPlayers(
  players: { faceit_username: string; steam64_id: string }[],
): Promise<FaceitCheckResult[] | null> {
  if (!faceitEnabled()) return null;
  const results: FaceitCheckResult[] = [];
  for (const p of players) {
    const fp = await getFaceitPlayer(p.faceit_username);
    results.push({
      username: p.faceit_username,
      exists: Boolean(fp),
      level: fp?.skill_level,
      elo: fp?.elo,
      steamMatches: fp?.steam_id_64 ? fp.steam_id_64 === p.steam64_id : undefined,
    });
  }
  return results;
}

/* ---------------------------------------------------------------------------
 * Future hooks (already supported by the Data API, wire up when needed):
 *  - GET /championships/{id}                → tournament details
 *  - GET /championships/{id}/subscriptions  → registered teams on Faceit
 *  - GET /championships/{id}/matches        → bracket / results for a live page
 * ------------------------------------------------------------------------- */
