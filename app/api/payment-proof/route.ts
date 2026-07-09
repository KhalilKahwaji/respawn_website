import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase-server";
import { validateImage } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * Captain uploads a Whish payment screenshot, identified by registration
 * code alone. The file goes into the PRIVATE payment-proofs bucket - only
 * admins can view it (via signed URLs).
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const code = String(form.get("registration_code") ?? "").trim();
    const file = form.get("proof");

    if (!code) {
      return NextResponse.json({ error: "Registration code is required." }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Attach your payment screenshot." }, { status: 400 });
    }
    const imgErr = validateImage(file, "Payment screenshot");
    if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });

    const db = serviceClient();
    const { data: team } = await db
      .from("teams")
      .select("id, registration_code, status")
      .ilike("registration_code", code)
      .maybeSingle();

    if (!team) {
      return NextResponse.json({ error: "No registration found for this code." }, { status: 404 });
    }
    if (team.status === "approved") {
      return NextResponse.json({ error: "This team is already approved - no payment needed." }, { status: 409 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${team.registration_code}/proof-${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("payment-proofs")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) {
      console.error(upErr);
      return NextResponse.json({ error: "Upload failed. Try a smaller image." }, { status: 500 });
    }

    const { error: updErr } = await db
      .from("teams")
      .update({
        payment_proof_path: path,
        payment_proof_uploaded_at: new Date().toISOString(),
        status: "under_review",
      })
      .eq("id", team.id);
    if (updErr) {
      console.error(updErr);
      return NextResponse.json({ error: "Could not update your team. Try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
