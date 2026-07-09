import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

/**
 * DEV-ONLY auth bypass for local demos.
 * Active only when BOTH conditions hold:
 *   - not a production build (NODE_ENV !== "production")
 *   - DEV_AUTH_BYPASS === "true" is explicitly set
 * This double guard makes it impossible to enable in a prod deploy.
 */
export const DEV_AUTH_BYPASS =
  process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_BYPASS === "true";

/** Fake admin identity used when the dev bypass is on. */
export const DEV_ADMIN_EMAIL = "dev@localhost";

/**
 * Service-role client. Server-only - bypasses RLS.
 * Never import this from a client component.
 */
let _service: SupabaseClient | null = null;
export function serviceClient(): SupabaseClient {
  if (_service) return _service;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  _service = createClient(url, key, { auth: { persistSession: false } });
  return _service;
}

/**
 * Verifies the request carries a valid signed admin session cookie (set by
 * /api/admin/login after checking the shared ADMIN_PASSWORD). Returns a
 * label for the caller or null if unauthenticated.
 */
export async function requireAdmin(): Promise<string | null> {
  if (DEV_AUTH_BYPASS) {
    console.warn("⚠️  DEV_AUTH_BYPASS active - skipping admin auth check");
    return DEV_ADMIN_EMAIL;
  }
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    const ok = await verifyAdminSessionToken(token);
    return ok ? "admin" : null;
  } catch {
    return null;
  }
}
