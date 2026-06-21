/**
 * Tournament configuration — edit these placeholders before launch.
 * Everything here is public-facing copy. Secrets belong in .env.local.
 */

// Registration always closes this many days before kickoff.
export const REGISTRATION_CLOSES_DAYS_BEFORE = 7;

// ISO date string used by the countdown timer (placeholder).
const startDate = "2026-08-01T18:00:00+03:00";

/**
 * Derive the registration deadline label from the start date so it is always
 * exactly REGISTRATION_CLOSES_DAYS_BEFORE days before kickoff, in the
 * tournament's local timezone. Formatted manually (no locale/TZ lookup) so the
 * server and client render identical strings — no hydration mismatch.
 */
function deriveRegistrationDeadlineLabel(startIso: string, daysBefore: number) {
  const offset = startIso.match(/([+-])(\d{2}):?(\d{2})$/);
  const offsetMin = offset
    ? (offset[1] === "-" ? -1 : 1) * (Number(offset[2]) * 60 + Number(offset[3]))
    : 0;
  const ms = new Date(startIso).getTime() - daysBefore * 86_400_000;
  const local = new Date(ms + offsetMin * 60_000); // shift so UTC getters read local time
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  let h = local.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${months[local.getUTCMonth()]} ${local.getUTCDate()}, ${local.getUTCFullYear()} — ${h}:${mm} ${ampm}`;
}

export const tournament = {
  name: "RESPAWN CS2 SHOWDOWN",
  shortName: "CS2 Showdown",
  organizer: "Respawn Gaming Lounge",
  // Collaboration partner — co-hosting the tournament with Respawn.
  partner: "LERF",
  startDate,
  startDateLabel: "August 1, 2026 — 6:00 PM",
  registrationClosesDaysBefore: REGISTRATION_CLOSES_DAYS_BEFORE,
  registrationDeadlineLabel: deriveRegistrationDeadlineLabel(startDate, REGISTRATION_CLOSES_DAYS_BEFORE),
  prizePool: "$5,000",
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
