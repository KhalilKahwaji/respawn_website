/**
 * Tournament configuration - edit these placeholders before launch.
 * Everything here is public-facing copy. Secrets belong in .env.local.
 */

// Registration always closes this many days before kickoff.
export const REGISTRATION_CLOSES_DAYS_BEFORE = 7;

// ISO date string used by the countdown timer (placeholder).
const startDate = "2026-08-10T18:00:00+03:00";

// Registration closes exactly this many ms before kickoff - the raw cutoff
// used to gate new registrations, in addition to the human-readable label.
const registrationDeadlineMs = new Date(startDate).getTime() - REGISTRATION_CLOSES_DAYS_BEFORE * 86_400_000;

/**
 * Format the registration deadline in the tournament's local timezone.
 * Formatted manually (no locale/TZ lookup) so the server and client render
 * identical strings - no hydration mismatch.
 */
function formatDeadlineLabel(ms: number, startIso: string) {
  const offset = startIso.match(/([+-])(\d{2}):?(\d{2})$/);
  const offsetMin = offset
    ? (offset[1] === "-" ? -1 : 1) * (Number(offset[2]) * 60 + Number(offset[3]))
    : 0;
  const local = new Date(ms + offsetMin * 60_000); // shift so UTC getters read local time
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  let h = local.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${months[local.getUTCMonth()]} ${local.getUTCDate()}, ${local.getUTCFullYear()} - ${h}:${mm} ${ampm}`;
}

export const tournament = {
  name: "RESPAWN CS2 SHOWDOWN",
  shortName: "CS2 Showdown",
  organizer: "Respawn Gaming Lounge",
  // Collaboration partner - co-hosting the tournament with Respawn.
  partner: "LERF",
  startDate,
  startDateLabel: "August 10, 2026 - 6:00 PM",
  registrationClosesDaysBefore: REGISTRATION_CLOSES_DAYS_BEFORE,
  // Raw cutoff instant - compare against Date.now() to gate registration.
  registrationDeadline: new Date(registrationDeadlineMs),
  registrationDeadlineLabel: formatDeadlineLabel(registrationDeadlineMs, startDate),
  prizePool: "$4,000",
  entryFee: "$125 / team",
  format: "5v5 - Double Elimination",
  maxTeams: 16,
  // Whish payment details
  whishNumber: "+961 81 632 209",
  whishAccountName: "Respawn Gaming Lounge",
  // Faceit tournament link - only revealed to approved teams. Null hides
  // the "join tournament" link/button entirely until the championship
  // actually exists on Faceit - set the real URL here to bring it back.
  faceitTournamentUrl: null as string | null,
  discordServerUrl: "https://discord.gg/Wh6TSJW3JY",
  contactPhone: "+961 81 632 209",
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
