import { NextResponse } from "next/server";
import { authClientCookieName } from "@/lib/authRegistrationClient";
import { lineAuthSessionCookieName, signLineSessionValue } from "@/lib/serverAuth";
import { isServerStoreConfigured, registerLineUser } from "@/lib/serverStore";

type LineLiffRequest = {
  accessToken?: string;
  flow?: string;
  ref?: string;
  returnTo?: string;
};

type LineProfileResponse = {
  displayName?: string;
  userId?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as LineLiffRequest;
  const profile = await fetchLineProfile(body.accessToken || "").catch((error) => {
    console.warn("LIFF profile fetch failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return null;
  });
  const lineUserId = profile?.userId || "";
  const clientUserId = toLineClientUserId(lineUserId);
  if (!clientUserId) {
    return NextResponse.json({ error: "LINE認証を確認できませんでした。もう一度お試しください。" }, { status: 401 });
  }

  if (isServerStoreConfigured()) {
    try {
      await registerLineUser({ clientUserId, lineUserId });
    } catch (error) {
      console.warn("LIFF registration could not be stored yet", { message: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  const lineSessionValue = signLineSessionValue(clientUserId);
  if (!lineSessionValue) {
    return NextResponse.json({ error: "LINE認証の保存設定が未完了です。" }, { status: 500 });
  }

  const completeUrl = new URL("/auth/line/complete", req.url);
  completeUrl.searchParams.set("returnTo", resolveReturnTo(body.returnTo || null));
  completeUrl.searchParams.set("flow", body.flow === "login" ? "login" : "signup");
  if (body.ref?.trim()) completeUrl.searchParams.set("ref", body.ref.trim());

  const secure = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ url: `${completeUrl.pathname}${completeUrl.search}` });
  res.cookies.set(authClientCookieName, "line", { httpOnly: false, maxAge: 600, path: "/", sameSite: "lax", secure });
  res.cookies.set(lineAuthSessionCookieName, lineSessionValue, { httpOnly: true, maxAge: 60 * 60 * 24 * 90, path: "/", sameSite: "lax", secure });
  return res;
}

async function fetchLineProfile(accessToken: string) {
  if (!accessToken) throw new Error("Missing LINE LIFF access token");
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

function resolveReturnTo(value: string | null) {
  const allowed = new Set(["/account", "/reading", "/consultation", "/dashboard", "/pricing"]);
  return value && allowed.has(value) ? value : "/account";
}
