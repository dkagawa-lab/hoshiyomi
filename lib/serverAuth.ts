import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { normalizeClientUserId, normalizeLineUserId } from "@/lib/serverStore";

export const lineAuthSessionCookieName = "hoshiyomi_line_auth_client_user_id";
export const anonymousSessionCookieName = "hoshiyomi_anon_session";

export type AuthenticatedRequestUser = {
  clientUserId: string;
  email: string | null;
  lineUserId?: string;
  provider: "line" | "supabase";
  userId?: string;
};

export type AnonymousRequestUser = {
  clientUserId: string;
  cookieValue?: string;
};

let supabaseAuthServerClient: SupabaseClient | null = null;

export async function getAuthenticatedRequestUser(req: Request): Promise<AuthenticatedRequestUser | null> {
  const supabaseUser = await getSupabaseAuthenticatedUser(req);
  if (supabaseUser) return supabaseUser;

  const lineSession = verifyLineSessionValue(parseCookieHeader(req.headers.get("cookie"))[lineAuthSessionCookieName]);
  if (lineSession) {
    return {
      clientUserId: lineSession.clientUserId,
      email: null,
      lineUserId: lineSession.lineUserId,
      provider: "line"
    };
  }

  return null;
}

export function authenticatedClientUserId(reqUser: AuthenticatedRequestUser | null, fallback?: unknown) {
  return reqUser?.clientUserId ?? normalizeClientUserId(fallback);
}

export function signLineSessionValue(clientUserId: string): string | null {
  const identity = normalizeClientUserId(clientUserId);
  if (!identity?.startsWith("line:")) return null;
  const lineUserId = normalizeLineUserId(identity.slice("line:".length));
  if (!lineUserId) return null;
  const signature = signLineIdentity(identity);
  return signature ? `${identity}.${signature}` : null;
}

export function getOrCreateAnonymousRequestUser(req: Request): AnonymousRequestUser | null {
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  const existing = verifyAnonymousSessionValue(cookies[anonymousSessionCookieName]);
  if (existing) return { clientUserId: existing.clientUserId };

  const clientUserId = createAnonymousClientUserId();
  const cookieValue = signAnonymousSessionValue(clientUserId);
  return cookieValue ? { clientUserId, cookieValue } : null;
}

export function signAnonymousSessionValue(clientUserId: string): string | null {
  const identity = normalizeClientUserId(clientUserId);
  if (!identity?.startsWith("anon:")) return null;
  const signature = signAnonymousIdentity(identity);
  return signature ? `${identity}.${signature}` : null;
}

function verifyLineSessionValue(value: string | undefined) {
  if (!value) return null;
  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex >= value.length - 1) return null;
  const identity = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const clientUserId = normalizeClientUserId(identity);
  if (!clientUserId || clientUserId !== identity || !clientUserId.startsWith("line:")) return null;
  const lineUserId = normalizeLineUserId(clientUserId.slice("line:".length));
  if (!lineUserId) return null;
  const expectedSignature = signLineIdentity(clientUserId);
  if (!expectedSignature || !safeEqual(signature, expectedSignature)) return null;
  return { clientUserId, lineUserId };
}

function verifyAnonymousSessionValue(value: string | undefined) {
  if (!value) return null;
  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex >= value.length - 1) return null;
  const identity = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const clientUserId = normalizeClientUserId(identity);
  if (!clientUserId || clientUserId !== identity || !clientUserId.startsWith("anon:")) return null;
  const expectedSignature = signAnonymousIdentity(clientUserId);
  if (!expectedSignature || !safeEqual(signature, expectedSignature)) return null;
  return { clientUserId };
}

function createAnonymousClientUserId() {
  return `anon:${randomBytes(18).toString("base64url")}`;
}

async function getSupabaseAuthenticatedUser(req: Request): Promise<AuthenticatedRequestUser | null> {
  const token = readBearerToken(req);
  if (!token) return null;

  const client = getSupabaseAuthServerClient();
  if (!client) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user?.id) return null;

  return {
    clientUserId: `auth:${data.user.id}`,
    email: data.user.email ?? null,
    provider: "supabase",
    userId: data.user.id
  };
}

function getSupabaseAuthServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!supabaseAuthServerClient) {
    supabaseAuthServerClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAuthServerClient;
}

function readBearerToken(req: Request) {
  const value = req.headers.get("authorization") || "";
  const [scheme, token] = value.split(/\s+/, 2);
  return scheme?.toLowerCase() === "bearer" && token ? token.trim() : "";
}

function signLineIdentity(identity: string) {
  const secret = readLineSessionSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(identity).digest("base64url");
}

function signAnonymousIdentity(identity: string) {
  const secret = readAnonymousSessionSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(identity).digest("base64url");
}

function readLineSessionSecret() {
  return (process.env.LINE_SESSION_SECRET || "").trim();
}

function readAnonymousSessionSecret() {
  return (process.env.ANONYMOUS_SESSION_SECRET || process.env.LINE_SESSION_SECRET || "").trim();
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function parseCookieHeader(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) continue;
    try {
      cookies[rawName] = decodeURIComponent(rawValue.join("="));
    } catch {
      cookies[rawName] = rawValue.join("=");
    }
  }
  return cookies;
}
