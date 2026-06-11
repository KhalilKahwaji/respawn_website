import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase-server";
import { tournament } from "@/lib/config";

export const runtime = "nodejs";

/**
 * Captain status lookup by registration code OR captain phone number.
 * Returns only what the captain needs — never other teams' data, never
 * the payment screenshot. Faceit link is included only once approved.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (typeof query !== "string" || query.trim().length < 4) {
      return NextResponse.json({ error: "Enter your registration code or captain phone number." }, { status: 400 });
    }
    const q = query.trim();
    const db = serviceClient();

    const normalizedPhone = q.replace(/[\s\-()]/g, "");
    const { data: team } = await db
      .from("teams")
      .select(
        "registration_code, team_name, team_logo_url, status, admin_notes, missing_fields, payment_proof_uploaded_at, created_at, captain_name",
      )
      .or(`registration_code.ilike.${q},captain_phone.eq.${q},captain_phone.eq.${normalizedPhone}`)
      .maybeSingle();

    if (!team) {
      return NextResponse.json(
        { error: "No registration found for that code or phone number." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      team: {
        ...team,
        faceit_link: team.status === "approved" ? tournament.faceitTournamentUrl : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
