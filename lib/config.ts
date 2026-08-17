/**
 * Tournament configuration - edit these placeholders before launch.
 * Everything here is public-facing copy. Secrets belong in .env.local.
 */

// ISO date string used by the countdown timer.
const startDate = "2026-08-10T18:00:00+03:00";

export const tournament = {
  name: "RESPAWN HEATWAVE 2026",
  shortName: "Heatwave 2026",
  organizer: "Respawn Gaming Lounge",
  // Collaboration partner - co-hosting the tournament with Respawn.
  partner: "LERF",
  startDate,
  startDateLabel: "August 10, 2026 - 6:00 PM",
  prizePool: "$3,000",
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

/**
 * Prize breakdown. `amount` is the cash paid out of the prize pool; a place
 * with `amount: 0` is a non-cash reward described by `label` (so it stays out
 * of the pool total and the share bars).
 */
export type Prize = {
  place: number;
  /** "1st", "2nd", ... - used for badges and podium blocks. */
  ordinal: string;
  /** Display value: "$1,600" or "$150 voucher". */
  label: string;
  /** Cash contribution to the prize pool, in USD. 0 for non-cash rewards. */
  amount: number;
  /** One-line description of what the place actually wins. */
  note: string;
};

export const prizes: Prize[] = [
  { place: 1, ordinal: "1st", label: "$1,600", amount: 1600, note: `Champions of ${tournament.shortName}` },
  { place: 2, ordinal: "2nd", label: "$900", amount: 900, note: "Grand final runner-up" },
  { place: 3, ordinal: "3rd", label: "$500", amount: 500, note: "Third-place finisher" },
  {
    place: 4,
    ordinal: "4th",
    label: "$150 voucher",
    amount: 0,
    note: `${tournament.organizer} voucher, on top of the ${tournament.prizePool} cash pool`,
  },
];

/** Total cash on the line - always matches the sum of the cash placements. */
export const prizePoolTotal = prizes.reduce((sum, p) => sum + p.amount, 0);

/** Players per team that share a cash prize (the 5 mains). */
export const PRIZE_SPLIT_PLAYERS = 5;

/**
 * Feature switches for public surfaces. Flip a flag back to `true` to bring
 * the surface back everywhere at once - nav, footer, sitemap, robots and the
 * route itself all read from here.
 */
export const features = {
  // Public approved-teams roster. Hidden for now: the route 404s and is kept
  // out of the nav, footer, sitemap and search indexes.
  publicTeamsPage: false,
};

/**
 * The three rated questions on /review. `key` is the database column, so the
 * public form, the API validator and the admin dashboard all stay in sync
 * from this one list. Every rating is optional - a visitor can answer none,
 * some or all of them and still leave a written review.
 */
export const REVIEW_QUESTIONS = [
  {
    key: "rating_experience",
    label: `How much did you enjoy ${tournament.shortName}?`,
    hint: "1 = not at all · 10 = loved every second",
  },
  {
    key: "rating_return",
    label: "How likely are you to play the next one?",
    hint: "1 = never again · 10 = already signing up",
  },
  {
    key: "rating_organization",
    label: "How well was the tournament run?",
    hint: "Scheduling, communication, admins, servers",
  },
] as const;

export type ReviewRatingKey = (typeof REVIEW_QUESTIONS)[number]["key"];

/** Highest rating on the star scale (stars run 1..REVIEW_MAX_RATING). */
export const REVIEW_MAX_RATING = 10;

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
