import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase-server";
import { registrationSchema, validateImage } from "@/lib/validation";
import { verifyFaceitPlayers } from "@/lib/faceit";
import { tournament } from "@/lib/config";

export const runtime = "nodejs";

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

    const logo = form.get("logo");
    const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
    const imgErr = validateImage(logoFile, "Team logo");
    if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });

    const db = serviceClient();

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

    const steamIds = data.players.map((p) => p.steam64_id);
    const { data: steamClash } = await db
      .from("players")
      .select("steam64_id")
      .in("steam64_id", steamIds);
    if (steamClash && steamClash.length > 0) {
      return NextResponse.json(
        { error: `Steam64 ID ${steamClash[0].steam64_id} is already registered with another team.` },
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

    // ---- Optional Faceit verification (soft — never blocks) ----
    const faceitChecks = await verifyFaceitPlayers(
      data.players.map((p) => ({ faceit_username: p.faceit_username, steam64_id: p.steam64_id })),
    );

    // ---- Generate the registration code (race-safe DB sequence) ----
    const { data: code, error: codeErr } = await db.rpc("next_registration_code", {
      prefix: tournament.codePrefix,
    });
    if (codeErr || !code) {
      console.error(codeErr);
      return NextResponse.json({ error: "Could not generate registration code. Try again." }, { status: 500 });
    }

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
        return NextResponse.json({ error: "Logo upload failed. Try a smaller image." }, { status: 500 });
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
      return NextResponse.json({ error: "Could not save your team. Try again." }, { status: 500 });
    }

    // ---- Insert players (roll back the team if this fails) ----
    const { error: playersErr } = await db.from("players").insert(
      data.players.map((p) => ({ ...p, team_id: team.id })),
    );
    if (playersErr) {
      console.error(playersErr);
      await db.from("teams").delete().eq("id", team.id);
      const msg = playersErr.code === "23505"
        ? "One of your players is already registered with another team."
        : "Could not save players. Try again.";
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    return NextResponse.json({ registration_code: team.registration_code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
