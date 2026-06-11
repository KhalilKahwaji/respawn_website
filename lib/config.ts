/**
 * Tournament configuration — edit these placeholders before launch.
 * Everything here is public-facing copy. Secrets belong in .env.local.
 */
export const tournament = {
  name: "RESPAWN CS2 SHOWDOWN",
  shortName: "CS2 Showdown",
  organizer: "Respawn Gaming Lounge",
  // ISO date string used by the countdown timer (placeholder)
  startDate: "2026-08-01T18:00:00+03:00",
  startDateLabel: "July 20, 2026 — 6:00 PM",
  registrationDeadlineLabel: "August 10, 2026 — 11:59 PM",
  prizePool: "$1,500", // placeholder
  entryFee: "$50 / team", // placeholder
  format: "5v5 — Single Elimination (BO1, Finals BO3)",
  maxTeams: 32,
  // Whish payment details (placeholder — set the real number before launch)
  whishNumber: "+961 XX XXX XXX",
  whishAccountName: "Respawn Gaming Lounge",
  // Faceit tournament link — only revealed to approved teams
  faceitTournamentUrl: "https://www.faceit.com/en/championship/REPLACE_ME",
  discordServerUrl: "https://discord.gg/REPLACE_ME",
  contactPhone: "+961 XX XXX XXX",
  location: "Respawn Gaming Lounge / Online via Faceit",
  codePrefix: "RGL-CS2",
};

export const STATUSES = [
  "pending_payment",
  "under_review",
  "approved",
  "rejected",
  "missing_info",
] as const;

export type TeamStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<TeamStatus, string> = {
  pending_payment: "Pending Payment",
  under_review: "Payment Under Review",
  approved: "Approved",
  rejected: "Rejected",
  missing_info: "Missing Information",
};
