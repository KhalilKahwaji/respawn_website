import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/admin surfaces and per-team payment pages out of search.
        disallow: ["/admin", "/api/", "/payment/"],
      },
    ],
    sitemap: "https://www.respawnlb.com/sitemap.xml",
  };
}
