# RESPAWN CS2 Showdown — Tournament Website

A full tournament platform for **Respawn Gaming Lounge**'s CS2 event: team registration, Whish payment proof flow, manual admin approval, public approved-teams page, rules page, and a protected admin dashboard. Built with **Next.js 14 (App Router) + Supabase** (Postgres, Auth, Storage).

---

## How the flow works

1. Captain registers the team (5 main + 1 bench, exactly one captain).
2. The site generates a unique registration code, e.g. `RGL-CS2-024` — this is also the **payment reference**.
3. Captain lands on the payment page: Whish number, amount, code to write in the payment note, and a screenshot upload.
4. Uploading proof requires the **registration code + captain phone** (so nobody can attach files to someone else's team). Status moves to **Payment Under Review**.
5. Admin reviews the proof in the dashboard and sets **Approved / Rejected / Missing Information** (+ optional notes).
6. Approved teams appear on the public **Teams** page (nicknames only — no phones, no proofs) and the captain sees the Faceit tournament link on the **Check Status** page.

Status lifecycle (one field):
`pending_payment → under_review → approved | rejected | missing_info`

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Open **SQL Editor**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates:
   - `teams`, `players`, `admins` tables (+ constraints, unique indexes, triggers)
   - the `next_registration_code()` function (race-safe code generation)
   - storage buckets: `team-logos` (public) and `payment-proofs` (**private**)
   - RLS enabled on every table **with zero policies** — the anon key can read nothing; all data access goes through the server API routes using the service-role key.

## 2. Create the admin user

1. Supabase Dashboard → **Authentication → Users → Add user** → create an email + password (this is your dashboard login). Disable public signups under Authentication → Providers if you want to be strict (recommended).
2. SQL Editor → register that email in the allowlist:

```sql
insert into admins (email, role) values ('you@example.com', 'owner');
```

Only emails present in `admins` can use the dashboard, even if they somehow get a Supabase account.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

| Variable | Where to find it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (keep secret!) | ✅ |
| `FACEIT_API_KEY` | [developers.faceit.com](https://developers.faceit.com) → create app → server-side API key | optional |

If `FACEIT_API_KEY` is set, registrations get a soft Faceit check (does the username exist? what level/ELO?) stored for admins to see. It **never blocks** registration.

## 4. Edit tournament settings

Everything configurable lives in [`lib/config.ts`](lib/config.ts):

- Tournament name, date, registration deadline
- Prize pool, entry fee, team slots
- **Whish payment number** (currently a placeholder — put the real one here)
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
2. Add the four environment variables in Project Settings → Environment Variables.
3. Deploy. Nothing else is required — file storage and DB are on Supabase.

---

## Exporting to Excel / Google Sheets

Admin dashboard → **Export CSV**. The file is UTF-8 with BOM (opens cleanly in Excel) and has **one row per player** with team columns repeated, which imports nicely into Google Sheets (`File → Import`).

## Security model

- **No client-side database access.** RLS is on with no policies; the browser anon key cannot read or write any table. Every read/write goes through Next.js route handlers using the service-role key, which validate everything.
- **Payment proofs are private.** Stored in a private bucket; the dashboard views them through 1-hour signed URLs. Uploading a proof requires code + matching captain phone.
- **Public pages expose safe fields only** (team name, logo, nicknames, status).
- **Uploads**: images only (png/jpg/webp), max 5 MB — enforced in the API *and* at the bucket level.
- **Duplicates blocked**: team name (case-insensitive), Steam64 IDs, and Faceit usernames are unique across the tournament, plus in-form duplicate checks.
- Admin routes protected by middleware (Supabase Auth session) + `admins` table allowlist on every API call.

## Faceit integration (current + future)

Current: optional username validation + level/ELO fetch at registration time (`lib/faceit.ts`).
The module is isolated so you can later add: championship subscription via the Faceit API, bracket/results display, automatic roster checks. Hooks and endpoint notes are documented inside `lib/faceit.ts`.

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
middleware.ts            # /admin route protection
```
