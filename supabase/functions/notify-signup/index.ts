// Called by a Supabase Database Webhook on INSERT into public.teams.
// Emails the admin list via Resend so nobody has to babysit the dashboard
// to notice a new team registered.
import { Resend } from "npm:resend@4";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    team_name?: string;
    registration_code?: string;
    captain_name?: string;
    captain_email?: string | null;
    captain_phone?: string;
    created_at?: string;
  } | null;
}

Deno.serve(async (req: Request) => {
  try {
    // Shared-secret gate. The DB webhook is configured to send this header;
    // random callers can't, so they can't spam the admin list with fake
    // "new registration" emails. We use our own secret rather than the JWT
    // check because the only key a webhook could present is the anon key,
    // which is public (it ships in the browser bundle) and so proves nothing.
    //
    // Fail CLOSED: if the secret isn't configured, refuse every request rather
    // than leaving the function open to the world.
    const expected = Deno.env.get("NOTIFY_WEBHOOK_SECRET");
    if (!expected) {
      console.error("NOTIFY_WEBHOOK_SECRET is not set - refusing all requests");
      return new Response(JSON.stringify({ ok: false, error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const provided = req.headers.get("x-webhook-secret");
    if (provided !== expected) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as WebhookPayload;
    const record = payload?.record;
    if (!record) {
      return new Response(JSON.stringify({ ok: false, error: "No record in webhook payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const recipients = (Deno.env.get("NOTIFY_EMAILS") ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    // Resend's shared test sender - works with no domain setup, but lands
    // in spam more often. Set NOTIFY_FROM_EMAIL to a verified sender once
    // you've added your own domain in Resend.
    const fromEmail = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "onboarding@resend.dev";

    if (!resendKey || recipients.length === 0) {
      console.error("Missing RESEND_API_KEY or NOTIFY_EMAILS secret");
      return new Response(JSON.stringify({ ok: false, error: "Notification not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const teamName = record.team_name ?? "(unknown team)";
    const code = record.registration_code ?? "(no code)";
    const captainName = record.captain_name ?? "(unknown)";
    const captainEmail = record.captain_email || "(not provided)";
    const captainPhone = record.captain_phone ?? "(unknown)";
    const createdAt = record.created_at ?? new Date().toISOString();

    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `New team registered: ${teamName}`,
      text:
        `A new team just registered.\n\n` +
        `Team: ${teamName}\n` +
        `Registration code: ${code}\n` +
        `Captain: ${captainName}\n` +
        `Captain email: ${captainEmail}\n` +
        `Captain phone: ${captainPhone}\n` +
        `Registered at: ${createdAt}\n`,
    });

    if (error) {
      console.error(error);
      return new Response(JSON.stringify({ ok: false, error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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
