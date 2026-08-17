"use client";

import { useState } from "react";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import { REVIEW_QUESTIONS, type ReviewRatingKey, tournament } from "@/lib/config";

type Ratings = Record<ReviewRatingKey, number | null>;

const EMPTY: Ratings = {
  rating_experience: null,
  rating_return: null,
  rating_organization: null,
};

const MAX_COMMENT = 2000;

export default function ReviewForm() {
  const [ratings, setRatings] = useState<Ratings>(EMPTY);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const answered = REVIEW_QUESTIONS.filter((q) => ratings[q.key] !== null).length;
  const empty = answered === 0 && comment.trim().length === 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (empty || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ratings, comment: comment.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center animate-rise sm:p-12">
        <p className="text-4xl">🎉</p>
        <h2 className="mt-4 font-display text-2xl font-black uppercase">
          Thank <span className="neon-cyan">you</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
          Your review is in - completely anonymously. Feedback like yours is exactly how the next{" "}
          {tournament.organizer} tournament gets better.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary btn-sm">
            Back to home
          </Link>
          <a
            href={tournament.discordServerUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost btn-sm"
          >
            Join the Discord
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {REVIEW_QUESTIONS.map((q, i) => (
        <div key={q.key} className="card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neon-cyan/40 bg-neon-cyan/5 font-mono text-[11px] text-neon-cyan">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm uppercase tracking-wider text-zinc-200 sm:text-base">
                {q.label}
              </p>
              <p className="mt-1 text-xs text-muted">{q.hint}</p>
              <div className="mt-4">
                <StarRating
                  label={q.label}
                  value={ratings[q.key]}
                  onChange={(v) => setRatings((r) => ({ ...r, [q.key]: v }))}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="card p-5 sm:p-6">
        <label htmlFor="review-comment" className="field-label">
          Leave a review <span className="normal-case tracking-normal text-zinc-600">(optional)</span>
        </label>
        <p className="mb-3 text-xs text-muted">
          What did you love, what annoyed you, what should we change next time? Be honest - nobody
          can tell who wrote this.
        </p>
        <textarea
          id="review-comment"
          className="input min-h-[130px] resize-y"
          placeholder="The brackets ran on time but the check-in was confusing…"
          maxLength={MAX_COMMENT}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
        />
        <p className="mt-1.5 text-right font-mono text-[11px] text-zinc-600">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>

      {error && (
        <div className="card border-rose-500/50 bg-rose-500/5 px-5 py-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 pt-2">
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={empty || submitting}>
          {submitting ? "Sending…" : "Submit review"}
        </button>
        <p className="text-center text-xs text-zinc-600">
          {empty
            ? "Rate at least one question or write something to submit."
            : `${answered} of ${REVIEW_QUESTIONS.length} rated · everything is optional`}
        </p>
      </div>
    </form>
  );
}
