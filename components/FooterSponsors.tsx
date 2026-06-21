import Link from "next/link";
import { getSponsors } from "@/lib/sponsors";
import type { Sponsor } from "@/lib/types";

/**
 * Sponsor logo strip shown in the footer. Server component — reads the same
 * sponsor source as the /sponsors page and the API. Renders nothing if there
 * are no sponsors yet.
 */
export default async function FooterSponsors() {
  let sponsors: Sponsor[] = [];
  try {
    sponsors = await getSponsors();
  } catch {
    sponsors = [];
  }
  if (sponsors.length === 0) return null;

  return (
    <div className="border-b border-edge/60">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            Sponsors &amp; Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {sponsors.map((s) => (
              <a
                key={s.id}
                href={s.website_url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                className="opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.logo_url} alt={s.name} className="h-9 w-auto sm:h-11" />
              </a>
            ))}
          </div>
          <Link
            href="/sponsors"
            className="text-xs font-semibold uppercase tracking-widest text-neon-cyan/80 transition-colors hover:text-neon-cyan"
          >
            View all partners →
          </Link>
        </div>
      </div>
    </div>
  );
}
