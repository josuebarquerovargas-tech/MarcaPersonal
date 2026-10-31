import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(SESSION_COOKIE.admin)?.value;
    const session = token ? await verifySession("admin", token) : null;
    // The login page decides on its own (with a DB check) whether to bounce a
    // signed-in admin to /admin; doing it here would loop when the token is
    // signed but its session version is stale.
    const isLogin = pathname === "/admin/login";
    if (!session && !isLogin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/cuenta") || pathname.startsWith("/pago")) {
    const token = req.cookies.get(SESSION_COOKIE.member)?.value;
    const session = token ? await verifySession("member", token) : null;
    if (!session) {
      const url = new URL("/ingresar", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*", "/pago/:path*"],
};
