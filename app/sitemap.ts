import type { MetadataRoute } from "next";
import { features } from "@/lib/config";

const BASE = "https://www.respawnlb.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/prizes", priority: 0.9, changeFrequency: "weekly" as const },
    ...(features.publicTeamsPage
      ? [{ path: "/teams", priority: 0.8, changeFrequency: "daily" as const }]
      : []),
    { path: "/rules", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/sponsors", priority: 0.5, changeFrequency: "weekly" as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
