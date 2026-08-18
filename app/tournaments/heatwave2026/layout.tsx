import type { Metadata } from "next";
import { prizes, routes, tournament } from "@/lib/config";

const siteUrl = "https://www.respawnlb.com";

const description =
  `${tournament.organizer} × ${tournament.partner} present ${tournament.name} - a ${tournament.format.toLowerCase()} ` +
  `Counter-Strike 2 tournament for a ${tournament.prizePool} prize pool. Played online on Faceit, ` +
  `with the semifinals and grand final live on stage at the lounge.`;

/**
 * Everything under /tournaments/heatwave2026 is about this one event, so the
 * event-level SEO lives here instead of the root layout (which now describes
 * the gaming lounge itself).
 */
export const metadata: Metadata = {
  title: {
    default: `${tournament.shortName} - ${tournament.prizePool} CS2 Tournament in Lebanon`,
    template: `%s | ${tournament.shortName}`,
  },
  description,
  alternates: { canonical: routes.tournament },
  openGraph: {
    type: "website",
    siteName: tournament.name,
    url: `${siteUrl}${routes.tournament}`,
    locale: "en_US",
    title: `${tournament.shortName} - ${tournament.prizePool} CS2 Tournament in Lebanon`,
    description,
  },
};

/** Event structured data - scoped to the tournament section only. */
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: tournament.name,
  description,
  startDate: tournament.startDate,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
  image: `${siteUrl}/logo.png`,
  url: `${siteUrl}${routes.tournament}`,
  location: [
    { "@type": "VirtualLocation", url: "https://www.faceit.com" },
    {
      "@type": "Place",
      name: tournament.organizer,
      address: { "@type": "PostalAddress", addressCountry: "LB" },
    },
  ],
  organizer: { "@id": `${siteUrl}/#organization` },
  award: prizes.map((p) => `${p.ordinal} place: ${p.label}`).join(", "),
};

export default function TournamentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {children}
    </>
  );
}
