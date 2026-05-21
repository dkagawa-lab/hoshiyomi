import { NextRequest, NextResponse } from "next/server";
import { authClientCookieName } from "@/lib/authRegistrationClient";
import { isServerStoreConfigured, registerClientUser } from "@/lib/serverStore";

const stateCookieName = "hoshiyomi_line_oauth_state";
const nextCookieName = "hoshiyomi_line_oauth_next";

type LineTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  id_token?: string;
};

type LineVerifyResponse = {
  email?: string;
  name?: string;
  sub?: string;
};

export async function GET(req: NextRequest) {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
  const url = new URL(req.url);
  const returnPayload = readReturnPayload(req.cookies.get(nextCookieName)?.value);
  const returnTo = returnPayload.returnTo;
  const ref = returnPayload.ref;
  const errorRedirect = new URL(`/register?returnTo=${encodeURIComponent(returnTo)}&authError=line_failed`, req.url);
  if (ref) errorRedirect.searchParams.set("ref", ref);

  if (!channelId || !channelSecret) {
    return NextResponse.redirect(new URL("/register?authError=line_not_configured", req.url));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get(stateCookieName)?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(errorRedirect);
  }

  const origin = new URL(req.url).origin;
  const redirectUri = process.env.LINE_LOGIN_REDIRECT_URI || `${origin}/api/auth/line/callback`;
  const token = await exchangeLineCode({ channelId, channelSecret, code, redirectUri }).catch(() => null);
  if (!token?.id_token) return NextResponse.redirect(errorRedirect);

  const profile = await verifyLineIdToken({ channelId, idToken: token.id_token }).catch(() => null);
  const clientUserId = profile?.sub ? toLineClientUserId(profile.sub) : null;
  if (!clientUserId) return NextResponse.redirect(errorRedirect);

  if (isServerStoreConfigured()) {
    try {
      await registerClientUser(clientUserId);
    } catch (error) {
      console.warn("LINE registration could not be stored yet", { message: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  const completeUrl = new URL("/auth/line/complete", req.url);
  completeUrl.searchParams.set("returnTo", returnTo);
  if (ref) completeUrl.searchParams.set("ref", ref);

  const res = NextResponse.redirect(completeUrl);
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(authClientCookieName, clientUserId, { httpOnly: false, maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax", secure });
  res.cookies.delete(stateCookieName);
  res.cookies.delete(nextCookieName);
  return res;
}

async function exchangeLineCode(input: { channelId: string; channelSecret: string; code: string; redirectUri: string }) {
  const body = new URLSearchParams({
    client_id: input.channelId,
    client_secret: input.channelSecret,
    code: input.code,
    grant_type: "authorization_code",
    redirect_uri: input.redirectUri
  });
  const res = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as LineTokenResponse;
}

async function verifyLineIdToken(input: { channelId: string; idToken: string }) {
  const body = new URLSearchParams({
    client_id: input.channelId,
    id_token: input.idToken
  });
  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as LineVerifyResponse;
}

function toLineClientUserId(sub: string) {
  const body = sub.replace(/[^a-zA-Z0-9_-]/g, "");
  return body.length >= 8 ? `line:${body}` : null;
}

function readReturnPayload(value: string | undefined) {
  const fallback = { ref: "", returnTo: "/account" };
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as { ref?: string; returnTo?: string };
    return {
      ref: parsed.ref || "",
      returnTo: resolveReturnTo(parsed.returnTo || null)
    };
  } catch {
    return fallback;
  }
}

function resolveReturnTo(value: string | null) {
  const allowed = new Set(["/account", "/reading", "/consultation", "/dashboard", "/pricing"]);
  return value && allowed.has(value) ? value : "/account";
}

