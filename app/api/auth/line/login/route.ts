import { NextRequest, NextResponse } from "next/server";

const stateCookieName = "hoshiyomi_line_oauth_state";
const nextCookieName = "hoshiyomi_line_oauth_next";

export async function GET(req: NextRequest) {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.redirect(new URL("/register?authError=line_not_configured", req.url));
  }

  const origin = new URL(req.url).origin;
  const redirectUri = process.env.LINE_LOGIN_REDIRECT_URI || `${origin}/api/auth/line/callback`;
  const state = createRandomValue();
  const nonce = createRandomValue();
  const nextPayload = Buffer.from(
    JSON.stringify({
      flow: resolveAuthFlow(req.nextUrl.searchParams.get("mode")),
      clientUserId: resolveClientUserId(req.nextUrl.searchParams.get("clientUserId")),
      ref: req.nextUrl.searchParams.get("ref") || "",
      returnTo: resolveReturnTo(req.nextUrl.searchParams.get("returnTo"))
    })
  ).toString("base64url");

  const authorizeUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", channelId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("scope", "profile openid");
  authorizeUrl.searchParams.set("nonce", nonce);

  const res = NextResponse.redirect(authorizeUrl);
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(stateCookieName, state, { httpOnly: true, maxAge: 600, path: "/", sameSite: "lax", secure });
  res.cookies.set(nextCookieName, nextPayload, { httpOnly: true, maxAge: 600, path: "/", sameSite: "lax", secure });
  return res;
}

function createRandomValue() {
  return crypto.randomUUID().replace(/-/g, "");
}

function resolveReturnTo(value: string | null) {
  const allowed = new Set(["/account", "/reading", "/consultation", "/dashboard", "/pricing"]);
  return value && allowed.has(value) ? value : "/account";
}

function resolveAuthFlow(value: string | null) {
  return value === "login" ? "login" : "signup";
}

function resolveClientUserId(value: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  return /^[a-zA-Z0-9:_-]{12,100}$/.test(trimmed) ? trimmed : "";
}
