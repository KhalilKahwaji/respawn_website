import { NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Deletes a single review - moderation escape hatch for spam / abuse. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = serviceClient();
  const { error } = await db.from("reviews").delete().eq("id", params.id);
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
