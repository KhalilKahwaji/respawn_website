import { routes } from "@/lib/config";
// Metadata for the (client-rendered) sponsors page lives here because client
// components can't export `metadata` themselves.
export const metadata = {
  title: "Sponsors & Partners",
  description:
    "The sponsors and partners powering Respawn Heatwave 2026, Lebanon's CS2 esports tournament by Respawn Gaming Lounge × LERF.",
  alternates: { canonical: routes.sponsors },
};

export default function SponsorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
