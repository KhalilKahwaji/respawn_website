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
    captain_discord?: string;
    preferred_contact?: string;
    created_at?: string;
  } | null;
}

/** Escape user-supplied values before dropping them into HTML. */
function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

/** Render the ISO timestamp in Beirut local time; fall back to raw on error. */
function formatDate(iso: string): string {
  try {
    return (
      new Date(iso).toLocaleString("en-US", {
        timeZone: "Asia/Beirut",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " (Beirut)"
    );
  } catch {
    return iso;
  }
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
    // Falls back to Resend's shared test sender (only delivers to the Resend
    // account owner). Set NOTIFY_FROM_EMAIL to an address on a verified domain
    // to reach everyone.
    const fromEmail = Deno.env.get("NOTIFY_FROM_EMAIL") ?? "onboarding@resend.dev";
    // Admin dashboard link shown in the email. Override with ADMIN_URL if the
    // domain ever changes.
    const adminUrl = Deno.env.get("ADMIN_URL") ?? "https://www.respawnlb.com/admin";

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
    const captainDiscord = record.captain_discord ?? "(unknown)";
    const preferredContact = record.preferred_contact ?? "-";
    const registeredAt = formatDate(record.created_at ?? new Date().toISOString());

    // Plain-text fallback (for clients that don't render HTML).
    const text =
      `A new team just registered.\n\n` +
      `Team: ${teamName}\n` +
      `Registration code: ${code}\n` +
      `Captain: ${captainName}\n` +
      `Discord: ${captainDiscord}\n` +
      `Email: ${captainEmail}\n` +
      `Phone: ${captainPhone}\n` +
      `Preferred contact: ${preferredContact}\n` +
      `Registered: ${registeredAt}\n\n` +
      `View all teams: ${adminUrl}\n`;

    // A row helper. `mono` renders the value in a highlighted monospace style
    // (used for the registration code).
    const row = (label: string, value: string, mono = false) => `
      <tr>
        <td style="padding:9px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a8a99;width:140px;vertical-align:top;">${esc(label)}</td>
        <td style="padding:9px 0;font-size:15px;color:${mono ? "#2de2e6" : "#f4f4f6"};font-family:${mono ? "'Courier New',monospace" : "inherit"};vertical-align:top;">${esc(value)}</td>
      </tr>`;

    const html = `
    <div style="margin:0;padding:24px;background-color:#0b0b12;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
      <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background-color:#14141c;border:1px solid #262633;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #262633;">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff2fb9;font-weight:bold;">RESPAWN CS2 SHOWDOWN</div>
            <div style="font-size:22px;line-height:1.3;color:#ffffff;font-weight:bold;margin-top:6px;">New team registered</div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row("Team", teamName)}
              ${row("Registration code", code, true)}
              ${row("Captain", captainName)}
              ${row("Discord", captainDiscord)}
              ${row("Email", captainEmail)}
              ${row("Phone", captainPhone)}
              ${row("Preferred contact", preferredContact)}
              ${row("Registered", registeredAt)}
            </table>
            <div style="margin-top:24px;">
              <a href="${esc(adminUrl)}" style="display:inline-block;background-color:#2de2e6;color:#0b0b12;text-decoration:none;font-weight:bold;font-size:14px;padding:13px 26px;border-radius:8px;">View all teams &rarr;</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #262633;font-size:12px;color:#6b6b7b;">
            Automated notification from the Respawn CS2 registration site.
          </td>
        </tr>
      </table>
    </div>`;

    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `New team registered: ${teamName}`,
      text,
      html,
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
