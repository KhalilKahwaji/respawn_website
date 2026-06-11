"use client";

import { useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/StatusPill";
import type { TeamStatus } from "@/lib/config";

interface StatusResult {
  registration_code: string;
  team_name: string;
  team_logo_url: string | null;
  status: TeamStatus;
  admin_notes: string | null;
  missing_fields: string | null;
  payment_proof_uploaded_at: string | null;
  created_at: string;
  captain_name: string;
  faceit_link: string | null;
}

export default function StatusPage() {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTeam(null);
    setLoading(true);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Lookup failed.");
      else setTeam(json.team);
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="section-eyebrow">Registration Status</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black uppercase">
        Track your <span className="neon-cyan">team</span>
      </h1>
      <p className="mt-3 text-zinc-400">
        Enter your registration code (e.g. <span className="font-mono text-neon-magenta">RGL-CS2-024</span>) or the
        captain phone number you registered with.
      </p>

      <form onSubmit={lookup} className="card mt-8 flex flex-col sm:flex-row gap-3 p-5">
        <input
          className="input flex-1"
          placeholder="RGL-CS2-024 or +961 70 123 456"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Registration code or captain phone"
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? "Searching…" : "Check status"}
        </button>
      </form>

      {error && (
        <div className="card mt-6 border-rose-500/50 bg-rose-500/5 px-5 py-4 text-sm text-rose-300" role="alert">
          {error}
        </div>
      )}

      {team && (
        <div className="card mt-6 overflow-hidden animate-rise">
          <div className="flex items-center gap-4 border-b border-edge p-6">
            {team.team_logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={team.team_logo_url} alt="" className="h-14 w-14 rounded-xl border border-edge object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-edge font-display text-lg text-zinc-600">
                {team.team_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl font-bold">{team.team_name}</h2>
              <p className="font-mono text-sm text-neon-magenta">{team.registration_code}</p>
            </div>
            <StatusPill status={team.status} />
          </div>

          <div className="grid gap-4 p-6 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted">Captain</span>
              <span className="text-zinc-200">{team.captain_name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">Registered</span>
              <span className="text-zinc-200">{new Date(team.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">Payment proof</span>
              <span className="text-zinc-200">
                {team.payment_proof_uploaded_at
                  ? `Uploaded ${new Date(team.payment_proof_uploaded_at).toLocaleString()}`
                  : "Not uploaded yet"}
              </span>
            </div>

            {team.missing_fields && (
              <div className="rounded-lg border border-violet-400/40 bg-violet-400/5 p-4">
                <p className="font-semibold text-violet-300 text-xs uppercase tracking-wider">Missing information</p>
                <p className="mt-1 text-zinc-300">{team.missing_fields}</p>
              </div>
            )}
            {team.admin_notes && (
              <div className="rounded-lg border border-edge bg-void/40 p-4">
                <p className="font-semibold text-zinc-400 text-xs uppercase tracking-wider">Admin notes</p>
                <p className="mt-1 text-zinc-300">{team.admin_notes}</p>
              </div>
            )}

            {team.status === "pending_payment" && (
              <Link href={`/payment/${team.registration_code}`} className="btn-primary mt-2">
                View payment instructions
              </Link>
            )}
            {team.status === "missing_info" && (
              <Link href={`/payment/${team.registration_code}`} className="btn-ghost mt-2">
                Re-upload payment proof
              </Link>
            )}
            {team.status === "approved" && team.faceit_link && (
              <a href={team.faceit_link} target="_blank" rel="noreferrer" className="btn-primary mt-2">
                Join the Faceit tournament →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
