"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supa = browserClient();
      const { error } = await supa.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Login failed — is Supabase configured?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-24">
      <p className="section-eyebrow text-center">Restricted Area</p>
      <h1 className="mt-2 text-center font-display text-3xl font-black uppercase">
        Admin <span className="neon-magenta">login</span>
      </h1>
      <form onSubmit={login} className="card mt-8 grid gap-5 p-8">
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="btn-primary py-3" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-xs text-zinc-600">
          Accounts are created by the tournament owner in Supabase. There is no public sign-up.
        </p>
      </form>
    </div>
  );
}
