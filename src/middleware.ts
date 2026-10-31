import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(SESSION_COOKIE.admin)?.value;
    const session = token ? await verifySession("admin", token) : null;
    const isLogin = pathname === "/admin/login";
    if (!session && !isLogin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (session && isLogin) {
      return NextResponse.redirect(new URL("/admin", req.url));
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
