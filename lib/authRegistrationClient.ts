import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { BirthInput } from "@/lib/astrology";
import { writeClientUserId } from "@/lib/clientIdentity";
import { addAddOnCredits, ensureFreeBonusRemaining, readAddOnCredits, referralRewardCredits } from "@/lib/plans";

export const authClientCookieName = "hoshiyomi_auth_client_user_id";
export const pendingReferralCodeKey = "hoshiyomi:pendingReferralCode";

let supabaseBrowserClient: SupabaseClient | null = null;

export function isSupabaseAuthConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true
      }
    });
  }
  return supabaseBrowserClient;
}

export function authClientUserId(userId: string) {
  return `auth:${userId}`;
}

export function resolveReturnTo(value: string | null) {
  const allowed = new Set(["/account", "/reading", "/consultation", "/dashboard", "/pricing"]);
  return value && allowed.has(value) ? value : "/account";
}

export function buildRegistrationCompleteUrl(returnTo: string, method = "mail") {
  const url = new URL("/registration-complete", window.location.origin);
  url.searchParams.set("returnTo", resolveReturnTo(returnTo));
  url.searchParams.set("method", method);
  return `${url.pathname}${url.search}`;
}

export function registerButtonLabel(returnTo: string) {
  if (returnTo === "/reading") return "同意して続きを読む";
  if (returnTo === "/consultation") return "同意して相談へ戻る";
  return "同意して会員登録する";
}

export function buildAuthRedirectUrl(returnTo: string, referralCode = "") {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("returnTo", resolveReturnTo(returnTo));
  const code = referralCode.trim();
  if (code) url.searchParams.set("ref", code);
  return url.toString();
}

export function buildPasswordRedirectUrl(returnTo: string, referralCode = "", mode: "recovery" | "signup" = "signup") {
  const url = new URL("/auth/password", window.location.origin);
  url.searchParams.set("mode", mode);
  url.searchParams.set("returnTo", resolveReturnTo(returnTo));
  const code = referralCode.trim();
  if (code) url.searchParams.set("ref", code);
  return url.toString();
}

export function rememberPendingReferralCode(code: string) {
  const nextCode = code.trim();
  if (!nextCode) return;
  try {
    window.localStorage.setItem(pendingReferralCodeKey, nextCode);
    window.sessionStorage.setItem(pendingReferralCodeKey, nextCode);
  } catch {}
}

export function readPendingReferralCode() {
  try {
    return window.localStorage.getItem(pendingReferralCodeKey) || window.sessionStorage.getItem(pendingReferralCodeKey) || "";
  } catch {
    return "";
  }
}

export function clearPendingReferralCode() {
  try {
    window.localStorage.removeItem(pendingReferralCodeKey);
    window.sessionStorage.removeItem(pendingReferralCodeKey);
  } catch {}
}

export function readStoredBirth(): BirthInput | null {
  try {
    const raw = window.localStorage.getItem("hoshiyomi:birth") ?? window.sessionStorage.getItem("hoshiyomi:birth");
    return raw ? (JSON.parse(raw) as BirthInput) : null;
  } catch {
    return null;
  }
}

export function readCookieValue(name: string) {
  if (typeof document === "undefined") return "";
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : "";
}

export async function completeClientRegistration(input: { birth?: BirthInput | null; clientUserId: string; referralCode?: string }) {
  writeClientUserId(input.clientUserId);
  window.localStorage.setItem("hoshiyomi:member", "true");
  window.sessionStorage.setItem("hoshiyomi:member", "true");
  ensureFreeBonusRemaining();

  await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ birth: input.birth ?? readStoredBirth(), clientUserId: input.clientUserId })
  }).catch(() => undefined);

  const code = (input.referralCode || readPendingReferralCode()).trim();
  if (code) await applyReferralCode(input.clientUserId, code);
  clearPendingReferralCode();
}

export async function applyReferralCode(clientUserId: string, code: string) {
  try {
    const res = await fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientUserId, code })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return;
    if (data.mode === "local") {
      addAddOnCredits(readAddOnCredits(), referralRewardCredits);
    }
    window.localStorage.setItem("hoshiyomi:referralRedeemedCode", code);
  } catch {}
}
