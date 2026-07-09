import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  // DEV-ONLY auth bypass for local demos. Requires NODE_ENV !== "production"
  // AND an explicit DEV_AUTH_BYPASS=true - can't be enabled in a prod build.
  if (process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_BYPASS === "true") {
    if (request.nextUrl.pathname.startsWith("/admin/login")) {
      const dash = request.nextUrl.clone();
      dash.pathname = "/admin";
      return NextResponse.redirect(dash);
    }
    return NextResponse.next();
  }

  const isLogin = request.nextUrl.pathname.startsWith("/admin/login");
  const authed = await verifyAdminSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);

  if (!authed && !isLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }
  if (authed && isLogin) {
    const dash = request.nextUrl.clone();
    dash.pathname = "/admin";
    return NextResponse.redirect(dash);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
