# Ops setup — keepalive, pause alerts, signup notifications

One-time manual setup for the three systems that keep the free-tier Supabase
project alive and send email alerts. Everything below is a step **you** run —
the code and workflows are already committed; they just need secrets and a
webhook wired up. Nothing here contains real secret values on purpose.

Project ref: `dwxrisijefzrhkgogmmq`
Base URL: `https://dwxrisijefzrhkgogmmq.supabase.co`

---

## A. Run the updated schema (adds the `keepalive` table)

Supabase dashboard → **SQL Editor** → paste all of `supabase/schema.sql` → **Run**.
(Safe to re-run; it's all `create ... if not exists`.) Confirm a `keepalive`
table now exists with one row (`id = 1`).

---

## B. Deploy the Edge Functions (Supabase CLI)

Run these from the repo root. The CLI is already available via `npx`.

```bash
# 1. Log in (opens a browser to grab an access token; or paste a token from
#    https://supabase.com/dashboard/account/tokens)
npx supabase login

# 2. Link this repo to your project
npx supabase link --project-ref dwxrisijefzrhkgogmmq

# 3. Deploy both functions
npx supabase functions deploy keepalive
npx supabase functions deploy notify-signup
```

After deploy, the function URLs are:
- keepalive:      `https://dwxrisijefzrhkgogmmq.supabase.co/functions/v1/keepalive`
- notify-signup:  `https://dwxrisijefzrhkgogmmq.supabase.co/functions/v1/notify-signup`

---

## C. Set the Supabase function secrets

The `keepalive` function needs **no** secrets — Supabase auto-injects
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into every function (you can't
set `SUPABASE_`-prefixed secrets yourself; they're reserved).

`notify-signup` needs these. Run once, **on a single line** (the `\`
line-continuation below is bash only — in PowerShell either keep it to one
line as shown, or use a backtick `` ` `` instead of `\`):

```bash
npx supabase secrets set RESEND_API_KEY="re_xxxxxxxx" NOTIFY_EMAILS="khellowz@gmail.com,Nicolas_rahal@live.com" NOTIFY_WEBHOOK_SECRET="75c859d40cbd45aedf55a85ac2e7544c33e1522c47377173"
```

- `RESEND_API_KEY` — your Resend key (rotate the one shared in chat first).
- `NOTIFY_EMAILS` — comma-separated recipient list (no spaces needed), currently
  `khellowz@gmail.com,Nicolas_rahal@live.com`.
- `NOTIFY_WEBHOOK_SECRET` — the value above is a freshly generated suggestion;
  keep it or replace it, but it must **exactly match** the webhook header in
  step E.
- (Optional) `NOTIFY_FROM_EMAIL` — a verified Resend sender once you add your
  own domain. Defaults to `onboarding@resend.dev` (works immediately, but more
  likely to land in spam).

---

## D. Add the GitHub repo secrets

Repo: `KhalilKahwaji/respawn_website` → **Settings → Secrets and variables →
Actions → New repository secret**. Add each:

| Secret name | Value | Used by |
|---|---|---|
| `SUPABASE_KEEPALIVE_URL` | `https://dwxrisijefzrhkgogmmq.supabase.co/functions/v1/keepalive` | keepalive.yml |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon/public key | keepalive.yml, pause-check.yml |
| `SUPABASE_URL` | `https://dwxrisijefzrhkgogmmq.supabase.co` | pause-check.yml |
| `RESEND_API_KEY` | your Resend key | pause-check.yml |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` (or a verified sender) | pause-check.yml |
| `ALERT_EMAILS` | `khellowz@gmail.com,Nicolas_rahal@live.com` (comma-separated, no spaces) | pause-check.yml |

The anon key is safe to store as a CI secret (it's already public), but using a
secret keeps it out of the workflow file and logs.

---

## E. Create the Database Webhook for new registrations

Supabase dashboard → **Database → Webhooks → Create a new hook**:

- **Name**: `notify-signup`
- **Table**: `public.teams`
- **Events**: check **Insert** only
- **Type**: HTTP Request → **POST**
- **URL**: `https://dwxrisijefzrhkgogmmq.supabase.co/functions/v1/notify-signup`
- **HTTP Headers** — add both:
  - `Content-Type`: `application/json`
  - `x-webhook-secret`: the **same** value you set for `NOTIFY_WEBHOOK_SECRET` in step C
- Save.

> The function rejects any call whose `x-webhook-secret` header doesn't match,
> so this header is what makes it safe to leave the function publicly reachable.

---

## F. Verify each piece

1. **keepalive** — GitHub → **Actions → Supabase keepalive → Run workflow**
   (manual dispatch). It should go green, and the `keepalive` table's
   `last_ping` should update to now.
2. **pause-check** — GitHub → **Actions → Supabase pause check → Run workflow**.
   While the project is up it should pass and send **no** email. (To prove the
   alert path once, you can temporarily point `SUPABASE_URL` at a bad host and
   re-run — expect an email to **both** addresses in `ALERT_EMAILS` — then set
   it back.)
3. **notify-signup** — register a test team on the site (or insert a row into
   `public.teams`). All addresses in `NOTIFY_EMAILS` (both
   `khellowz@gmail.com` and `Nicolas_rahal@live.com`) should get an email with
   the team name, code, and captain info. Then delete the test team.

---

## Notes / caveats

- **"Every 2 days" cron** (`0 0 */2 * *`) can drift to a 1–3 day gap around
  month boundaries — still well inside Supabase's 7-day pause window.
- **GitHub disables scheduled workflows after 60 days of no repo activity**
  (commits/pushes, not workflow runs). If the repo goes quiet that long,
  re-enable the workflows under the Actions tab or push any commit.
- **Pause detection lives in GitHub Actions, not a Supabase function**, on
  purpose: a paused project takes its own Edge Functions offline, so a function
  can't report on its own outage. The GitHub runner is independent of Supabase.
- **Registration during an outage**: if Supabase is unreachable when a team
  tries to register, the site now shows a "contact the admins" message with the
  Discord link and phone number instead of a confusing generic error
  (`app/api/register/route.ts`).
