import { Chart } from "@/lib/astrology";
import { PlanKey, referralRewardCredits, registeredFreeBonusLimit, resolvePlan } from "@/lib/plans";
import type { GenderKey, RomanticInterestKey } from "@/lib/profileOptions";

export type StoredUser = {
  id: string;
  client_user_id: string | null;
  line_user_id: string | null;
  gender: GenderKey | null;
  romantic_interest: RomanticInterestKey | null;
  name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_city: string | null;
  latitude: number | null;
  longitude: number | null;
  plan: PlanKey;
  is_member: boolean;
  free_bonus_remaining: number;
  add_on_credits: number;
  referral_code: string | null;
  referred_by_user_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

export type UsageSnapshot = {
  plan: PlanKey;
  used: number;
  isMember: boolean;
  freeBonusRemaining: number;
  addOnCredits: number;
  remaining: number;
};

export type StoredChatMessage = {
  id: string;
  content: string;
  created_at: string;
  role: "user" | "assistant";
  user_id: string;
};

export type StoredHistoryEntry = {
  id: string;
  answer: string;
  birthDate: string;
  chartName: string;
  createdAt: string;
  question: string;
};

export type PublicUserSnapshot = {
  addOnCredits: number;
  birthCity: string | null;
  birthDate: string | null;
  birthTime: string | null;
  gender: GenderKey | null;
  isMember: boolean;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
  plan: PlanKey;
  referralCode: string | null;
  romanticInterest: RomanticInterestKey | null;
};

export type ContactInquiryInput = {
  category: string;
  email: string;
  message: string;
  name: string;
  pageUrl?: string | null;
  plan?: string | null;
  userAgent?: string | null;
};

type QuotaState = UsageSnapshot & {
  baseRemaining: number;
  usesFreeBonus: boolean;
};

type SupabaseConfig = {
  key: string;
  url: string;
};

export function isServerStoreConfigured() {
  return Boolean(getSupabaseConfig());
}

export function normalizeClientUserId(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9:_-]{12,100}$/.test(trimmed)) return null;
  return trimmed;
}

export function normalizeLineUserId(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^[a-zA-Z0-9_-]{8,100}$/.test(trimmed)) return null;
  return trimmed;
}

export async function upsertUserForChart(input: { chart: Chart; clientUserId: string; isMember: boolean }) {
  const existing = await getUserByClientUserId(input.clientUserId);
  const nextIsMember = existing?.is_member || input.isMember;
  const nextFreeBonus = existing ? (existing.is_member ? existing.free_bonus_remaining : input.isMember ? registeredFreeBonusLimit : existing.free_bonus_remaining) : input.isMember ? registeredFreeBonusLimit : 0;
  const payload = {
    client_user_id: input.clientUserId,
    name: input.chart.input.name || null,
    birth_date: input.chart.input.date || null,
    birth_time: input.chart.input.time || null,
    birth_city: input.chart.input.city || null,
    gender: input.chart.input.gender || null,
    romantic_interest: input.chart.input.romanticInterest || null,
    latitude: Number.isFinite(Number(input.chart.input.latitude)) ? Number(input.chart.input.latitude) : null,
    longitude: Number.isFinite(Number(input.chart.input.longitude)) ? Number(input.chart.input.longitude) : null,
    is_member: nextIsMember,
    free_bonus_remaining: nextFreeBonus,
    updated_at: new Date().toISOString()
  };

  if (existing) {
    const users = await supabaseJson<StoredUser[]>(`users?id=eq.${encodeURIComponent(existing.id)}&select=*`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload)
    });
    return users[0] ?? existing;
  }

  const users = await supabaseJson<StoredUser[]>("users?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...payload, plan: "free", add_on_credits: 0 })
  });
  return users[0];
}

export async function registerClientUser(clientUserId: string) {
  const existing = await getUserByClientUserId(clientUserId);
  if (existing) {
    const updated = await updateUser(existing.id, {
      is_member: true,
      free_bonus_remaining: existing.is_member ? existing.free_bonus_remaining : registeredFreeBonusLimit
    });
    return ensureReferralCodeForUser(updated);
  }
  const users = await supabaseJson<StoredUser[]>("users?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      client_user_id: clientUserId,
      is_member: true,
      plan: "free",
      free_bonus_remaining: registeredFreeBonusLimit,
      add_on_credits: 0
    })
  });
  return ensureReferralCodeForUser(users[0]);
}

export async function registerLineUser(input: { clientUserId?: string | null; lineUserId: string }) {
  const lineUserId = normalizeLineUserId(input.lineUserId);
  const clientUserId = normalizeClientUserId(input.clientUserId);
  if (!lineUserId) throw new Error("lineUserId is required");

  const existingByLine = await getUserByLineUserId(lineUserId);
  const existingByClient = clientUserId ? await getUserByClientUserId(clientUserId) : null;
  if (existingByLine && existingByClient && existingByLine.id !== existingByClient.id) {
    await updateUser(existingByLine.id, { line_user_id: null });
    const updated = await updateUser(existingByClient.id, {
      is_member: true,
      line_user_id: lineUserId,
      free_bonus_remaining: existingByClient.is_member ? existingByClient.free_bonus_remaining : registeredFreeBonusLimit
    });
    return ensureReferralCodeForUser(updated);
  }

  if (existingByLine) {
    const updated = await updateUser(existingByLine.id, {
      client_user_id: existingByLine.client_user_id ?? clientUserId,
      is_member: true,
      line_user_id: lineUserId,
      free_bonus_remaining: existingByLine.is_member ? existingByLine.free_bonus_remaining : registeredFreeBonusLimit
    });
    return ensureReferralCodeForUser(updated);
  }

  if (existingByClient) {
    const updated = await updateUser(existingByClient.id, {
      is_member: true,
      line_user_id: lineUserId,
      free_bonus_remaining: existingByClient.is_member ? existingByClient.free_bonus_remaining : registeredFreeBonusLimit
    });
    return ensureReferralCodeForUser(updated);
  }

  const users = await supabaseJson<StoredUser[]>("users?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      client_user_id: clientUserId ?? `line:${lineUserId}`,
      line_user_id: lineUserId,
      is_member: true,
      plan: "free",
      free_bonus_remaining: registeredFreeBonusLimit,
      add_on_credits: 0
    })
  });
  return ensureReferralCodeForUser(users[0]);
}

export async function getUserSnapshotByClientUserId(clientUserId: string) {
  const existingUser = await getUserByClientUserId(clientUserId);
  const user = existingUser?.is_member ? await ensureReferralCodeForUser(existingUser) : existingUser;
  if (!user) return null;
  const [usage, messages] = await Promise.all([getUsageSnapshot(user), listChatMessages(user.id)]);
  return {
    history: buildStoredHistory(messages, user),
    messages: messages.map((message) => ({ content: message.content, role: message.role })),
    usage,
    user: toPublicUserSnapshot(user)
  };
}

export async function getUsageSnapshot(user: StoredUser): Promise<UsageSnapshot> {
  const quota = await getQuotaState(user);
  return {
    plan: quota.plan,
    used: quota.used,
    isMember: quota.isMember,
    freeBonusRemaining: quota.freeBonusRemaining,
    addOnCredits: quota.addOnCredits,
    remaining: quota.remaining
  };
}

export async function getQuotaState(user: StoredUser): Promise<QuotaState> {
  const plan = resolvePlan(user.plan).key;
  const used = await countUserMessages(user.id, plan);
  const planConfig = resolvePlan(plan);
  const usesFreeBonus = plan === "free" && user.is_member && user.free_bonus_remaining > 0;
  const baseRemaining = usesFreeBonus ? user.free_bonus_remaining : Math.max(0, planConfig.questionLimit - used);
  const addOnCredits = Math.max(0, Number(user.add_on_credits || 0));
  return {
    plan,
    used,
    isMember: user.is_member,
    freeBonusRemaining: Math.max(0, Number(user.free_bonus_remaining || 0)),
    addOnCredits,
    remaining: baseRemaining + addOnCredits,
    baseRemaining,
    usesFreeBonus
  };
}

export async function insertChatTurn(input: { answer: string; question: string; userId: string }) {
  await supabaseJson("chat_messages", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify([
      { user_id: input.userId, role: "user", content: input.question },
      { user_id: input.userId, role: "assistant", content: input.answer }
    ])
  });
}

export async function listChatMessages(userId: string, limit = 60) {
  const messages = await supabaseJson<StoredChatMessage[]>(
    `chat_messages?user_id=eq.${encodeURIComponent(userId)}&select=id,user_id,role,content,created_at&order=created_at.desc&limit=${limit}`
  );
  return messages.reverse();
}

export async function countLifetimeUserMessages(userId: string) {
  return countUserMessagesByPath(`chat_messages?user_id=eq.${encodeURIComponent(userId)}&role=eq.user&select=id&limit=1`);
}

export async function consumeQuota(user: StoredUser, quota: QuotaState) {
  if (quota.usesFreeBonus) {
    return updateUser(user.id, { free_bonus_remaining: Math.max(0, quota.freeBonusRemaining - 1) });
  }
  if (quota.baseRemaining > 0) return user;
  if (quota.addOnCredits > 0) {
    return updateUser(user.id, { add_on_credits: Math.max(0, quota.addOnCredits - 1) });
  }
  return user;
}

export async function updateUserPlanByClientUserId(input: { clientUserId: string; customerId?: string | null; plan: PlanKey; subscriptionId?: string | null }) {
  const existing = await getUserByClientUserId(input.clientUserId);
  const payload = {
    client_user_id: input.clientUserId,
    is_member: true,
    plan: input.plan,
    stripe_customer_id: input.customerId ?? existing?.stripe_customer_id ?? null,
    stripe_subscription_id: input.subscriptionId ?? existing?.stripe_subscription_id ?? null,
    updated_at: new Date().toISOString()
  };

  if (existing) return updateUser(existing.id, payload);

  const users = await supabaseJson<StoredUser[]>("users?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...payload, free_bonus_remaining: 0, add_on_credits: 0 })
  });
  return users[0];
}

export async function addCreditsByClientUserId(input: { clientUserId: string; credits: number }) {
  const existing = await getUserByClientUserId(input.clientUserId);
  if (existing) {
    return updateUser(existing.id, {
      add_on_credits: Math.max(0, Number(existing.add_on_credits || 0)) + input.credits,
      is_member: true
    });
  }
  const users = await supabaseJson<StoredUser[]>("users?select=*", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      client_user_id: input.clientUserId,
      is_member: true,
      plan: "free",
      free_bonus_remaining: 0,
      add_on_credits: input.credits
    })
  });
  return users[0];
}

export async function getUserByLineUserId(lineUserId: string) {
  const normalized = normalizeLineUserId(lineUserId);
  if (!normalized) return null;
  const users = await supabaseJson<StoredUser[]>(`users?line_user_id=eq.${encodeURIComponent(normalized)}&select=*&limit=1`);
  return users[0] ?? null;
}

export class ReferralCodeError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ReferralCodeError";
    this.status = status;
  }
}

export function normalizeReferralCode(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = normalized.startsWith("HSY") ? normalized.slice(3) : normalized;
  if (!/^[A-Z0-9]{8}$/.test(body)) return null;
  return `HSY-${body}`;
}

export async function redeemReferralCode(input: { clientUserId: string; code: string }) {
  const code = normalizeReferralCode(input.code);
  if (!code) throw new ReferralCodeError("紹介コードの形式が正しくありません。", 400);

  const referrer = await getUserByReferralCode(code);
  if (!referrer) throw new ReferralCodeError("紹介コードが見つかりませんでした。", 404);

  const referred = await registerClientUser(input.clientUserId);
  if (referrer.id === referred.id) {
    throw new ReferralCodeError("自分の紹介コードは使用できません。", 400);
  }

  const existingRedemption = await getReferralRedemptionByReferredUserId(referred.id);
  if (existingRedemption) {
    throw new ReferralCodeError("紹介コードはすでに使用済みです。", 409);
  }

  try {
    await supabaseJson("referral_redemptions", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        referral_code: code,
        referrer_user_id: referrer.id,
        referred_user_id: referred.id,
        credits: referralRewardCredits
      })
    });
  } catch {
    throw new ReferralCodeError("紹介コードはすでに使用済みです。", 409);
  }

  await updateUser(referrer.id, {
    add_on_credits: Math.max(0, Number(referrer.add_on_credits || 0)) + referralRewardCredits
  });
  const updatedReferred = await updateUser(referred.id, {
    add_on_credits: Math.max(0, Number(referred.add_on_credits || 0)) + referralRewardCredits,
    referred_by_user_id: referrer.id
  });

  return {
    credits: referralRewardCredits,
    referrerCode: code,
    user: await ensureReferralCodeForUser(updatedReferred),
    usage: await getUsageSnapshot(updatedReferred)
  };
}

export async function insertContactInquiry(input: ContactInquiryInput) {
  const inquiries = await supabaseJson<{ id: string }[]>("contact_inquiries?select=id", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      category: input.category,
      email: input.email,
      message: input.message,
      name: input.name,
      page_url: input.pageUrl || null,
      plan: input.plan || null,
      user_agent: input.userAgent || null,
      status: "new"
    })
  });
  return inquiries[0] ?? null;
}

export async function getUserByClientUserId(clientUserId: string) {
  const users = await supabaseJson<StoredUser[]>(`users?client_user_id=eq.${encodeURIComponent(clientUserId)}&select=*&limit=1`);
  return users[0] ?? null;
}

async function getUserByReferralCode(referralCode: string) {
  const users = await supabaseJson<StoredUser[]>(`users?referral_code=eq.${encodeURIComponent(referralCode)}&select=*&limit=1`);
  return users[0] ?? null;
}

async function getReferralRedemptionByReferredUserId(userId: string) {
  const redemptions = await supabaseJson<{ id: string }[]>(`referral_redemptions?referred_user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`);
  return redemptions[0] ?? null;
}

async function ensureReferralCodeForUser(user: StoredUser) {
  if (!user || user.referral_code) return user;
  try {
    return await updateUser(user.id, { referral_code: await createUniqueReferralCode() });
  } catch (error) {
    console.warn("Referral code is not available yet", { message: error instanceof Error ? error.message : "Unknown error" });
    return user;
  }
}

async function createUniqueReferralCode() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = createReferralCodeCandidate();
    if (!(await getUserByReferralCode(code))) return code;
  }
  throw new Error("Failed to create referral code");
}

function createReferralCodeCandidate() {
  const source = typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : `${Date.now()}${Math.random()}`;
  const body = source.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase().padEnd(8, "0");
  return `HSY-${body}`;
}

function buildStoredHistory(messages: StoredChatMessage[], user: StoredUser) {
  const entries: StoredHistoryEntry[] = [];
  for (let index = 0; index < messages.length; index++) {
    const current = messages[index];
    const next = messages[index + 1];
    if (current?.role === "user" && next?.role === "assistant") {
      entries.unshift({
        id: `${current.id}-${next.id}`,
        answer: next.content,
        birthDate: user.birth_date ?? "",
        chartName: user.name || "あなた",
        createdAt: next.created_at,
        question: current.content
      });
      index += 1;
    }
  }
  return entries.slice(0, 30);
}

function toPublicUserSnapshot(user: StoredUser): PublicUserSnapshot {
  return {
    addOnCredits: Number(user.add_on_credits || 0),
    birthCity: user.birth_city,
    birthDate: user.birth_date,
    birthTime: user.birth_time,
    gender: user.gender,
    isMember: user.is_member,
    latitude: user.latitude === null ? null : Number(user.latitude),
    longitude: user.longitude === null ? null : Number(user.longitude),
    name: user.name,
    plan: resolvePlan(user.plan).key,
    referralCode: user.referral_code ?? null,
    romanticInterest: user.romantic_interest
  };
}

async function updateUser(userId: string, payload: Record<string, unknown>) {
  const users = await supabaseJson<StoredUser[]>(`users?id=eq.${encodeURIComponent(userId)}&select=*`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() })
  });
  return users[0];
}

async function countUserMessages(userId: string, plan: PlanKey) {
  const start = periodStartIso(plan);
  return countUserMessagesByPath(`chat_messages?user_id=eq.${encodeURIComponent(userId)}&role=eq.user&created_at=gte.${encodeURIComponent(start)}&select=id&limit=1`);
}

async function countUserMessagesByPath(path: string) {
  const response = await supabaseFetch(path, {
    headers: { Prefer: "count=exact" }
  });
  if (!response.ok) throw new Error(await response.text());
  const range = response.headers.get("content-range");
  const total = range?.split("/")[1];
  return total && total !== "*" ? Number(total) || 0 : 0;
}

function periodStartIso(plan: PlanKey, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});
  const day = resolvePlan(plan).usagePeriod === "day" ? parts.day : "01";
  return new Date(`${parts.year}-${parts.month}-${day}T00:00:00+09:00`).toISOString();
}

async function supabaseJson<T>(path: string, init: RequestInit = {}) {
  const response = await supabaseFetch(path, init);
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured");
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined)
  };
  return fetch(`${config.url}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { key, url: url.replace(/\/$/, "") };
}
