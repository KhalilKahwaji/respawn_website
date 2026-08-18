/**
 * Keep in sync with TOURNAMENT_BASE in lib/config.ts - this file is .mjs and
 * can't import from the TypeScript config, so the path is repeated here.
 */
const TOURNAMENT_BASE = "/tournaments/heatwave2026";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },

  async redirects() {
    return [
      // The tournament pages moved under /tournaments/heatwave2026 so the site
      // root could become the gaming lounge's own landing page. Every link
      // already out in the wild - shared reviews, payment pages, indexed
      // prize/rules URLs - keeps working through these.
      //
      // Deliberately temporary (307, not 308): browsers cache permanent
      // redirects more or less forever, so this stays reversible while the new
      // structure settles. Flip `permanent` to true once it's final.
      { source: "/prizes", destination: `${TOURNAMENT_BASE}/prizes`, permanent: false },
      { source: "/rules", destination: `${TOURNAMENT_BASE}/rules`, permanent: false },
      { source: "/teams", destination: `${TOURNAMENT_BASE}/teams`, permanent: false },
      { source: "/sponsors", destination: `${TOURNAMENT_BASE}/sponsors`, permanent: false },
      { source: "/payment/:code", destination: `${TOURNAMENT_BASE}/payment/:code`, permanent: false },

      // The review link is already shared around, in both spellings.
      { source: "/review", destination: `${TOURNAMENT_BASE}/review`, permanent: false },
      { source: "/reviews", destination: `${TOURNAMENT_BASE}/review`, permanent: false },

      // Registration and status lookups are over and those pages are gone -
      // send the old (indexed) URLs somewhere useful instead of a 404.
      { source: "/register", destination: `${TOURNAMENT_BASE}/prizes`, permanent: true },
      { source: "/status", destination: TOURNAMENT_BASE, permanent: true },
    ];
  },
};
export default nextConfig;
