import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/supabase-server";
import { STATUSES } from "@/lib/config";

export const runtime = "nodejs";

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
    const { data, error } = await db
      .from("teams")
      .update(update)
      .eq("id", params.id)
      .select("id, status, admin_notes, missing_fields")
      .single();

    if (error || !data) {
      console.error(error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ team: data });
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
