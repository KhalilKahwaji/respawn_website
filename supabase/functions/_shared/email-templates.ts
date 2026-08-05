// Captain-facing transactional emails, shared between the Supabase edge
// functions (Deno) and the Next.js admin route (Node). Keep this file free of
// any runtime APIs - pure string building only - so both sides can import it.
//
// Tournament values are duplicated from lib/config.ts on purpose: edge
// functions can only bundle files under supabase/functions, so they can't
// import lib/config. If you change the fee/date/Whish details there, update
// them here too.

const SITE_URL = "https://www.respawnlb.com";

/** Every captain email is BCC'd here so admins keep a copy of what was sent. */
export const CAPTAIN_EMAIL_BCC = "khellowz@gmail.com";

const T = {
  name: "RESPAWN HEATWAVE 2026",
  organizer: "Respawn Gaming Lounge",
  startDateLabel: "August 10, 2026 - 6:00 PM",
  prizePool: "$4,000",
  entryFee: "$125 / team",
  format: "5v5 - Double Elimination",
  whishNumber: "+961 81 632 209",
  whishAccountName: "Respawn Gaming Lounge",
  location: "Respawn Gaming Lounge / Online via Faceit",
  discordServerUrl: "https://discord.gg/Wh6TSJW3JY",
};

export interface CaptainEmailInput {
  teamName: string;
  captainName: string;
  registrationCode: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Escape user-supplied values before dropping them into HTML. */
function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

/** First name only - "Ali Hassan" reads better as "Ali" in a greeting. */
function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || "Captain";
}

/* ---------------------------------------------------------------- */
/* Shared layout pieces                                              */
/* ---------------------------------------------------------------- */

const shell = (accent: string, headline: string, body: string) => `
<div style="margin:0;padding:24px;background-color:#0b0b12;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
  <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background-color:#14141c;border:1px solid #262633;border-radius:14px;overflow:hidden;">
    <tr>
      <td style="padding:24px 28px;border-bottom:1px solid #262633;">
        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff2fb9;font-weight:bold;">${esc(T.name)}</div>
        <div style="font-size:24px;line-height:1.3;color:${accent};font-weight:800;margin-top:6px;">${headline}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px;">${body}</td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #262633;font-size:12px;color:#6b6b7b;line-height:1.6;">
        ${esc(T.organizer)} &middot; <a href="${T.discordServerUrl}" style="color:#8a8a99;">Discord</a> &middot; <a href="${SITE_URL}/status" style="color:#8a8a99;">Check your status</a><br/>
        You're receiving this because you registered a team for ${esc(T.name)}.
      </td>
    </tr>
  </table>
</div>`;

const button = (href: string, label: string, bg = "#2de2e6") =>
  `<a href="${esc(href)}" style="display:inline-block;background-color:${bg};color:#0b0b12;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:8px;">${label}</a>`;

const codeChip = (code: string) =>
  `<span style="display:inline-block;background-color:#0b0b12;border:1px solid #2de2e6;border-radius:8px;padding:10px 18px;font-family:'Courier New',monospace;font-size:18px;letter-spacing:1px;color:#2de2e6;font-weight:bold;">${esc(code)}</span>`;

const detailRow = (label: string, value: string, mono = false) => `
  <tr>
    <td style="padding:8px 0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a8a99;width:150px;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 0;font-size:15px;color:${mono ? "#2de2e6" : "#f4f4f6"};font-family:${mono ? "'Courier New',monospace" : "inherit"};vertical-align:top;">${esc(value)}</td>
  </tr>`;

/* ---------------------------------------------------------------- */
/* 1. Registration received - pending payment                        */
/* ---------------------------------------------------------------- */

export function pendingPaymentEmail(input: CaptainEmailInput): RenderedEmail {
  const { teamName, captainName, registrationCode } = input;
  const paymentUrl = `${SITE_URL}/payment/${encodeURIComponent(registrationCode)}`;

  const subject = `${teamName} is registered - complete payment to lock your slot`;

  const text =
    `Hey ${firstName(captainName)},\n\n` +
    `${teamName} is registered for ${T.name} - but your slot is NOT locked yet.\n` +
    `Registration is only complete once the entry fee is paid and proof is uploaded.\n\n` +
    `Registration code: ${registrationCode}\n` +
    `(save it - you'll need it to check status and upload proof)\n\n` +
    `How to pay:\n` +
    `1. Send ${T.entryFee} via Whish to ${T.whishNumber} (${T.whishAccountName})\n` +
    `2. Write ${registrationCode} in the payment note\n` +
    `3. Upload your confirmation screenshot: ${paymentUrl}\n\n` +
    `Check your status anytime with your code or your captain phone number:\n` +
    `${SITE_URL}/status\n\n` +
    `Questions? Join the Discord: ${T.discordServerUrl}\n`;

  const body = `
    <p style="margin:0;font-size:16px;color:#f4f4f6;">Hey ${esc(firstName(captainName))},</p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#c9c9d4;">
      <strong style="color:#ffffff;">${esc(teamName)}</strong> is registered for ${esc(T.name)} - but your slot
      is <strong style="color:#fbbf24;">not locked yet</strong>. Registration is only complete once the entry fee
      is paid and your proof is uploaded.
    </p>

    <div style="margin:22px 0;text-align:center;">
      <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a8a99;margin-bottom:8px;">Your registration code - save it</div>
      ${codeChip(registrationCode)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
      ${detailRow("Amount", T.entryFee)}
      ${detailRow("Whish number", T.whishNumber, true)}
      ${detailRow("Account name", T.whishAccountName)}
      ${detailRow("Payment note", registrationCode, true)}
    </table>

    <div style="margin-top:24px;text-align:center;">
      ${button(paymentUrl, "Complete payment &rarr;")}
    </div>

    <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#8a8a99;">
      Track your team anytime at <a href="${SITE_URL}/status" style="color:#2de2e6;">${SITE_URL.replace("https://", "")}/status</a>
      using your code or the captain phone number you registered with.
    </p>`;

  return { subject, text, html: shell("#fbbf24", "One step left: payment", body) };
}

/* ---------------------------------------------------------------- */
/* 2. Payment approved - see you in the arena                        */
/* ---------------------------------------------------------------- */

export function approvedEmail(input: CaptainEmailInput): RenderedEmail {
  const { teamName, captainName, registrationCode } = input;
  // The public roster is hidden (features.publicTeamsPage in lib/config.ts), so
  // captains are sent to Discord + their status page instead of /teams.
  const statusUrl = `${SITE_URL}/status`;

  const subject = `${teamName} is locked in - see you in the arena`;

  const text =
    `Hey ${firstName(captainName)},\n\n` +
    `Payment confirmed - ${teamName} is officially locked in for ${T.name}!\n\n` +
    `Kickoff: ${T.startDateLabel}\n` +
    `Format: ${T.format}\n` +
    `Prize pool: ${T.prizePool}\n` +
    `Where: ${T.location}\n\n` +
    `Keep an eye on Discord for match scheduling and announcements:\n` +
    `${T.discordServerUrl}\n\n` +
    `You can re-check your team's status anytime:\n` +
    `${statusUrl}\n\n` +
    `See you in the arena.\n` +
    `- ${T.organizer}\n`;

  const body = `
    <p style="margin:0;font-size:16px;color:#f4f4f6;">Hey ${esc(firstName(captainName))},</p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#c9c9d4;">
      Payment confirmed - <strong style="color:#ffffff;">${esc(teamName)}</strong> is officially
      <strong style="color:#34d399;">locked in</strong> for ${esc(T.name)}.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${detailRow("Kickoff", T.startDateLabel)}
      ${detailRow("Format", T.format)}
      ${detailRow("Prize pool", T.prizePool)}
      ${detailRow("Where", T.location)}
      ${detailRow("Team code", registrationCode, true)}
    </table>

    <div style="margin-top:24px;text-align:center;">
      ${button(T.discordServerUrl, "Join the Discord for match scheduling &rarr;")}
    </div>
    <div style="margin-top:12px;text-align:center;">
      <a href="${statusUrl}" style="font-size:13px;color:#8a8a99;">Check your team status anytime &rarr;</a>
    </div>

    <p style="margin:26px 0 0;text-align:center;font-size:18px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#ff2fb9;">
      See you in the arena.
    </p>`;

  return { subject, text, html: shell("#34d399", "You&#39;re locked in &#128293;", body) };
}
