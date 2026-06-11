"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusPill from "@/components/StatusPill";
import { browserClient } from "@/lib/supabase-browser";
import { STATUS_LABELS, type TeamStatus } from "@/lib/config";
import type { TeamWithPlayers } from "@/lib/types";

type AdminTeam = TeamWithPlayers & { payment_proof_url: string | null; faceit_checks: any };

interface Stats {
  total: number;
  pending_payment: number;
  under_review: number;
  approved: number;
  rejected: number;
  missing_info: number;
}

const filterTabs: { key: "all" | TeamStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending_payment", label: "Pending Payment" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "missing_info", label: "Missing Info" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [teams, setTeams] = useState<AdminTeam[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | TeamStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/teams", { cache: "no-store" });
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setTeams(json.teams);
      setStats(json.stats);
    } catch {
      setError("Failed to load teams — refresh to retry.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function signOut() {
    await browserClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  async function updateTeam(id: string, patch: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setTeams((ts) =>
        ts?.map((t) => (t.id === id ? { ...t, ...json.team } : t)) ?? null,
      );
      // refresh stats
      load();
    } catch {
      alert("Update failed — try again.");
    } finally {
      setBusyId(null);
    }
  }

  function markMissing(t: AdminTeam) {
    const what = window.prompt(
      "What is missing? (shown to the captain on the status page)",
      t.missing_fields ?? "",
    );
    if (what === null) return;
    updateTeam(t.id, { status: "missing_info", missing_fields: what });
  }

  function editNotes(t: AdminTeam) {
    const notes = window.prompt("Admin notes (shown to the captain):", t.admin_notes ?? "");
    if (notes === null) return;
    updateTeam(t.id, { admin_notes: notes });
  }

  const visible = useMemo(() => {
    if (!teams) return [];
    const q = search.trim().toLowerCase();
    return teams.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (!q) return true;
      return (
        t.team_name.toLowerCase().includes(q) ||
        t.registration_code.toLowerCase().includes(q) ||
        t.captain_name.toLowerCase().includes(q) ||
        t.captain_phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        t.players?.some(
          (p) =>
            p.nickname.toLowerCase().includes(q) ||
            p.faceit_username.toLowerCase().includes(q) ||
            p.steam64_id.includes(q),
        )
      );
    });
  }, [teams, search, filter]);

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold uppercase text-rose-300">Not an admin</h1>
          <p className="mt-3 text-sm text-zinc-400">
            You're signed in, but this email isn't in the <span className="font-mono">admins</span> table.
            Ask the tournament owner to add it.
          </p>
          <button onClick={signOut} className="btn-ghost mt-6">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase">
            Team <span className="neon-cyan">control</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <a href="/api/admin/export" className="btn-ghost btn-sm">⬇ Export CSV</a>
          <button onClick={load} className="btn-ghost btn-sm">Refresh</button>
          <button onClick={signOut} className="btn-danger btn-sm">Sign out</button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats ? (
          [
            ["Total", stats.total, "text-zinc-100"],
            ["Pending", stats.pending_payment, "text-amber-300"],
            ["In Review", stats.under_review, "text-sky-300"],
            ["Approved", stats.approved, "text-emerald-300"],
            ["Rejected", stats.rejected, "text-rose-300"],
            ["Missing Info", stats.missing_info, "text-violet-300"],
          ].map(([label, value, cls]) => (
            <div key={label as string} className="card p-4 text-center">
              <p className={`font-display text-2xl font-bold ${cls}`}>{value as number}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">{label}</p>
            </div>
          ))
        ) : (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-[76px] animate-pulse" />
          ))
        )}
      </div>

      {/* Search + filters */}
      <div className="card mt-6 flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <input
          className="input lg:max-w-sm"
          placeholder="Search team, code, captain, player, Steam ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search teams"
        />
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === f.key
                  ? "border-neon-cyan/70 bg-neon-cyan/10 text-neon-cyan"
                  : "border-edge text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card mt-6 border-rose-500/50 bg-rose-500/5 px-5 py-4 text-sm text-rose-300">{error}</div>
      )}

      {/* Teams */}
      <div className="mt-6 space-y-3">
        {teams === null && !error ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
        ) : visible.length === 0 ? (
          <div className="card p-12 text-center text-zinc-500">
            {teams && teams.length === 0 ? "No registrations yet." : "No teams match this search/filter."}
          </div>
        ) : (
          visible.map((t) => {
            const open = openId === t.id;
            const busy = busyId === t.id;
            return (
              <div key={t.id} className="card overflow-hidden">
                <button
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
                  onClick={() => setOpenId(open ? null : t.id)}
                  aria-expanded={open}
                >
                  {t.team_logo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={t.team_logo_url} alt="" className="h-11 w-11 rounded-lg border border-edge object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-edge text-xs text-zinc-600 font-display">
                      {t.team_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold">{t.team_name}</p>
                    <p className="truncate text-xs text-muted">
                      <span className="font-mono text-neon-magenta">{t.registration_code}</span>
                      {" · "}{t.captain_name}{" · "}{t.captain_phone}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    {t.payment_proof_url ? (
                      <span className="text-xs text-emerald-400">proof ✔</span>
                    ) : (
                      <span className="text-xs text-zinc-600">no proof</span>
                    )}
                  </div>
                  <StatusPill status={t.status} />
                  <span className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
                </button>

                {open && (
                  <div className="border-t border-edge p-5 animate-rise">
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={busy}
                        onClick={() => updateTeam(t.id, { status: "approved" })}
                        className="btn btn-sm border border-emerald-400/50 text-emerald-300 bg-emerald-400/5 hover:bg-emerald-400/15"
                      >
                        ✔ Approve
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => updateTeam(t.id, { status: "under_review" })}
                        className="btn btn-sm border border-sky-400/50 text-sky-300 bg-sky-400/5 hover:bg-sky-400/15"
                      >
                        Review
                      </button>
                      <button disabled={busy} onClick={() => markMissing(t)} className="btn btn-sm border border-violet-400/50 text-violet-300 bg-violet-400/5 hover:bg-violet-400/15">
                        Missing info
                      </button>
                      <button disabled={busy} onClick={() => updateTeam(t.id, { status: "rejected" })} className="btn-danger btn-sm">
                        ✕ Reject
                      </button>
                      <button disabled={busy} onClick={() => updateTeam(t.id, { status: "pending_payment" })} className="btn-ghost btn-sm">
                        Reset to pending
                      </button>
                      <button disabled={busy} onClick={() => editNotes(t)} className="btn-ghost btn-sm">
                        ✎ Notes
                      </button>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-3">
                      {/* Contact + meta */}
                      <div className="rounded-xl border border-edge bg-void/40 p-4 text-sm">
                        <p className="field-label">Captain & contact</p>
                        <dl className="space-y-1.5 text-zinc-300">
                          <div><dt className="inline text-muted">Name: </dt><dd className="inline">{t.captain_name}</dd></div>
                          <div><dt className="inline text-muted">Phone: </dt><dd className="inline font-mono">{t.captain_phone}</dd></div>
                          <div><dt className="inline text-muted">Email: </dt><dd className="inline">{t.captain_email ?? "—"}</dd></div>
                          <div><dt className="inline text-muted">Discord: </dt><dd className="inline">{t.captain_discord}</dd></div>
                          <div><dt className="inline text-muted">Prefers: </dt><dd className="inline capitalize">{t.preferred_contact}</dd></div>
                          <div><dt className="inline text-muted">Registered: </dt><dd className="inline">{new Date(t.created_at).toLocaleString()}</dd></div>
                        </dl>
                        {t.notes && (
                          <>
                            <p className="field-label mt-4">Captain notes</p>
                            <p className="text-zinc-400">{t.notes}</p>
                          </>
                        )}
                        {t.admin_notes && (
                          <>
                            <p className="field-label mt-4">Admin notes</p>
                            <p className="text-zinc-300">{t.admin_notes}</p>
                          </>
                        )}
                        {t.missing_fields && (
                          <>
                            <p className="field-label mt-4 text-violet-300">Missing</p>
                            <p className="text-violet-200">{t.missing_fields}</p>
                          </>
                        )}
                      </div>

                      {/* Players */}
                      <div className="rounded-xl border border-edge bg-void/40 p-4 text-sm lg:col-span-1">
                        <p className="field-label">Roster</p>
                        <ul className="space-y-2">
                          {[...(t.players ?? [])]
                            .sort((a, b) => (a.role === b.role ? 0 : a.role === "main" ? -1 : 1))
                            .map((p) => (
                              <li key={p.steam64_id} className="rounded-lg border border-edge/70 p-2.5">
                                <p className="font-semibold text-zinc-200">
                                  {p.nickname}
                                  {p.is_captain && <span className="ml-1 text-neon-magenta">★ CPT</span>}
                                  <span className={`ml-2 text-[10px] uppercase ${p.role === "main" ? "text-neon-cyan" : "text-neon-magenta"}`}>
                                    {p.role}
                                  </span>
                                </p>
                                <p className="text-xs text-muted">{p.full_name} · {p.phone}</p>
                                <p className="text-xs text-muted font-mono">{p.steam64_id}</p>
                                <p className="text-xs">
                                  <a className="text-sky-400 hover:underline" href={p.faceit_profile_url} target="_blank" rel="noreferrer">
                                    faceit: {p.faceit_username}
                                  </a>
                                  {" · "}
                                  <a className="text-sky-400 hover:underline" href={p.steam_profile_url} target="_blank" rel="noreferrer">
                                    steam
                                  </a>
                                  {" · "}
                                  <span className="text-zinc-500">{p.discord_username}</span>
                                </p>
                              </li>
                            ))}
                        </ul>
                      </div>

                      {/* Payment proof */}
                      <div className="rounded-xl border border-edge bg-void/40 p-4 text-sm">
                        <p className="field-label">Payment proof</p>
                        {t.payment_proof_url ? (
                          <a href={t.payment_proof_url} target="_blank" rel="noreferrer" title="Open full size">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={t.payment_proof_url}
                              alt={`Payment proof for ${t.team_name}`}
                              className="max-h-72 w-full rounded-lg border border-edge object-contain bg-black/40"
                            />
                          </a>
                        ) : (
                          <p className="text-zinc-600">No proof uploaded yet.</p>
                        )}
                        {t.payment_proof_uploaded_at && (
                          <p className="mt-2 text-xs text-muted">
                            Uploaded {new Date(t.payment_proof_uploaded_at).toLocaleString()}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-zinc-600">
                          Reference expected in Whish note: <span className="font-mono text-neon-magenta">{t.registration_code}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="mt-8 text-center text-xs text-zinc-600">
        Status legend: {Object.values(STATUS_LABELS).join(" · ")}
      </p>
    </div>
  );
}
