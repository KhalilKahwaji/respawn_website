import type { MetadataRoute } from "next";
import { features, routes } from "@/lib/config";

const BASE = "https://www.respawnlb.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // The gaming lounge itself.
    { path: routes.home, priority: 1, changeFrequency: "weekly" as const },
    // Heatwave 2026 archive.
    { path: routes.tournament, priority: 0.9, changeFrequency: "monthly" as const },
    { path: routes.prizes, priority: 0.8, changeFrequency: "monthly" as const },
    ...(features.publicTeamsPage
      ? [{ path: routes.teams, priority: 0.7, changeFrequency: "weekly" as const }]
      : []),
    { path: routes.rules, priority: 0.6, changeFrequency: "monthly" as const },
    { path: routes.review, priority: 0.6, changeFrequency: "monthly" as const },
    { path: routes.sponsors, priority: 0.5, changeFrequency: "monthly" as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
