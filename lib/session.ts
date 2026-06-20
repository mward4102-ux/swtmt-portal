// Runtime-agnostic session token (works in both the Edge middleware and the
// Node server). A stateless, HMAC-signed cookie: base64url(payload).base64url(sig).
// No next/headers or Node-only APIs here so the Edge middleware can import it.

import type { Role, SessionUser } from "./types";

export const SESSION_COOKIE = "bsi_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const DEV_SECRET = "beach-stanton-dev-secret-do-not-use-in-prod";

interface SessionPayload extends SessionUser {
  iat: number;
}

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlFromString(s: string): string {
  return b64urlFromBytes(new TextEncoder().encode(s));
}
function stringFromB64url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlFromBytes(new Uint8Array(sig));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(user: SessionUser, secret: string): Promise<string> {
  const payload: SessionPayload = { ...user, iat: Date.now() };
  const body = b64urlFromString(JSON.stringify(payload));
  const sig = await hmac(body, secret);
  return `${body}.${sig}`;
}

export async function verifySession(token: string | undefined, secret: string): Promise<SessionUser | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  try {
    const expected = await hmac(body, secret);
    if (!safeEqual(sig, expected)) return null;
    const payload = JSON.parse(stringFromB64url(body)) as SessionPayload;
    if (!payload?.id || !payload?.email) return null;
    return { id: payload.id, email: payload.email, fullName: payload.fullName, role: payload.role as Role };
  } catch {
    return null;
  }
}
