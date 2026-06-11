import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

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
 * Service-role client. Server-only — bypasses RLS.
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

/** Cookie-aware client for reading the signed-in admin session in route handlers / server components. */
export function sessionClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware refreshes sessions.
          }
        },
      },
    },
  );
}

/**
 * Verifies the request comes from a signed-in user whose email exists
 * in the `admins` table. Returns the admin email or null.
 */
export async function requireAdmin(): Promise<string | null> {
  if (DEV_AUTH_BYPASS) {
    console.warn("⚠️  DEV_AUTH_BYPASS active — skipping admin auth check");
    return DEV_ADMIN_EMAIL;
  }
  try {
    const supa = sessionClient();
    const {
      data: { user },
    } = await supa.auth.getUser();
    if (!user?.email) return null;
    const svc = serviceClient();
    const { data } = await svc
      .from("admins")
      .select("email")
      .eq("email", user.email.toLowerCase())
      .maybeSingle();
    return data ? user.email : null;
  } catch {
    return null;
  }
}
