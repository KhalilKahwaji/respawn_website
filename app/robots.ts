import type { MetadataRoute } from "next";
import { TOURNAMENT_BASE, features, routes } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/admin surfaces and per-team payment pages out of search.
        // The public roster is listed while it's hidden so crawlers drop it.
        disallow: [
          "/admin",
          "/api/",
          `${TOURNAMENT_BASE}/payment/`,
          ...(features.publicTeamsPage ? [] : [routes.teams]),
        ],
      },
    ],
    sitemap: "https://www.respawnlb.com/sitemap.xml",
  };
}
