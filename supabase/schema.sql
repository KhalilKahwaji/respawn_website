-- =============================================================
-- Respawn Gaming Lounge — CS2 Tournament
-- Run this whole file in the Supabase SQL Editor (Database > SQL)
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Registration code sequence (race-safe RGL-CS2-001, 002, …) ----------
create sequence if not exists team_code_seq start 1;

-- ---------- Teams ----------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  registration_code text unique not null,
  team_name text not null,
  team_logo_url text,
  captain_name text not null,
  captain_phone text not null,
  captain_email text,
  captain_discord text not null,
  preferred_contact text not null default 'whatsapp'
    check (preferred_contact in ('whatsapp','phone','discord','email')),
  notes text,
  -- Single status field covering the whole payment/approval lifecycle:
  -- pending_payment -> under_review -> approved | rejected | missing_info
  status text not null default 'pending_payment'
    check (status in ('pending_payment','under_review','approved','rejected','missing_info')),
  payment_proof_path text,           -- storage path in the private payment-proofs bucket
  payment_proof_uploaded_at timestamptz,
  admin_notes text,                  -- shown to the captain on the status page
  missing_fields text,               -- what the admin flagged as missing
  faceit_checks jsonb,               -- optional Faceit verification snapshot
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent duplicate team names (case-insensitive)
create unique index if not exists teams_name_unique on public.teams (lower(team_name));

-- ---------- Players ----------
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  full_name text not null,
  nickname text not null,
  phone text not null,
  steam_profile_url text not null,
  steam64_id text not null,
  faceit_username text not null,
  faceit_profile_url text not null,
  discord_username text not null,
  role text not null check (role in ('main','bench')),
  is_captain boolean not null default false,
  created_at timestamptz not null default now()
);

-- A Steam account / Faceit account can only enter the tournament once.
create unique index if not exists players_steam64_unique on public.players (steam64_id);
create unique index if not exists players_faceit_unique on public.players (lower(faceit_username));
create index if not exists players_team_idx on public.players (team_id);

-- ---------- Admins ----------
-- Add a row here for every Supabase Auth user that should access /admin.
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'admin' check (role in ('admin','owner')),
  created_at timestamptz not null default now()
);

-- ---------- Registration code generator (called via RPC, race-safe) ----------
create or replace function public.next_registration_code(prefix text default 'RGL-CS2')
returns text language sql security definer as $$
  select prefix || '-' || lpad(nextval('team_code_seq')::text, 3, '0');
$$;

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists teams_touch on public.teams;
create trigger teams_touch before update on public.teams
  for each row execute function public.touch_updated_at();

-- =============================================================
-- Row Level Security: lock everything down.
-- The website talks to the database exclusively through server-side
-- route handlers using the service-role key (which bypasses RLS),
-- so the anon key gets ZERO access to these tables.
-- =============================================================
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.admins enable row level security;
-- No policies created on purpose: anon/authenticated clients cannot
-- read or write these tables directly.

-- =============================================================
-- Storage buckets
--   team-logos      public  (shown on the public teams page)
--   payment-proofs  PRIVATE (admin-only via signed URLs)
-- =============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('team-logos', 'team-logos', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('payment-proofs', 'payment-proofs', false, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

-- No storage policies for anon: uploads happen server-side with the
-- service role; payment proofs are served to admins via signed URLs only.
