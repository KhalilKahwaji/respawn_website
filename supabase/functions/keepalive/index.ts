// Upserts a single row so Supabase sees write activity and never
// auto-pauses this free-tier project after 7 days of inactivity.
// Invoked externally on a schedule by .github/workflows/keepalive.yml.
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    return new Response(JSON.stringify({ ok: false, error: "Missing Supabase env vars" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(url, serviceRoleKey);
    const pingedAt = new Date().toISOString();
    const { error } = await supabase
      .from("keepalive")
      .upsert({ id: 1, last_ping: pingedAt }, { onConflict: "id" });

    if (error) {
      console.error(error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, pinged_at: pingedAt }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
