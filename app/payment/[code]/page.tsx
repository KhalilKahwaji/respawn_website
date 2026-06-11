"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { tournament } from "@/lib/config";
import { validateImage } from "@/lib/validation";

export default function PaymentPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase();
  const search = useSearchParams();
  const isNew = search.get("new") === "1";

  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | null) => {
    const err = validateImage(f, "Payment screenshot");
    if (err) return setError(err);
    setError(null);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  async function submitProof() {
    setError(null);
    if (!phone.trim()) return setError("Enter the captain phone number you registered with.");
    if (!file) return setError("Attach your Whish payment screenshot.");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("registration_code", code);
      fd.append("captain_phone", phone);
      fd.append("proof", file);
      const res = await fetch("/api/payment-proof", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) return setError(json.error ?? "Upload failed. Try again.");
      setDone(true);
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center animate-rise">
        <div className="card p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 font-display text-2xl font-black uppercase">Proof received</h1>
          <p className="mt-3 text-zinc-400">
            Your payment is now <span className="text-sky-300 font-semibold">Under Review</span>. An admin will
            verify it manually — track your team anytime with code{" "}
            <span className="code-chip">{code}</span>.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/status" className="btn-primary">Check status</Link>
            <Link href="/" className="btn-ghost">Back home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {isNew && (
        <div className="card mb-8 border-emerald-400/40 bg-emerald-400/5 p-6 text-center animate-rise" role="status">
          <h1 className="font-display text-2xl font-black uppercase text-emerald-300">
            Team registered ✔
          </h1>
          <p className="mt-2 text-zinc-300">
            Your team has been registered and is <span className="text-amber-300 font-semibold">pending payment</span>.
          </p>
          <p className="mt-3 text-sm text-zinc-400">Save your registration code — you'll need it to check status and upload proof:</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="code-chip text-lg px-5 py-2.5">{code}</span>
            <button onClick={copyCode} className="btn-ghost btn-sm">{copied ? "Copied!" : "Copy"}</button>
          </div>
        </div>
      )}

      <p className="section-eyebrow">Step 2 of 3</p>
      <h2 className="mt-2 font-display text-3xl font-black uppercase">
        Pay via <span className="neon-magenta">Whish</span>
      </h2>

      <div className="card mt-6 p-6 sm:p-8">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="field-label">Whish number</dt>
            <dd className="font-mono text-lg text-neon-cyan">{tournament.whishNumber}</dd>
            <dd className="text-xs text-zinc-500 mt-1">{tournament.whishAccountName}</dd>
          </div>
          <div>
            <dt className="field-label">Amount</dt>
            <dd className="font-mono text-lg text-neon-cyan">{tournament.entryFee}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="field-label">Payment reference (write this in the Whish note)</dt>
            <dd className="flex items-center gap-3">
              <span className="code-chip text-base">{code}</span>
              <button onClick={copyCode} className="btn-ghost btn-sm">{copied ? "Copied!" : "Copy"}</button>
            </dd>
          </div>
        </dl>
        <div className="tube my-6" />
        <ol className="space-y-2 text-sm text-zinc-400 list-decimal list-inside">
          <li>Send the exact amount to the Whish number above.</li>
          <li>Write <span className="text-neon-magenta font-mono">{code}</span> in the payment note if possible.</li>
          <li>Take a screenshot of the confirmation and upload it below.</li>
        </ol>
      </div>

      <div className="card mt-6 p-6 sm:p-8">
        <h3 className="font-display text-lg font-bold uppercase">Upload payment proof</h3>
        <div className="mt-5 grid gap-5">
          <div>
            <label className="field-label" htmlFor="phone">Captain phone (must match your registration)</label>
            <input
              id="phone"
              className="input"
              placeholder="+961 70 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Payment screenshot (PNG / JPG / WEBP, max 5 MB)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-edge bg-void/50 px-6 py-8 text-sm text-zinc-500 transition-colors hover:border-neon-cyan/50 hover:text-zinc-300"
            >
              {preview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={preview} alt="Payment proof preview" className="max-h-56 rounded-lg" />
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  Tap to choose your screenshot
                </>
              )}
            </button>
            {file && (
              <button type="button" className="mt-2 text-xs text-zinc-500 hover:text-rose-400" onClick={() => onFile(null)}>
                Remove file
              </button>
            )}
          </div>
          {error && <p className="error-text" role="alert">{error}</p>}
          <button onClick={submitProof} disabled={submitting} className="btn-primary py-3.5">
            {submitting ? "Uploading…" : "Submit payment proof"}
          </button>
          <p className="text-center text-xs text-zinc-600">
            Your screenshot is stored privately and only visible to tournament admins.
          </p>
        </div>
      </div>
    </div>
  );
}
