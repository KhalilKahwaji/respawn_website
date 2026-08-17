import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase-server";
import { reviewSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** How many reviews one submitter can leave per window before we say no. */
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * One-way, salted hash of the submitter's IP. This is the ONLY thing tying a
 * review to where it came from, it can't be reversed into an address, and it
 * is never exposed through the admin API - it exists purely so one person
 * can't dump a hundred reviews into the dashboard.
 */
function submitterHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const salt = process.env.REVIEW_IP_SALT ?? process.env.ADMIN_SESSION_SECRET ?? "respawn";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** Anonymous tournament feedback from /review. No auth, no identity stored. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Please check your answers and try again.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const review = parsed.data;

    const db = serviceClient();
    const hash = submitterHash(req);

    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await db
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("submitter_hash", hash)
      .gte("created_at", since);

    if ((count ?? 0) >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "You've already left a few reviews - thanks! Try again later." },
        { status: 429 },
      );
    }

    const { error } = await db.from("reviews").insert({
      rating_experience: review.rating_experience ?? null,
      rating_return: review.rating_return ?? null,
      rating_organization: review.rating_organization ?? null,
      comment: review.comment?.trim() ? review.comment.trim() : null,
      submitter_hash: hash,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not save your review. Try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
