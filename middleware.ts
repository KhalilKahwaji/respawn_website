import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // DEV-ONLY auth bypass for local demos. Requires NODE_ENV !== "production"
  // AND an explicit DEV_AUTH_BYPASS=true — can't be enabled in a prod build.
  if (process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_BYPASS === "true") {
    if (request.nextUrl.pathname.startsWith("/admin/login")) {
      const dash = request.nextUrl.clone();
      dash.pathname = "/admin";
      return NextResponse.redirect(dash);
    }
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // Supabase not configured yet — let the page render its own error.
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = request.nextUrl.pathname.startsWith("/admin/login");
  if (!user && !isLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }
  if (user && isLogin) {
    const dash = request.nextUrl.clone();
    dash.pathname = "/admin";
    return NextResponse.redirect(dash);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
