import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEV_SECRET, SESSION_COOKIE, verifySession } from "@/lib/session";

// Server-side route protection (BUILD_SPEC §5). Runs on the Edge; only touches
// the signed cookie (no DB), then server components/route handlers do the rest.
const AGENT_PREFIXES = ["/dashboard", "/lead"];
const AUTH_PREFIXES = ["/profile", "/documents", "/quote", "/schedule", "/confirmation", ...AGENT_PREFIXES];

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!matches(pathname, AUTH_PREFIXES)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token, process.env.AUTH_SECRET || DEV_SECRET);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (matches(pathname, AGENT_PREFIXES) && session.role !== "agent") {
    const url = req.nextUrl.clone();
    url.pathname = "/profile";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/lead/:path*",
    "/profile/:path*",
    "/documents/:path*",
    "/quote/:path*",
    "/schedule/:path*",
    "/confirmation/:path*",
  ],
};
