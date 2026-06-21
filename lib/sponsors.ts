import type { Sponsor } from "./types";

/**
 * Sponsor source of truth.
 *
 * For now this is a static list so the page and footer render immediately.
 * Later, swap the body of `getSponsors()` to fetch from Supabase or an
 * external API — the route in app/api/sponsors already calls through here,
 * so nothing else has to change.
 */
const SPONSORS: Sponsor[] = [
  {
    id: "lerf",
    name: "LERF",
    logo_url: "/lerf.webp",
    website_url: "https://lerf.com.lb/",
    blurb: "Official tournament collaborator",
    tier: "partner",
  },
];

export async function getSponsors(): Promise<Sponsor[]> {
  // TODO: replace with a real data source (Supabase table or external API).
  return SPONSORS;
}
