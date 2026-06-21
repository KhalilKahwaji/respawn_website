import type { TeamStatus } from "./config";

export type PlayerRole = "main" | "bench";

export interface Player {
  id?: string;
  team_id?: string;
  full_name: string;
  nickname: string;
  phone: string;
  steam_profile_url: string;
  steam64_id: string;
  faceit_username: string;
  faceit_profile_url: string;
  discord_username: string;
  role: PlayerRole;
  is_captain: boolean;
}

export interface Team {
  id: string;
  registration_code: string;
  team_name: string;
  team_logo_url: string | null;
  captain_name: string;
  captain_phone: string;
  captain_email: string | null;
  captain_discord: string;
  preferred_contact: string;
  notes: string | null;
  status: TeamStatus;
  payment_proof_path: string | null;
  payment_proof_uploaded_at: string | null;
  admin_notes: string | null;
  missing_fields: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamWithPlayers extends Team {
  players: Player[];
}

/** Safe shape exposed on the public teams page — no contact info. */
export interface PublicTeam {
  team_name: string;
  team_logo_url: string | null;
  captain_nickname: string | null;
  player_nicknames: string[];
  bench_nicknames: string[];
}

/** A tournament sponsor / partner shown on the Sponsors page and footer. */
export interface Sponsor {
  id: string;
  name: string;
  /** Public URL of the logo (in /public or remote). */
  logo_url: string;
  /** Where clicking the sponsor sends visitors. */
  website_url: string;
  /** Optional one-line blurb shown under the name. */
  blurb?: string;
  /** Tier controls prominence: "partner" is featured larger than "sponsor". */
  tier?: "partner" | "sponsor";
}
