/**
 * Single shared-password gate for /admin.
 *
 * There is one password (ADMIN_PASSWORD, env-only - never hardcode it here)
 * shared by everyone who runs the dashboard. A successful login sets a
 * signed, httpOnly cookie; nothing about the password itself is stored in
 * the cookie, so it can't be read back out of the browser.
 *
 * Uses Web Crypto (crypto.subtle) instead of Node's `crypto` module so this
 * file works unmodified in both the Edge middleware runtime and Node API
 * routes.
 */

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 12; // 12 hours

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]*$/i.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return bufToHex(digest);
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bufToHex(sig);
}

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set - required to sign admin session cookies.");
  }
  return secret;
}

/** Constant-time check of a candidate password against ADMIN_PASSWORD. */
export async function verifyAdminPassword(candidate: string): Promise<boolean> {
  const actual = process.env.ADMIN_PASSWORD;
  if (!actual || !candidate) return false;
  // Hash both sides first so the comparison is fixed-length regardless of
  // input length, then compare in constant time.
  const [a, b] = await Promise.all([sha256Hex(candidate), sha256Hex(actual)]);
  const bytesA = hexToBytes(a);
  const bytesB = hexToBytes(b);
  if (!bytesA || !bytesB) return false;
  return constantTimeEqual(bytesA, bytesB);
}

/** Issues a signed `expiry.signature` token to store in the session cookie. */
export async function createAdminSessionToken(): Promise<string> {
  const expires = Date.now() + ADMIN_SESSION_MAX_AGE_SEC * 1000;
  const payload = String(expires);
  const sig = await hmacHex(sessionSecret(), payload);
  return `${payload}.${sig}`;
}

/** Verifies a session token's signature and expiry. */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  let expectedSig: string;
  try {
    expectedSig = await hmacHex(sessionSecret(), payload);
  } catch {
    return false;
  }
  const a = hexToBytes(sig);
  const b = hexToBytes(expectedSig);
  if (!a || !b) return false;
  return constantTimeEqual(a, b);
}
