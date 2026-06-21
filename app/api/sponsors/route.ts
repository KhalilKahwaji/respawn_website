import { NextResponse } from "next/server";
import { getSponsors } from "@/lib/sponsors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public list of tournament sponsors / partners.
 * The Sponsors page fetches this; the data source lives in lib/sponsors.ts
 * and can be pointed at a DB or external API later without touching callers.
 */
export async function GET() {
  try {
    const sponsors = await getSponsors();
    return NextResponse.json({ sponsors });
  } catch {
    return NextResponse.json({ error: "Couldn't load sponsors." }, { status: 500 });
  }
}
