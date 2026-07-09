import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase-server";
import { tournament } from "@/lib/config";

export const runtime = "nodejs";

const FIELDS =
  "registration_code, team_name, team_logo_url, status, admin_notes, missing_fields, payment_proof_uploaded_at, created_at, captain_name";

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * True if the shorter of the two digit strings is a trailing match of the
 * longer one - so "71414071", "96171414071", and "+961 71 414 071" (once
 * digits-only) all match each other regardless of country-code formatting.
 * Requires at least 7 digits so short/empty input can't match too loosely.
 */
function phoneDigitsMatch(a: string, b: string): boolean {
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return shorter.length >= 7 && longer.endsWith(shorter);
}

/**
 * Captain status lookup by registration code OR captain phone number.
 * Returns only what the captain needs - never other teams' data, never
 * the payment screenshot or phone. Faceit link is included only once approved.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (typeof query !== "string" || query.trim().length < 4) {
      return NextResponse.json({ error: "Enter your registration code or captain phone number." }, { status: 400 });
    }
    const q = query.trim();
    const db = serviceClient();

    const { data: byCode } = await db.from("teams").select(FIELDS).ilike("registration_code", q).maybeSingle();
    let team: (typeof byCode & { captain_phone?: string }) | null = byCode;

    if (!team) {
      const queryDigits = digitsOnly(q);
      if (queryDigits.length >= 7) {
        // Phones are stored as free text (however the captain typed them),
        // so country-code/"+"/spacing can vary - compare digit-only and
        // tolerant of a missing/extra country code instead of an exact match.
        const { data: candidates } = await db.from("teams").select(`${FIELDS}, captain_phone`);
        team = candidates?.find((t) => phoneDigitsMatch(digitsOnly(t.captain_phone), queryDigits)) ?? null;
      }
    }

    if (!team) {
      return NextResponse.json(
        { error: "No registration found for that code or phone number." },
        { status: 404 },
      );
    }

    const { captain_phone, ...safeTeam } = team;

    return NextResponse.json({
      team: {
        ...safeTeam,
        faceit_link: safeTeam.status === "approved" ? tournament.faceitTournamentUrl : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
