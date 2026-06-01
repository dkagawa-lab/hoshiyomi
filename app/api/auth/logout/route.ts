import { NextResponse } from "next/server";
import { authClientCookieName } from "@/lib/authRegistrationClient";
import { lineAuthSessionCookieName } from "@/lib/serverAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(authClientCookieName);
  res.cookies.delete(lineAuthSessionCookieName);
  return res;
}
