import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isLogin = req.cookies.get("isLoginSuccess")?.value === "true";
  const userRole = req.cookies.get("userRole")?.value;
  const pathname = req.nextUrl.pathname;

  if (!isLogin && pathname !== "/auth/login" && pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isLogin && userRole) {
    const roleAccess = {
      kasir: ["/dashboard/transaksi"],
      owner: [
        "/dashboard/transaksi",
        "/dashboard/menu",
        "/dashboard/pegawai",
        "/dashboard/laporan",
      ],
    };

    if (pathname === "/") {
      const defaultRoute =
        roleAccess[userRole as keyof typeof roleAccess]?.[0] || "/auth/login";
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    const allowedRoutes = roleAccess[userRole as keyof typeof roleAccess] || [];
    if (!allowedRoutes.some((route) => pathname.startsWith(route))) {
      const defaultRoute = allowedRoutes[0] || "/auth/login";
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
