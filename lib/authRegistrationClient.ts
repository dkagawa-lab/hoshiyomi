import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { BirthInput } from "@/lib/astrology";
import { writeClientUserId } from "@/lib/clientIdentity";
import { addAddOnCredits, ensureFreeBonusRemaining, readAddOnCredits, referralRewardCredits } from "@/lib/plans";

export const authClientCookieName = "hoshiyomi_auth_client_user_id";
export const authMethodKey = "hoshiyomi:authMethod";
export const pendingReferralCodeKey = "hoshiyomi:pendingReferralCode";
export type AuthFlowMode = "signup" | "login";
export type AuthMethod = "google" | "line" | "local" | "mail";

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

export async function getAuthAccessToken() {
  const supabase = getSupabaseAuthClient();
  if (!supabase) return "";
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

export async function buildAuthHeaders(baseHeaders: Record<string, string> = {}) {
  const token = await getAuthAccessToken();
  return token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
}

export function authClientUserId(userId: string) {
  return `auth:${userId}`;
}

export function resolveReturnTo(value: string | null) {
  const allowed = new Set([
    "/account",
    "/reading",
    "/consultation",
    "/dashboard",
    "/pricing",
    "/en/account",
    "/en/reading",
    "/en/consultation",
    "/en/dashboard",
    "/en/pricing"
  ]);
  return value && allowed.has(value) ? value : "/account";
}

export function buildRegistrationCompleteUrl(returnTo: string, method = "mail", flow: AuthFlowMode = "signup") {
  const url = new URL("/registration-complete", window.location.origin);
  url.searchParams.set("returnTo", resolveReturnTo(returnTo));
  url.searchParams.set("method", method);
  url.searchParams.set("flow", flow);
  return `${url.pathname}${url.search}`;
}

export function registerButtonLabel(returnTo: string) {
  if (returnTo === "/reading") return "同意して続きを読む";
  if (returnTo === "/consultation") return "同意して相談へ戻る";
  return "同意して会員登録する";
}

export function buildAuthRedirectUrl(returnTo: string, referralCode = "", flow: AuthFlowMode = "signup") {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("returnTo", resolveReturnTo(returnTo));
  url.searchParams.set("flow", flow);
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

export function readAuthMethod(): AuthMethod | "" {
  if (typeof window === "undefined") return "";
  const value = window.localStorage.getItem(authMethodKey) || window.sessionStorage.getItem(authMethodKey) || "";
  return isAuthMethod(value) ? value : "";
}

export function writeAuthMethod(method: AuthMethod) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(authMethodKey, method);
  window.sessionStorage.setItem(authMethodKey, method);
}

function isAuthMethod(value: string): value is AuthMethod {
  return value === "mail" || value === "google" || value === "line" || value === "local";
}

export async function completeClientRegistration(input: { authMethod?: AuthMethod; birth?: BirthInput | null; clientUserId: string; lineClientUserId?: string; referralCode?: string }) {
  const previousClientUserId = readStoredClientUserId();
  writeClientUserId(input.clientUserId);
  if (input.authMethod) writeAuthMethod(input.authMethod);
  window.localStorage.setItem("hoshiyomi:member", "true");
  window.sessionStorage.setItem("hoshiyomi:member", "true");
  ensureFreeBonusRemaining();

  await fetch("/api/register", {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      birth: input.birth ?? readStoredBirth(),
      clientUserId: input.clientUserId,
      lineClientUserId: input.lineClientUserId || resolveLineClientUserId(input.clientUserId, previousClientUserId),
      previousClientUserId: previousClientUserId && previousClientUserId !== input.clientUserId ? previousClientUserId : undefined
    })
  }).catch(() => undefined);

  const code = (input.referralCode || readPendingReferralCode()).trim();
  if (code) await applyReferralCode(input.clientUserId, code);
  clearPendingReferralCode();
}

function readStoredClientUserId() {
  try {
    return window.localStorage.getItem("hoshiyomi:clientUserId") || window.sessionStorage.getItem("hoshiyomi:clientUserId") || "";
  } catch {
    return "";
  }
}

function resolveLineClientUserId(clientUserId: string, previousClientUserId: string) {
  if (clientUserId.startsWith("line:")) return clientUserId;
  if (previousClientUserId.startsWith("line:")) return previousClientUserId;
  return undefined;
}

export async function applyReferralCode(clientUserId: string, code: string) {
  try {
    const res = await fetch("/api/referral", {
      method: "POST",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
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
