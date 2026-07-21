import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/supabase-server";
import { validateImage } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * Admin uploads/replaces a team's logo. Stores it in the public team-logos
 * bucket under a timestamped filename (so the public URL changes and CDN
 * caches don't serve the old image) and updates teams.team_logo_url.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("logo");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Attach an image." }, { status: 400 });
    }
    const imgErr = validateImage(file, "Team logo");
    if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });

    const db = serviceClient();
    const { data: team } = await db
      .from("teams")
      .select("registration_code")
      .eq("id", params.id)
      .maybeSingle();
    if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${team.registration_code}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("team-logos")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) {
      console.error(upErr);
      return NextResponse.json({ error: "Upload failed. Try a smaller image." }, { status: 500 });
    }

    const publicUrl = db.storage.from("team-logos").getPublicUrl(path).data.publicUrl;
    const { error: updErr } = await db
      .from("teams")
      .update({ team_logo_url: publicUrl })
      .eq("id", params.id);
    if (updErr) {
      console.error(updErr);
      return NextResponse.json({ error: "Could not save the logo. Try again." }, { status: 500 });
    }

    return NextResponse.json({ team_logo_url: publicUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
