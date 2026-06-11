"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { registrationSchema, validateImage } from "@/lib/validation";
import { tournament } from "@/lib/config";

interface PlayerForm {
  full_name: string;
  nickname: string;
  phone: string;
  steam_profile_url: string;
  steam64_id: string;
  faceit_username: string;
  faceit_profile_url: string;
  discord_username: string;
}

const emptyPlayer = (): PlayerForm => ({
  full_name: "",
  nickname: "",
  phone: "",
  steam_profile_url: "",
  steam64_id: "",
  faceit_username: "",
  faceit_profile_url: "",
  discord_username: "",
});

const playerFields: { key: keyof PlayerForm; label: string; placeholder: string; hint?: string }[] = [
  { key: "full_name", label: "Full name", placeholder: "Ali Hassan" },
  { key: "nickname", label: "In-game nickname", placeholder: "s1mple_jr" },
  { key: "phone", label: "Phone number", placeholder: "+961 70 123 456" },
  { key: "steam_profile_url", label: "Steam profile link", placeholder: "https://steamcommunity.com/id/..." },
  { key: "steam64_id", label: "Steam64 ID", placeholder: "76561198000000000", hint: "17 digits — find it at steamid.io" },
  { key: "faceit_username", label: "Faceit username", placeholder: "faceit_nick" },
  { key: "faceit_profile_url", label: "Faceit profile link", placeholder: "https://www.faceit.com/en/players/..." },
  { key: "discord_username", label: "Discord username", placeholder: "username#0000 or @username" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [team, setTeam] = useState({
    team_name: "",
    captain_name: "",
    captain_phone: "",
    captain_email: "",
    captain_discord: "",
    preferred_contact: "whatsapp",
    notes: "",
  });
  const [players, setPlayers] = useState<PlayerForm[]>(Array.from({ length: 6 }, emptyPlayer));
  const [captainIndex, setCaptainIndex] = useState(0);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setTeamField = (k: string, v: string) => {
    setTeam((t) => ({ ...t, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const setPlayerField = (i: number, k: keyof PlayerForm, v: string) => {
    setPlayers((ps) => ps.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)));
    setErrors((e) => ({ ...e, [`players.${i}.${k}`]: "" }));
  };

  const onLogo = (f: File | null) => {
    const err = validateImage(f, "Team logo");
    if (err) {
      setErrors((e) => ({ ...e, logo: err }));
      return;
    }
    setErrors((e) => ({ ...e, logo: "" }));
    setLogo(f);
    setLogoPreview(f ? URL.createObjectURL(f) : null);
  };

  const payload = useMemo(
    () => ({
      ...team,
      players: players.map((p, i) => ({
        ...p,
        role: i < 5 ? ("main" as const) : ("bench" as const),
        is_captain: i === captainIndex,
      })),
    }),
    [team, players, captainIndex],
  );

  async function submit() {
    setFormError(null);
    const parsed = registrationSchema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!map[key]) map[key] = issue.message;
      }
      setErrors(map);
      const rosterIssue = parsed.error.issues.find((i) => i.path.length === 1 && i.path[0] === "players");
      setFormError(rosterIssue?.message ?? "Fix the highlighted fields and try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("payload", JSON.stringify(parsed.data));
      if (logo) fd.append("logo", logo);
      const res = await fetch("/api/register", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error ?? "Registration failed. Try again.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push(`/payment/${encodeURIComponent(json.registration_code)}?new=1`);
    } catch {
      setFormError("Network error — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="section-eyebrow">Team Registration</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black uppercase">
        Build your <span className="neon-cyan">roster</span>
      </h1>
      <p className="mt-3 text-zinc-400 max-w-2xl">
        Exactly <span className="text-neon-cyan">5 main players</span> and{" "}
        <span className="text-neon-magenta">1 bench player</span>. Entry fee is{" "}
        {tournament.entryFee} via Whish — payment instructions appear right after you submit.
      </p>

      {formError && (
        <div className="card mt-6 border-rose-500/50 bg-rose-500/5 px-5 py-4 text-sm text-rose-300" role="alert">
          {formError}
        </div>
      )}

      {/* ---------- Team identity ---------- */}
      <section className="card mt-8 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide">
          <span className="text-neon-magenta">01</span> Team identity
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="team_name">Team name *</label>
            <input
              id="team_name"
              className={`input ${errors.team_name ? "input-error" : ""}`}
              placeholder="Respawn Reapers"
              value={team.team_name}
              onChange={(e) => setTeamField("team_name", e.target.value)}
            />
            {errors.team_name && <p className="error-text">{errors.team_name}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Team logo (PNG / JPG / WEBP, max 5 MB)</label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded-xl border border-edge object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-edge text-zinc-600 text-xs">
                  LOGO
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
              />
              <button type="button" className="btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
                {logo ? "Change logo" : "Upload logo"}
              </button>
              {logo && (
                <button type="button" className="text-xs text-zinc-500 hover:text-rose-400" onClick={() => onLogo(null)}>
                  Remove
                </button>
              )}
            </div>
            {errors.logo && <p className="error-text">{errors.logo}</p>}
          </div>
        </div>
      </section>

      {/* ---------- Captain contact ---------- */}
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide">
          <span className="text-neon-magenta">02</span> Captain contact
        </h2>
        <p className="mt-2 text-sm text-zinc-500">This is who we contact about payment and match scheduling.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {(
            [
              ["captain_name", "Captain full name *", "Ali Hassan"],
              ["captain_phone", "Captain phone (Whish) *", "+961 70 123 456"],
              ["captain_email", "Captain email (optional)", "captain@email.com"],
              ["captain_discord", "Captain Discord *", "@captain"],
            ] as const
          ).map(([key, label, ph]) => (
            <div key={key}>
              <label className="field-label" htmlFor={key}>{label}</label>
              <input
                id={key}
                className={`input ${errors[key] ? "input-error" : ""}`}
                placeholder={ph}
                value={(team as any)[key]}
                onChange={(e) => setTeamField(key, e.target.value)}
              />
              {errors[key] && <p className="error-text">{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="field-label" htmlFor="preferred_contact">Preferred contact method</label>
            <select
              id="preferred_contact"
              className="input"
              value={team.preferred_contact}
              onChange={(e) => setTeamField("preferred_contact", e.target.value)}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone call</option>
              <option value="discord">Discord</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              className="input min-h-[80px]"
              placeholder="Anything we should know — availability, special requests…"
              value={team.notes}
              onChange={(e) => setTeamField("notes", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ---------- Roster ---------- */}
      <section className="mt-6">
        <div className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">
            <span className="text-neon-magenta">03</span> Roster — 5 main + 1 bench
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Mark exactly one player as the in-game captain. Steam64 IDs and Faceit usernames must be unique across the whole tournament.
          </p>
        </div>

        {players.map((p, i) => {
          const isBench = i === 5;
          return (
            <div
              key={i}
              className={`card mt-4 p-6 sm:p-8 border-l-4 ${
                isBench ? "border-l-neon-magenta/70" : "border-l-neon-cyan/70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold uppercase">
                  {isBench ? (
                    <span className="text-neon-magenta">Bench player</span>
                  ) : (
                    <span className="text-neon-cyan">Player {i + 1}</span>
                  )}
                  <span className="ml-2 text-xs text-zinc-500 font-body normal-case tracking-normal">
                    {isBench ? "substitute" : "main"}
                  </span>
                </h3>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="radio"
                    name="captain"
                    checked={captainIndex === i}
                    onChange={() => setCaptainIndex(i)}
                    className="h-4 w-4 accent-fuchsia-400"
                  />
                  In-game captain
                </label>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {playerFields.map((f) => {
                  const errKey = `players.${i}.${f.key}`;
                  return (
                    <div key={f.key}>
                      <label className="field-label" htmlFor={`${errKey}`}>{f.label} *</label>
                      <input
                        id={errKey}
                        className={`input ${errors[errKey] ? "input-error" : ""}`}
                        placeholder={f.placeholder}
                        value={p[f.key]}
                        onChange={(e) => setPlayerField(i, f.key, e.target.value)}
                      />
                      {errors[errKey] ? (
                        <p className="error-text">{errors[errKey]}</p>
                      ) : f.hint ? (
                        <p className="mt-1 text-xs text-zinc-600">{f.hint}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ---------- Submit ---------- */}
      <div className="card mt-6 p-6 sm:p-8 text-center">
        <p className="text-sm text-zinc-400">
          Submitting registers your team as <span className="text-amber-300 font-semibold">Pending Payment</span>.
          You'll get a registration code like <span className="code-chip">{tournament.codePrefix}-024</span> and full Whish payment instructions.
        </p>
        <button onClick={submit} disabled={submitting} className="btn-primary mt-6 px-12 py-4 text-base">
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-void border-t-transparent" />
              Registering…
            </>
          ) : (
            "Register Team"
          )}
        </button>
      </div>
    </div>
  );
}
