# RESPAWN Heatwave 2026 - Tournament Website

A full tournament platform for **Respawn Gaming Lounge**'s CS2 event: team registration, Whish payment proof flow, manual admin approval, public approved-teams page, rules page, and a protected admin dashboard. Built with **Next.js 14 (App Router) + Supabase** (Postgres, Auth, Storage).

---

## How the flow works

1. Captain registers the team (5 main + up to 2 bench, exactly one captain).
2. The site derives a unique registration code from the captain's phone number, e.g. `RGL-CS2-00866841953` - this is also the **payment reference**. Same phone always produces the same code, which is what stops one phone number from captaining two teams (see [`lib/registration-code.ts`](lib/registration-code.ts)).
3. Captain lands on the payment page: Whish number, amount, code to write in the payment note, and a screenshot upload.
4. Uploading proof only requires the **registration code** from the payment page URL. Status moves to **Payment Under Review**.
5. Admin reviews the proof in the dashboard and sets **Approved / Rejected / Missing Information** (+ optional notes).
6. Approved teams appear on the public **Teams** page (nicknames only - no phones, no proofs) and the captain sees the Faceit tournament link on the **Check Status** page.

Status lifecycle (one field):
`pending_payment → under_review → approved | rejected | missing_info`

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Open **SQL Editor**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates:
   - `teams`, `players` tables (+ constraints, unique indexes, triggers)
   - a unique index on the captain's phone (digits-only), so one phone can't captain two teams
   - storage buckets: `team-logos` (public) and `payment-proofs` (**private**)
   - RLS enabled on every table **with zero policies** - the anon key can read nothing; all data access goes through the server API routes using the service-role key.

## 2. Set the admin password

The dashboard uses a single **shared password** (not per-user Supabase accounts). Anyone with the password gets full admin access, so treat it like any other production secret - see the note in **Security model** below.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

| Variable | Where to find it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (keep secret!) | ✅ |
| `ADMIN_PASSWORD` | Pick your own - this is the dashboard login | ✅ |
| `ADMIN_SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | ✅ |
| `FACEIT_API_KEY` | [developers.faceit.com](https://developers.faceit.com) → create app → server-side API key | optional |

If `FACEIT_API_KEY` is set, registrations get a soft Faceit check (does the username exist? what level/ELO?) stored for admins to see. It **never blocks** registration.

## 4. Edit tournament settings

Everything configurable lives in [`lib/config.ts`](lib/config.ts):

- Tournament name, date, registration deadline
- Prize pool, entry fee, team slots
- **Whish payment number** (currently a placeholder - put the real one here)
- Faceit tournament URL (shown to approved teams)
- Registration code prefix (`RGL-CS2`)

The rules text is in [`app/rules/page.tsx`](app/rules/page.tsx) as a simple editable array of sections.

## 5. Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Admin dashboard: `http://localhost:3000/admin` (redirects to login).

## 6. Deploy (Vercel)

1. Push the repo to GitHub, import it in [vercel.com](https://vercel.com).
2. Add the environment variables in Project Settings → Environment Variables (use a fresh, strong `ADMIN_PASSWORD` and a freshly generated `ADMIN_SESSION_SECRET` - don't reuse local dev values).
3. Deploy. Nothing else is required - file storage and DB are on Supabase.

---

## Exporting to Excel / Google Sheets

Admin dashboard → **Export CSV**. The file is UTF-8 with BOM (opens cleanly in Excel) and has **one row per player** with team columns repeated, which imports nicely into Google Sheets (`File → Import`).

## Security model

- **No client-side database access.** RLS is on with no policies; the browser anon key cannot read or write any table. Every read/write goes through Next.js route handlers using the service-role key, which validate everything.
- **Payment proofs are private.** Stored in a private bucket; the dashboard views them through 1-hour signed URLs. Uploading a proof only requires the registration code (no phone re-entry) - see the note below.
- **Registration codes are derived from the captain's phone, not sequential** - so they're not trivially enumerable the way `RGL-CS2-001`, `002`, … would be. They're also the only credential needed to upload a payment proof, and the encoding formula is simple and lives in [`lib/registration-code.ts`](lib/registration-code.ts) (obfuscation, not encryption) - so anyone who knows a captain's phone number, or reads the source, can compute their exact code and could overwrite that team's proof. This is a deliberate trade-off for a simpler captain flow - if that risk matters for your event, reintroduce a second factor (e.g. captain phone) on the upload endpoint.
- **Public pages expose safe fields only** (team name, logo, nicknames, status).
- **Uploads**: images only (png/jpg/webp), max 5 MB - enforced in the API *and* at the bucket level.
- **Duplicates blocked**: team name (case-insensitive) and Faceit usernames are unique across the tournament, plus in-form duplicate checks.
- Admin routes protected by middleware + a signed, httpOnly session cookie issued on password login (checked again on every API call in [`lib/supabase-server.ts`](lib/supabase-server.ts)).
- **Single shared admin password** (`ADMIN_PASSWORD`), not per-user accounts - simple, but it has no per-person revocation or audit trail. If more than one person needs access, or you need to remove one admin's access without changing everyone's password, per-user accounts (e.g. Supabase Auth) are a better fit than a shared secret.
- Login is rate-limited (10 attempts / 15 min / IP, in-memory) to blunt casual brute-forcing, but a shared password is still a single point of failure - anyone who obtains it has full access until you rotate `ADMIN_PASSWORD` (which also requires updating it wherever it's shared) or `ADMIN_SESSION_SECRET` (which instantly logs everyone out).

## Faceit integration (current + future)

Current: optional username validation + level/ELO fetch at registration time (`lib/faceit.ts`).
The module is isolated so you can later add: championship subscription via the Faceit API, bracket/results display, automatic roster checks. Hooks and endpoint notes are documented inside `lib/faceit.ts`.

## Ops: keeping Supabase alive + alerts

Three independent pieces, all driven from GitHub Actions:

- **Keepalive** (`supabase/functions/keepalive`): upserts one row in `public.keepalive` every ~2 days so the free-tier project never hits the 7-day auto-pause. Triggered by `.github/workflows/keepalive.yml`.
- **Pause check** (`.github/workflows/pause-check.yml`): a daily health check against Supabase's REST endpoint, done directly from the GitHub Actions runner - deliberately *not* a Supabase Edge Function, since a paused project takes its own Edge Functions down too, so a function can't reliably report on its own outage. Emails an alert via Resend on failure.
- **New-registration notifications** (`supabase/functions/notify-signup`): a Supabase Database Webhook on `INSERT` into `public.teams` calls this function, which emails the admin list via Resend with the team name, registration code, and captain contact info.

See the setup checklist (secrets to add, CLI deploy commands, webhook config) wherever this was originally set up - it's not duplicated here since it's a one-time setup, not routine editing.

## Project structure

```
app/
  page.tsx               # Landing page (hero, countdown, stats, how it works)
  register/              # Team registration form
  payment/[code]/        # Success + Whish instructions + proof upload
  status/                # Check registration status (code or phone)
  teams/                 # Public approved teams
  rules/                 # Tournament rules (editable array)
  admin/                 # Protected dashboard (+ /admin/login)
  api/                   # All server-side data access
components/              # Navbar, StatusPill, Countdown
lib/                     # config, types, zod validation, supabase clients, faceit
supabase/schema.sql      # Complete database + storage setup
supabase/functions/      # keepalive, notify-signup Edge Functions
.github/workflows/       # keepalive + pause-check cron jobs
middleware.ts            # /admin route protection
```
