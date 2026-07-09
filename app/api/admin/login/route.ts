import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_SEC, createAdminSessionToken, verifyAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Basic in-memory brute-force guard, per IP. Resets on deploy/restart - good
// enough to blunt casual brute-forcing on a single shared password without
// needing a database.
//
// Every 10 wrong passwords locks the IP out, with each successive lockout
// escalating: 10 minutes, then 30 minutes, then 5 hours (capped there). A
// correct password clears the strike count entirely.
const MAX_ATTEMPTS = 10;
const LOCKOUT_DURATIONS_MS = [10 * 60 * 1000, 30 * 60 * 1000, 5 * 60 * 60 * 1000];

const attempts = new Map<string, { failCount: number; strikes: number; lockUntil: number }>();

function formatDuration(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

/** Returns remaining lockout ms if locked, otherwise null. */
function checkLock(ip: string): number | null {
  const entry = attempts.get(ip);
  if (!entry || entry.lockUntil <= Date.now()) return null;
  return entry.lockUntil - Date.now();
}

function recordFailure(ip: string): number | null {
  const now = Date.now();
  const entry = attempts.get(ip) ?? { failCount: 0, strikes: 0, lockUntil: 0 };
  entry.failCount += 1;

  if (entry.failCount >= MAX_ATTEMPTS) {
    const duration = LOCKOUT_DURATIONS_MS[Math.min(entry.strikes, LOCKOUT_DURATIONS_MS.length - 1)];
    entry.lockUntil = now + duration;
    entry.strikes += 1;
    entry.failCount = 0;
    attempts.set(ip, entry);
    return duration;
  }

  attempts.set(ip, entry);
  return null;
}

function recordSuccess(ip: string): void {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const remainingLock = checkLock(ip);
  if (remainingLock !== null) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${formatDuration(remainingLock)}.` },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ok = await verifyAdminPassword(password);
  if (!ok) {
    const lockedFor = recordFailure(ip);
    const error =
      lockedFor !== null
        ? `Too many attempts. Try again in ${formatDuration(lockedFor)}.`
        : "Incorrect password";
    return NextResponse.json({ error }, { status: 401 });
  }

  recordSuccess(ip);
  const token = await createAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  });
  return res;
}
