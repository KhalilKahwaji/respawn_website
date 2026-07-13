import { NextRequest, NextResponse } from "next/server";
import { serviceClient, isConnectivityError } from "@/lib/supabase-server";
import { registrationSchema, validateImage } from "@/lib/validation";
import { verifyFaceitPlayers } from "@/lib/faceit";
import { tournament } from "@/lib/config";
import { digitsOnly, encodePhoneDigits } from "@/lib/registration-code";

export const runtime = "nodejs";

const CONTACT_ADMINS_MESSAGE =
  `Registration is temporarily unavailable due to a backend issue on our end - it's not something wrong with your ` +
  `submission. Please contact the ${tournament.organizer} admins on Discord (${tournament.discordServerUrl}) or at ` +
  `${tournament.contactPhone} so we can register your team manually, and try again later.`;

/** Turns a Supabase connectivity failure into the admin-contact message; returns null for ordinary query errors. */
function connectivityResponse(err: unknown) {
  if (!isConnectivityError(err)) return null;
  return NextResponse.json({ error: CONTACT_ADMINS_MESSAGE }, { status: 503 });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const raw = form.get("payload");
    if (typeof raw !== "string") {
      return NextResponse.json({ error: "Malformed request" }, { status: 400 });
    }

    const parsed = registrationSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid form data", path: issue?.path },
        { status: 400 },
      );
    }
    const data = parsed.data;

    if (Date.now() > tournament.registrationDeadline.getTime()) {
      return NextResponse.json({ error: "Registration is closed - the deadline has passed." }, { status: 403 });
    }

    const logo = form.get("logo");
    const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
    const imgErr = validateImage(logoFile, "Team logo");
    if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });

    const db = serviceClient();

    // ---- Capacity check: rejected teams give their slot back ----
    const { count: takenSlots, error: countErr } = await db
      .from("teams")
      .select("id", { count: "exact", head: true })
      .neq("status", "rejected");
    if (countErr) {
      console.error(countErr);
      return connectivityResponse(countErr) ??
        NextResponse.json({ error: "Could not check slot availability. Try again." }, { status: 500 });
    }
    if ((takenSlots ?? 0) >= tournament.maxTeams) {
      return NextResponse.json({ error: "Registration is closed - all team slots are filled." }, { status: 403 });
    }

    // ---- Duplicate checks against existing registrations ----
    const { data: nameClash } = await db
      .from("teams")
      .select("id")
      .ilike("team_name", data.team_name)
      .maybeSingle();
    if (nameClash) {
      return NextResponse.json(
        { error: `A team named “${data.team_name}” is already registered.` },
        { status: 409 },
      );
    }

    // The registration code is deterministic from the captain's phone, so
    // the same phone always produces the same code - this doubles as the
    // "one phone can't captain two teams" check.
    const phoneDigits = digitsOnly(data.captain_phone);
    if (!phoneDigits) {
      return NextResponse.json({ error: "Captain phone must contain digits." }, { status: 400 });
    }
    const code = `${tournament.codePrefix}-${encodePhoneDigits(phoneDigits)}`;

    const { data: captainClash } = await db
      .from("teams")
      .select("id")
      .eq("registration_code", code)
      .maybeSingle();
    if (captainClash) {
      return NextResponse.json(
        { error: "This phone number is already registered as a team captain." },
        { status: 409 },
      );
    }

    const faceitNames = data.players.map((p) => p.faceit_username.toLowerCase());
    const { data: faceitClash } = await db
      .from("players")
      .select("faceit_username")
      .in("faceit_username", faceitNames);
    if (faceitClash && faceitClash.length > 0) {
      return NextResponse.json(
        { error: `Faceit user “${faceitClash[0].faceit_username}” is already registered with another team.` },
        { status: 409 },
      );
    }

    // ---- Optional Faceit verification (soft - never blocks) ----
    const faceitChecks = await verifyFaceitPlayers(
      data.players.map((p) => ({ faceit_username: p.faceit_username })),
    );

    // ---- Upload logo (if provided) ----
    let logoUrl: string | null = null;
    if (logoFile) {
      const ext = logoFile.type === "image/png" ? "png" : logoFile.type === "image/webp" ? "webp" : "jpg";
      const path = `${code}/logo.${ext}`;
      const { error: upErr } = await db.storage
        .from("team-logos")
        .upload(path, logoFile, { contentType: logoFile.type, upsert: true });
      if (upErr) {
        console.error(upErr);
        return connectivityResponse(upErr) ??
          NextResponse.json({ error: "Logo upload failed. Try a smaller image." }, { status: 500 });
      }
      logoUrl = db.storage.from("team-logos").getPublicUrl(path).data.publicUrl;
    }

    // ---- Insert team ----
    const { data: team, error: teamErr } = await db
      .from("teams")
      .insert({
        registration_code: code,
        team_name: data.team_name,
        team_logo_url: logoUrl,
        captain_name: data.captain_name,
        captain_phone: data.captain_phone,
        captain_email: data.captain_email || null,
        captain_discord: data.captain_discord,
        preferred_contact: data.preferred_contact,
        notes: data.notes || null,
        status: "pending_payment",
        faceit_checks: faceitChecks,
      })
      .select("id, registration_code")
      .single();

    if (teamErr || !team) {
      console.error(teamErr);
      if (teamErr?.code === "23505") {
        return NextResponse.json(
          { error: "This phone number is already registered as a team captain." },
          { status: 409 },
        );
      }
      return connectivityResponse(teamErr) ??
        NextResponse.json({ error: "Could not save your team. Try again." }, { status: 500 });
    }

    // ---- Insert players (roll back the team if this fails) ----
    const { error: playersErr } = await db.from("players").insert(
      data.players.map((p) => ({ ...p, team_id: team.id })),
    );
    if (playersErr) {
      console.error(playersErr);
      await db.from("teams").delete().eq("id", team.id);
      if (playersErr.code === "23505") {
        return NextResponse.json(
          { error: "One of your players is already registered with another team." },
          { status: 409 },
        );
      }
      return connectivityResponse(playersErr) ??
        NextResponse.json({ error: "Could not save players. Try again." }, { status: 409 });
    }

    return NextResponse.json({ registration_code: team.registration_code });
  } catch (e) {
    console.error(e);
    return connectivityResponse(e) ??
      NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
