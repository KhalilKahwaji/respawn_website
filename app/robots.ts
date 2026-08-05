import type { MetadataRoute } from "next";
import { features } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/admin surfaces and per-team payment pages out of search.
        // The public roster is added while it's hidden so crawlers drop it.
        disallow: [
          "/admin",
          "/api/",
          "/payment/",
          ...(features.publicTeamsPage ? [] : ["/teams"]),
        ],
      },
    ],
    sitemap: "https://www.respawnlb.com/sitemap.xml",
  };
}
