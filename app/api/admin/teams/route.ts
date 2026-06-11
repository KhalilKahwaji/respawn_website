import { NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = serviceClient();
  const { data: teams, error } = await db
    .from("teams")
    .select("*, players(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }

  // Signed URLs for private payment proofs (1 hour)
  const withProofs = await Promise.all(
    (teams ?? []).map(async (t) => {
      let payment_proof_url: string | null = null;
      if (t.payment_proof_path) {
        const { data } = await db.storage
          .from("payment-proofs")
          .createSignedUrl(t.payment_proof_path, 3600);
        payment_proof_url = data?.signedUrl ?? null;
      }
      return { ...t, payment_proof_url };
    }),
  );

  const count = (s: string) => withProofs.filter((t) => t.status === s).length;
  return NextResponse.json({
    teams: withProofs,
    stats: {
      total: withProofs.length,
      pending_payment: count("pending_payment"),
      under_review: count("under_review"),
      approved: count("approved"),
      rejected: count("rejected"),
      missing_info: count("missing_info"),
    },
  });
}
