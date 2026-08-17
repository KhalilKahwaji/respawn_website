import { NextResponse } from "next/server";
import { REVIEW_QUESTIONS } from "@/lib/config";
import { requireAdmin, serviceClient } from "@/lib/supabase-server";
import type { Review } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * All anonymous reviews, newest first, plus per-question averages.
 *
 * `submitter_hash` is deliberately left out of the select: it's a spam-control
 * detail, and pulling it into the dashboard would let an admin group reviews
 * by author, which is the one thing this form promises not to do.
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = serviceClient();
  const { data, error } = await db
    .from("reviews")
    .select("id, rating_experience, rating_return, rating_organization, comment, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }

  const reviews = (data ?? []) as Review[];

  // Averages ignore skipped questions, so `responses` says how many people
  // actually answered each one.
  const averages = Object.fromEntries(
    REVIEW_QUESTIONS.map((q) => {
      const values = reviews
        .map((r) => r[q.key])
        .filter((v): v is number => typeof v === "number");
      return [
        q.key,
        {
          average: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null,
          responses: values.length,
        },
      ];
    }),
  );

  return NextResponse.json({
    reviews,
    stats: {
      total: reviews.length,
      with_comment: reviews.filter((r) => r.comment?.trim()).length,
      averages,
    },
  });
}
