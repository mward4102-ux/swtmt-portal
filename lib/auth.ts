// Server-side auth helpers for route handlers + server components. Reads the
// signed session cookie, rehydrates the user into the active store (so demo
// users created in a prior process keep working), and enforces roles
// server-side (BUILD_SPEC §5: "Agent routes check role server-side").

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "./config";
import { getDb } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";
import type { SessionUser, User } from "./types";

export { SESSION_COOKIE, SESSION_MAX_AGE };

/** Current session user (or null). Rehydrates into the store if needed. */
export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySession(token, config.authSecret);
  if (!session) return null;

  const db = getDb();
  let user = db.getUserById(session.id) ?? db.getUserByEmail(session.email);
  if (!user) {
    // Session outlived the in-memory store (e.g. server restart) — re-add.
    user = db.createUser({ email: session.email, fullName: session.fullName, role: session.role });
  }
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/?next=auth");
  return user;
}

export async function requireAgent(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/?next=auth");
  if (user.role !== "agent") redirect("/profile");
  return user;
}

/** Build the Set-Cookie payload for a freshly authenticated user. */
export async function makeSessionCookie(user: SessionUser) {
  const value = await signSession(user, config.authSecret);
  return {
    name: SESSION_COOKIE,
    value,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    },
  };
}
