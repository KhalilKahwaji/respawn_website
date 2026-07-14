import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/supabase-server";
import { STATUSES } from "@/lib/config";
import { approvedEmail, CAPTAIN_EMAIL_BCC } from "@/supabase/functions/_shared/email-templates";

export const runtime = "nodejs";

/**
 * Best-effort "you're locked in" email to the captain when their team gets
 * approved. Failures are logged, never surfaced - the approval itself
 * already succeeded and must not look failed to the admin.
 */
async function sendApprovalEmail(team: {
  team_name: string;
  captain_name: string;
  captain_email: string | null;
  registration_code: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL ?? "onboarding@resend.dev";
  if (!apiKey) {
    console.error("RESEND_API_KEY not set - skipping approval email");
    return;
  }
  if (!team.captain_email) return;

  const msg = approvedEmail({
    teamName: team.team_name,
    captainName: team.captain_name,
    registrationCode: team.registration_code,
  });
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [team.captain_email],
        bcc: [CAPTAIN_EMAIL_BCC],
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
      }),
    });
    if (!res.ok) console.error("Approval email failed:", res.status, await res.text());
  } catch (e) {
    console.error("Approval email failed:", e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const update: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = body.status;
    }
    if (body.admin_notes !== undefined) update.admin_notes = String(body.admin_notes).slice(0, 2000) || null;
    if (body.missing_fields !== undefined) update.missing_fields = String(body.missing_fields).slice(0, 1000) || null;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const db = serviceClient();

    // Read the current status first so the approval email only fires on a
    // real transition into "approved", not on re-saves of an approved team.
    const { data: before } = await db
      .from("teams")
      .select("status")
      .eq("id", params.id)
      .single();

    const { data, error } = await db
      .from("teams")
      .update(update)
      .eq("id", params.id)
      .select("id, status, admin_notes, missing_fields, team_name, captain_name, captain_email, registration_code")
      .single();

    if (error || !data) {
      console.error(error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    if (data.status === "approved" && before?.status !== "approved") {
      await sendApprovalEmail(data);
    }

    return NextResponse.json({
      team: { id: data.id, status: data.status, admin_notes: data.admin_notes, missing_fields: data.missing_fields },
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = serviceClient();
  const { error } = await db.from("teams").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
