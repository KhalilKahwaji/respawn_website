"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REVIEW_MAX_RATING, REVIEW_QUESTIONS, type ReviewRatingKey } from "@/lib/config";
import type { Review } from "@/lib/types";

interface Stats {
  total: number;
  with_comment: number;
  averages: Record<ReviewRatingKey, { average: number | null; responses: number }>;
}

type Filter = "all" | "with_comment" | "low";

const filterTabs: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "with_comment", label: "Written reviews" },
  { key: "low", label: "Low scores (≤5)" },
];

/** Colour scale so a wall of reviews is scannable at a glance. */
function scoreColor(v: number) {
  if (v >= 8) return "text-emerald-300";
  if (v >= 6) return "text-amber-300";
  return "text-rose-300";
}

function barColor(v: number) {
  if (v >= 8) return "bg-emerald-400/70";
  if (v >= 6) return "bg-amber-400/70";
  return "bg-rose-400/70";
}

/** A single rating rendered as a labelled meter. */
function RatingRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-xs text-muted">{label}</p>
        {value === null ? (
          <span className="shrink-0 font-mono text-xs text-zinc-600">skipped</span>
        ) : (
          <span className={`tabular shrink-0 font-display text-sm font-bold ${scoreColor(value)}`}>
            {value}/{REVIEW_MAX_RATING}
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        {value !== null && (
          <div
            className={`h-full rounded-full ${barColor(value)}`}
            style={{ width: `${(value / REVIEW_MAX_RATING) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setReviews(json.reviews);
      setStats(json.stats);
    } catch {
      setError("Failed to load reviews - refresh to retry.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this review permanently? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setReviews((rs) => rs?.filter((r) => r.id !== id) ?? null);
      load();
    } catch {
      alert("Delete failed - try again.");
    } finally {
      setBusyId(null);
    }
  }

  const visible = useMemo(() => {
    if (!reviews) return [];
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filter === "with_comment" && !r.comment?.trim()) return false;
      if (
        filter === "low" &&
        !REVIEW_QUESTIONS.some((question) => {
          const v = r[question.key];
          return typeof v === "number" && v <= 5;
        })
      )
        return false;
      if (q && !r.comment?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [reviews, filter, search]);

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold uppercase text-rose-300">Session expired</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Your admin session isn't valid anymore. Sign in again with the dashboard password.
          </p>
          <button onClick={signOut} className="btn-ghost mt-6">Back to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase">
            Tournament <span className="neon-cyan">reviews</span>
          </h1>
          <p className="mt-1 text-xs text-muted">
            Submitted anonymously from /review - there is no author to trace, by design.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="btn-ghost btn-sm">← Teams</Link>
          <button onClick={load} className="btn-ghost btn-sm">Refresh</button>
          <button onClick={signOut} className="btn-danger btn-sm">Sign out</button>
        </div>
      </div>

      {/* Averages */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {stats ? (
          <>
            <div className="card p-4 text-center">
              <p className="font-display text-2xl font-bold text-zinc-100">{stats.total}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">Reviews</p>
            </div>
            <div className="card p-4 text-center">
              <p className="font-display text-2xl font-bold text-neon-magenta">{stats.with_comment}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">Written</p>
            </div>
            {REVIEW_QUESTIONS.map((q) => {
              const a = stats.averages?.[q.key];
              return (
                <div key={q.key} className="card p-4 text-center">
                  <p
                    className={`tabular font-display text-2xl font-bold ${
                      a?.average == null ? "text-zinc-600" : scoreColor(a.average)
                    }`}
                  >
                    {a?.average == null ? "–" : a.average.toFixed(1)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[10px] uppercase tracking-[0.15em] text-muted">
                    {q.label}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">
                    {a?.responses ?? 0} answered
                  </p>
                </div>
              );
            })}
          </>
        ) : (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-[104px] animate-pulse" />)
        )}
      </div>

      {/* Search + filters */}
      <div className="card mt-6 flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <input
          className="input lg:max-w-sm"
          placeholder="Search written reviews…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search reviews"
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
        <div className="card mt-6 border-rose-500/50 bg-rose-500/5 px-5 py-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Reviews */}
      <div className="mt-6 space-y-3">
        {reviews === null ? (
          // Nothing loaded: skeletons while the fetch is in flight, and nothing
          // at all once it failed - the error banner above already says why.
          error
            ? null
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card h-36 animate-pulse" />
              ))
        ) : visible.length === 0 ? (
          <div className="card p-12 text-center text-zinc-500">
            {reviews && reviews.length === 0
              ? "No reviews yet - share the /review link with the players."
              : "No reviews match this search/filter."}
          </div>
        ) : (
          visible.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="font-mono text-xs text-muted">
                  {new Date(r.created_at).toLocaleString()}
                </p>
                <button
                  onClick={() => remove(r.id)}
                  disabled={busyId === r.id}
                  className="btn-danger btn-sm shrink-0"
                >
                  {busyId === r.id ? "…" : "Delete"}
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {REVIEW_QUESTIONS.map((q) => (
                  <RatingRow key={q.key} label={q.label} value={r[q.key]} />
                ))}
              </div>

              {r.comment?.trim() ? (
                <p className="mt-4 whitespace-pre-wrap rounded-xl border border-edge bg-void/40 p-4 text-sm text-zinc-300">
                  {r.comment}
                </p>
              ) : (
                <p className="mt-4 text-xs text-zinc-600">Ratings only - no written review.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
