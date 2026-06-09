import { NextRequest, NextResponse } from "next/server";
import { authClientCookieName } from "@/lib/authRegistrationClient";
import { lineAuthSessionCookieName, signLineSessionValue } from "@/lib/serverAuth";
import { isServerStoreConfigured, normalizeClientUserId, registerLineUser } from "@/lib/serverStore";

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

type LineProfileResponse = {
  displayName?: string;
  userId?: string;
};

export async function GET(req: NextRequest) {
  const channelId = readEnv("LINE_LOGIN_CHANNEL_ID");
  const channelSecret = readEnv("LINE_LOGIN_CHANNEL_SECRET");
  const url = new URL(req.url);
  const returnPayload = readReturnPayload(req.cookies.get(nextCookieName)?.value);
  const returnTo = returnPayload.returnTo;
  const ref = returnPayload.ref;
  const fallbackPath = returnPayload.flow === "login" ? "/login" : "/register";
  const errorRedirect = new URL(`${fallbackPath}?returnTo=${encodeURIComponent(returnTo)}&authError=line_failed`, req.url);
  if (ref) errorRedirect.searchParams.set("ref", ref);

  if (!channelId || !channelSecret) {
    return NextResponse.redirect(new URL(`${fallbackPath}?returnTo=${encodeURIComponent(returnTo)}&authError=line_not_configured`, req.url));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get(stateCookieName)?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(errorRedirect);
  }

  const redirectUri = resolveLineRedirectUri(req.url);
  const token = await exchangeLineCode({ channelId, channelSecret, code, redirectUri }).catch((error) => {
    console.warn("LINE token exchange failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return null;
  });
  if (!token?.access_token) return NextResponse.redirect(errorRedirect);

  const lineUserId = await resolveLineUserId({ channelId, token });
  const lineClientUserId = toLineClientUserId(lineUserId);
  if (!lineClientUserId) return NextResponse.redirect(errorRedirect);

  let clientUserId = lineClientUserId;

  if (isServerStoreConfigured()) {
    try {
      await registerLineUser({ clientUserId, lineUserId });
    } catch (error) {
      console.warn("LINE registration could not be stored yet", { message: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  const completeUrl = new URL("/auth/line/complete", req.url);
  completeUrl.searchParams.set("returnTo", returnTo);
  completeUrl.searchParams.set("flow", returnPayload.flow);
  if (ref) completeUrl.searchParams.set("ref", ref);

  const res = NextResponse.redirect(completeUrl);
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(authClientCookieName, "line", { httpOnly: false, maxAge: 600, path: "/", sameSite: "lax", secure });
  const lineSessionValue = signLineSessionValue(clientUserId);
  if (lineSessionValue) {
    res.cookies.set(lineAuthSessionCookieName, lineSessionValue, { httpOnly: true, maxAge: 60 * 60 * 24 * 90, path: "/", sameSite: "lax", secure });
  } else {
    console.warn("LINE session cookie was not set because LINE_SESSION_SECRET is not configured or the LINE identity is invalid.");
  }
  res.cookies.delete(stateCookieName);
  res.cookies.delete(nextCookieName);
  return res;
}

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}

function resolveLineRedirectUri(requestUrl: string) {
  const origin = new URL(requestUrl).origin;
  const fallback = `${origin}/api/auth/line/callback`;
  const configured = readEnv("LINE_LOGIN_REDIRECT_URI");
  if (!configured) return fallback;
  try {
    const configuredUrl = new URL(configured);
    return configuredUrl.origin === origin ? configured : fallback;
  } catch {
    return fallback;
  }
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

async function resolveLineUserId(input: { channelId: string; token: LineTokenResponse }) {
  if (input.token.id_token) {
    const verified = await verifyLineIdToken({ channelId: input.channelId, idToken: input.token.id_token }).catch((error) => {
      console.warn("LINE id token verification failed; falling back to profile API", { message: error instanceof Error ? error.message : "Unknown error" });
      return null;
    });
    if (verified?.sub) return verified.sub;
  }

  const profile = await fetchLineProfile(input.token.access_token || "").catch((error) => {
    console.warn("LINE profile fetch failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return null;
  });
  return profile?.userId || "";
}

async function fetchLineProfile(accessToken: string) {
  if (!accessToken) throw new Error("Missing LINE access token");
  const res = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as LineProfileResponse;
}

function toLineClientUserId(sub: string) {
  const body = sub.replace(/[^a-zA-Z0-9_-]/g, "");
  return body.length >= 8 ? `line:${body}` : null;
}

function readReturnPayload(value: string | undefined) {
  const fallback = { clientUserId: "", flow: "signup", ref: "", returnTo: "/account" };
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as { clientUserId?: string; flow?: string; ref?: string; returnTo?: string };
    return {
      clientUserId: normalizeClientUserId(parsed.clientUserId) || "",
      flow: parsed.flow === "login" ? "login" : "signup",
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
