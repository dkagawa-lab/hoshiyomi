import { createHash } from "crypto";
import { BirthInput, Chart } from "@/lib/astrology";
import { PlanKey, planRank, referralRewardCredits, registeredFreeBonusLimit, resolvePlan, reviewCommentRewardCredits, reviewRatingRewardCredits } from "@/lib/plans";
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
  consultation_memory: string | null;
  consultation_memory_updated_at: string | null;
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
  consultationMemory: string | null;
  consultationMemoryUpdatedAt: string | null;
  gender: GenderKey | null;
  isMember: boolean;
  latitude: number | null;
  lineLinked: boolean;
  longitude: number | null;
  name: string | null;
  plan: PlanKey;
  referralCode: string | null;
  romanticInterest: RomanticInterestKey | null;
};

export type StoredReview = {
  id: string;
  comment: string | null;
  comment_rewarded_at: string | null;
  created_at: string;
  display_area: string | null;
  display_name: string | null;
  rating: number;
  rating_rewarded_at: string | null;
  updated_at: string;
  user_id: string;
};

export type UserReviewSnapshot = {
  comment: string;
  commentRewarded: boolean;
  rating: number | null;
  ratingRewarded: boolean;
  updatedAt: string | null;
};

export type PublicReviewSnapshot = {
  comment: string;
  createdAt: string;
  displayArea: string;
  displayName: string;
  id: string;
  rating: number;
};

export type LineBirthPlaceCandidate = {
  city: string;
  label: string;
  latitude: number;
  longitude: number;
};

export type LineBirthRegistrationPayload = {
  birthCity?: string;
  birthDate?: string;
  birthTime?: string;
  candidates?: LineBirthPlaceCandidate[];
  latitude?: number;
  longitude?: number;
};

export type LineBirthRegistrationSession = {
  created_at: string;
  line_user_id: string;
  payload: LineBirthRegistrationPayload;
  step: "date" | "time" | "place" | "confirm";
  updated_at: string;
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

export type NonBillableRateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: string;
  used: number;
};

type QuotaState = UsageSnapshot & {
  baseRemaining: number;
  usesFreeBonus: boolean;
};

type SupabaseConfig = {
  key: string;
  url: string;
};

const nonBillableRateLimit = {
  limit: 5,
  windowMs: 10 * 60 * 1000
};
const localNonBillableEvents = new Map<string, number[]>();

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
  const payload = buildChartUserPayload(input.chart, {
    client_user_id: input.clientUserId,
    is_member: nextIsMember,
    free_bonus_remaining: nextFreeBonus
  });

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

export async function upsertUserForLineChart(input: { chart: Chart; clientUserId: string; isMember: boolean; lineUserId: string }) {
  const lineUserId = normalizeLineUserId(input.lineUserId);
  const clientUserId = normalizeClientUserId(input.clientUserId);
  if (!lineUserId || !clientUserId?.startsWith("line:")) throw new Error("Valid LINE identity is required");

  const existing = await getUserByLineUserId(lineUserId);
  const nextIsMember = existing?.is_member || input.isMember;
  const nextFreeBonus = existing ? (existing.is_member ? existing.free_bonus_remaining : input.isMember ? registeredFreeBonusLimit : existing.free_bonus_remaining) : input.isMember ? registeredFreeBonusLimit : 0;
  const payload = buildChartUserPayload(input.chart, {
    client_user_id: existing?.client_user_id ?? clientUserId,
    free_bonus_remaining: nextFreeBonus,
    is_member: nextIsMember,
    line_user_id: lineUserId
  });

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
    const targetClientUserId = existingByClient.client_user_id || clientUserId;
    if (!targetClientUserId) throw new Error("clientUserId is required");
    await updateUser(existingByLine.id, { line_user_id: null });
    const merged = await mergeClientUserRecords({ sourceClientUserId: existingByLine.client_user_id, targetClientUserId });
    const updated = await updateUser((merged ?? existingByClient).id, {
      is_member: true,
      line_user_id: lineUserId,
      free_bonus_remaining: (merged ?? existingByClient).is_member ? (merged ?? existingByClient).free_bonus_remaining : registeredFreeBonusLimit
    });
    return ensureReferralCodeForUser(updated);
  }

  if (existingByLine) {
    const updated = await updateUser(existingByLine.id, {
      client_user_id: resolveLineLinkedClientUserId(existingByLine, clientUserId),
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

function resolveLineLinkedClientUserId(existing: StoredUser, nextClientUserId: string | null) {
  if (!nextClientUserId) return existing.client_user_id;
  if (nextClientUserId.startsWith("line:") && existing.client_user_id && !existing.client_user_id.startsWith("line:")) {
    return existing.client_user_id;
  }
  return nextClientUserId;
}

export async function mergeClientUserRecords(input: { sourceClientUserId?: string | null; targetClientUserId: string }) {
  const sourceClientUserId = normalizeClientUserId(input.sourceClientUserId);
  const targetClientUserId = normalizeClientUserId(input.targetClientUserId);
  if (!targetClientUserId) throw new Error("targetClientUserId is required");
  if (!sourceClientUserId || sourceClientUserId === targetClientUserId) return getUserByClientUserId(targetClientUserId);

  const source = await getUserByClientUserId(sourceClientUserId);
  if (!source) return getUserByClientUserId(targetClientUserId);

  const target = await getUserByClientUserId(targetClientUserId);
  if (!target) {
    return updateUser(source.id, { client_user_id: targetClientUserId });
  }

  if (source.id === target.id) return target;

  await moveChatMessages(source.id, target.id);
  const merged = await updateUser(target.id, buildMergedUserPayload(source, target, targetClientUserId));
  await updateUser(source.id, { client_user_id: null, line_user_id: null });
  return ensureReferralCodeForUser(merged);
}

export async function getUserSnapshotByClientUserId(clientUserId: string) {
  const existingUser = await getUserByClientUserId(clientUserId);
  return getUserSnapshot(existingUser);
}

export async function getUserSnapshotByLineUserId(lineUserId: string) {
  const existingUser = await getUserByLineUserId(lineUserId);
  return getUserSnapshot(existingUser);
}

async function getUserSnapshot(existingUser: StoredUser | null) {
  const user = existingUser?.is_member ? await ensureReferralCodeForUser(existingUser) : existingUser;
  if (!user) return null;
  const [usage, messages, review] = await Promise.all([getUsageSnapshot(user), listChatMessages(user.id), getUserReviewSnapshot(user.id)]);
  return {
    history: buildStoredHistory(messages, user),
    messages: messages.map((message) => ({ content: message.content, role: message.role })),
    review,
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

export async function updateConsultationMemory(input: { answer: string; question: string; user: StoredUser }) {
  const nextMemory = buildUpdatedConsultationMemory(input.user.consultation_memory, input.question, input.answer);
  if (!nextMemory || nextMemory === normalizeConsultationMemory(input.user.consultation_memory)) return input.user;
  return updateUser(input.user.id, {
    consultation_memory: nextMemory,
    consultation_memory_updated_at: new Date().toISOString()
  });
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

export async function markStripeEventProcessed(input: { id: string; type: string }) {
  const eventId = typeof input.id === "string" ? input.id.trim() : "";
  if (!eventId) return true;
  const response = await supabaseFetch("stripe_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ id: eventId, type: input.type || "unknown" })
  });
  if (response.ok) return true;
  if (response.status === 409) return false;
  const errorText = await response.text();
  if (response.status === 404 || errorText.includes("stripe_events")) {
    const message = "stripe_events table is not available; Stripe webhook event dedupe cannot be guaranteed.";
    if (process.env.NODE_ENV === "production") throw new Error(message);
    console.warn(`${message} Processing without event dedupe in non-production.`);
    return true;
  }
  throw new Error(errorText);
}

export async function deleteStripeEvent(id: string) {
  const eventId = typeof id === "string" ? id.trim() : "";
  if (!eventId) return;
  try {
    const response = await supabaseFetch(`stripe_events?id=eq.${encodeURIComponent(eventId)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" }
    });
    if (!response.ok) {
      console.warn("Stripe event rollback failed", { body: await response.text(), status: response.status });
    }
  } catch (error) {
    console.warn("Stripe event rollback skipped", { message: error instanceof Error ? error.message : "Unknown error" });
  }
}

export async function getUserByLineUserId(lineUserId: string) {
  const normalized = normalizeLineUserId(lineUserId);
  if (!normalized) return null;
  const users = await supabaseJson<StoredUser[]>(`users?line_user_id=eq.${encodeURIComponent(normalized)}&select=*&limit=1`);
  return users[0] ?? null;
}

export async function getLineBirthRegistrationSession(lineUserId: string) {
  const normalized = normalizeLineUserId(lineUserId);
  if (!normalized) return null;
  const sessions = await supabaseJson<LineBirthRegistrationSession[]>(
    `line_birth_registration_sessions?line_user_id=eq.${encodeURIComponent(normalized)}&select=*&limit=1`
  );
  return sessions[0] ?? null;
}

export async function upsertLineBirthRegistrationSession(input: {
  lineUserId: string;
  payload: LineBirthRegistrationPayload;
  step: LineBirthRegistrationSession["step"];
}) {
  const lineUserId = normalizeLineUserId(input.lineUserId);
  if (!lineUserId) throw new Error("lineUserId is required");
  const sessions = await supabaseJson<LineBirthRegistrationSession[]>("line_birth_registration_sessions?on_conflict=line_user_id&select=*", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      line_user_id: lineUserId,
      payload: input.payload,
      step: input.step,
      updated_at: new Date().toISOString()
    })
  });
  return sessions[0] ?? null;
}

export async function deleteLineBirthRegistrationSession(lineUserId: string) {
  const normalized = normalizeLineUserId(lineUserId);
  if (!normalized) return;
  await supabaseJson(`line_birth_registration_sessions?line_user_id=eq.${encodeURIComponent(normalized)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
}

export class ReferralCodeError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ReferralCodeError";
    this.status = status;
  }
}

export class ReviewSubmissionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ReviewSubmissionError";
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
  const referred = await registerClientUser(input.clientUserId);
  return redeemReferralCodeForRegisteredUser(referred, input.code);
}

export async function redeemReferralCodeForLineUser(input: { clientUserId: string; code: string; lineUserId: string }) {
  const referred = await registerLineUser({ clientUserId: input.clientUserId, lineUserId: input.lineUserId });
  return redeemReferralCodeForRegisteredUser(referred, input.code);
}

async function redeemReferralCodeForRegisteredUser(referred: StoredUser, inputCode: string) {
  const code = normalizeReferralCode(inputCode);
  if (!code) throw new ReferralCodeError("紹介コードの形式が正しくありません。", 400);

  const referrer = await getUserByReferralCode(code);
  if (!referrer) throw new ReferralCodeError("紹介コードが見つかりませんでした。", 404);

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

export async function submitUserReview(input: { clientUserId: string; comment?: string | null; rating: number }) {
  const user = await getUserByClientUserId(input.clientUserId);
  return submitUserReviewForStoredUser(user, input);
}

export async function submitUserReviewForLineUser(input: { comment?: string | null; lineUserId: string; rating: number }) {
  const user = await getUserByLineUserId(input.lineUserId);
  return submitUserReviewForStoredUser(user, input);
}

async function submitUserReviewForStoredUser(user: StoredUser | null, input: { comment?: string | null; rating: number }) {
  if (!user || !user.is_member) {
    throw new ReviewSubmissionError("評価特典を受け取るには、先に会員登録またはログインが必要です。", 401);
  }

  const rating = normalizeReviewRating(input.rating);
  const comment = normalizeReviewComment(input.comment);
  if (!rating) throw new ReviewSubmissionError("星評価は1〜5の範囲で選択してください。", 400);
  if (input.comment && !comment) {
    throw new ReviewSubmissionError("口コミ特典を受け取るには、8文字以上で感想を書いてください。星評価だけでも送信できます。", 400);
  }
  if (comment) {
    const moderationMessage = reviewCommentModerationMessage(comment);
    if (moderationMessage) throw new ReviewSubmissionError(moderationMessage, 400);
  }

  const now = new Date().toISOString();
  const payload = {
    comment,
    display_area: buildReviewDisplayArea(user.birth_city),
    display_name: buildReviewProfileLabel(user),
    rating,
    updated_at: now
  };

  await upsertUserReview(user.id, payload);

  let creditsAwarded = 0;
  const ratingRewarded = await markReviewRatingRewarded(user.id, now);
  if (ratingRewarded) {
    creditsAwarded += reviewRatingRewardCredits;
  }
  if (comment) {
    const rewardedReview = await markReviewCommentRewarded(user.id, now);
    if (rewardedReview) {
      creditsAwarded += reviewCommentRewardCredits;
    }
  }

  const updatedUser =
    creditsAwarded > 0
      ? await updateUser(user.id, {
          add_on_credits: Math.max(0, Number(user.add_on_credits || 0)) + creditsAwarded
        })
      : user;

  return {
    creditsAwarded,
    review: await getUserReviewSnapshot(user.id),
    usage: await getUsageSnapshot(updatedUser)
  };
}

export async function getUserReviewSnapshot(userId: string): Promise<UserReviewSnapshot> {
  const review = await getReviewByUserId(userId);
  return toUserReviewSnapshot(review);
}

export async function listPublicReviews(limit = 6): Promise<PublicReviewSnapshot[]> {
  const safeLimit = Math.max(1, Math.min(60, Math.floor(limit) || 6));
  const reviews = await supabaseJson<StoredReview[]>(
    `user_reviews?comment=not.is.null&select=id,rating,comment,display_name,display_area,created_at,updated_at&order=updated_at.desc&limit=${safeLimit}`
  );
  return reviews.filter((review) => typeof review.comment === "string" && review.comment.trim()).map(toPublicReviewSnapshot);
}

export async function checkNonBillableRateLimit(input: { identifier: string; kind: string; scope: string }): Promise<NonBillableRateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(now - nonBillableRateLimit.windowMs);
  const normalizedIdentifier = normalizeRateLimitValue(input.identifier) || "anonymous";
  const normalizedScope = normalizeRateLimitValue(input.scope) || "unknown";
  const keyHash = hashRateLimitKey(`${normalizedScope}:${normalizedIdentifier}`);
  const config = getSupabaseConfig();

  if (!config) {
    return checkLocalNonBillableRateLimit(`${normalizedScope}:${keyHash}`, now);
  }

  try {
    const used = await countNonBillableEvents(normalizedScope, keyHash, windowStart.toISOString());
    if (used >= nonBillableRateLimit.limit) {
      return buildNonBillableRateLimitResult(used, now, undefined, false);
    }

    await supabaseJson("non_billable_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        key_hash: keyHash,
        kind: normalizeRateLimitValue(input.kind) || "unknown",
        scope: normalizedScope
      })
    });
    cleanupOldNonBillableEvents().catch((error) => {
      console.warn("Non-billable event cleanup skipped", { message: error instanceof Error ? error.message : "Unknown error" });
    });
    return buildNonBillableRateLimitResult(used + 1, now);
  } catch (error) {
    console.warn("Non-billable rate limit fell back to local memory", { message: error instanceof Error ? error.message : "Unknown error" });
    return checkLocalNonBillableRateLimit(`${normalizedScope}:${keyHash}`, now);
  }
}

async function upsertUserReview(userId: string, payload: { comment: string | null; display_area: string; display_name: string; rating: number; updated_at: string }) {
  const existing = await getReviewByUserId(userId);
  if (existing) {
    const reviews = await supabaseJson<StoredReview[]>(`user_reviews?user_id=eq.${encodeURIComponent(userId)}&select=*`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload)
    });
    return reviews[0] ?? existing;
  }

  try {
    const reviews = await supabaseJson<StoredReview[]>("user_reviews?select=*", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...payload, user_id: userId })
    });
    return reviews[0];
  } catch {
    const reviews = await supabaseJson<StoredReview[]>(`user_reviews?user_id=eq.${encodeURIComponent(userId)}&select=*`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(payload)
    });
    return reviews[0];
  }
}

async function markReviewRatingRewarded(userId: string, now: string) {
  const reviews = await supabaseJson<StoredReview[]>(`user_reviews?user_id=eq.${encodeURIComponent(userId)}&rating_rewarded_at=is.null&select=*`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      rating_rewarded_at: now
    })
  });
  return reviews[0] ?? null;
}

async function markReviewCommentRewarded(userId: string, now: string) {
  const reviews = await supabaseJson<StoredReview[]>(`user_reviews?user_id=eq.${encodeURIComponent(userId)}&comment_rewarded_at=is.null&comment=not.is.null&select=*`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      comment_rewarded_at: now
    })
  });
  return reviews[0] ?? null;
}

async function getReviewByUserId(userId: string) {
  const reviews = await supabaseJson<StoredReview[]>(`user_reviews?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`);
  return reviews[0] ?? null;
}

function normalizeReviewRating(value: unknown) {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return rating;
}

function normalizeReviewComment(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  if (Array.from(normalized).length < 8) return null;
  return Array.from(normalized).slice(0, 420).join("");
}

function reviewCommentModerationMessage(comment: string) {
  const text = comment.trim();
  if (/(https?:\/\/|www\.|line\.me|lin\.ee|@[\w.-]{3,})/i.test(text)) {
    return "口コミにはURLや外部連絡先を含めないでください。";
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) || /\d[\d\s-]{8,}\d/.test(text)) {
    return "口コミにはメールアドレスや電話番号などの連絡先を含めないでください。";
  }
  if (/死ね|殺す|消えろ|クソ|くそ|馬鹿|バカ|アホ|あほ/.test(text)) {
    return "口コミには過度な暴言や攻撃的な表現を含めないでください。";
  }
  const chars = Array.from(text.replace(/\s/g, ""));
  const uniqueChars = new Set(chars);
  if (chars.length >= 12 && uniqueChars.size <= 3) {
    return "口コミは、実際に感じた内容が伝わる文章で入力してください。";
  }
  if (!/[ぁ-んァ-ヶ一-龠a-zA-Z]/.test(text)) {
    return "口コミは、実際に感じた内容が伝わる文章で入力してください。";
  }
  return "";
}

function toUserReviewSnapshot(review: StoredReview | null): UserReviewSnapshot {
  return {
    comment: review?.comment ?? "",
    commentRewarded: Boolean(review?.comment_rewarded_at),
    rating: typeof review?.rating === "number" ? review.rating : null,
    ratingRewarded: Boolean(review?.rating_rewarded_at),
    updatedAt: review?.updated_at ?? null
  };
}

function toPublicReviewSnapshot(review: StoredReview): PublicReviewSnapshot {
  return {
    comment: review.comment ?? "",
    createdAt: review.updated_at || review.created_at,
    displayArea: review.display_area || "",
    displayName: publicReviewProfileLabel(review),
    id: review.id,
    rating: review.rating
  };
}

function publicReviewProfileLabel(review: StoredReview) {
  const storedProfile = (review.display_name || "").trim();
  if (isReviewProfileLabel(storedProfile)) return storedProfile;
  return review.display_area || "居住地未設定";
}

function buildReviewProfileLabel(user: StoredUser) {
  const parts = [buildReviewDisplayArea(user.birth_city), ageLabel(user.birth_date), reviewGenderLabel(user.gender)].filter(Boolean);
  return parts.length ? parts.join(" / ") : "居住地未設定";
}

function isReviewProfileLabel(value: string) {
  if (!value) return false;
  return value.includes(" / ") && (value.includes("歳") || value.includes("男性") || value.includes("女性") || value.includes("回答しない"));
}

function ageLabel(value: string | null | undefined) {
  if (!value) return "";
  const birthDate = new Date(`${value}T00:00:00+09:00`);
  if (Number.isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 && age < 130 ? `${age}歳` : "";
}

function reviewGenderLabel(value: string | null | undefined) {
  if (value === "male") return "男性";
  if (value === "female") return "女性";
  if (value === "no_answer") return "回答しない";
  return "";
}

function buildReviewDisplayArea(value: string | null | undefined) {
  const city = (value || "").trim();
  if (!city) return "";
  return city.replace(/\s+/g, " ");
}

export async function getUserByClientUserId(clientUserId: string) {
  const users = await supabaseJson<StoredUser[]>(`users?client_user_id=eq.${encodeURIComponent(clientUserId)}&select=*&limit=1`);
  return users[0] ?? null;
}

export async function getUserByStripeCustomerId(customerId: string) {
  const normalized = typeof customerId === "string" ? customerId.trim() : "";
  if (!normalized) return null;
  const users = await supabaseJson<StoredUser[]>(`users?stripe_customer_id=eq.${encodeURIComponent(normalized)}&select=*&limit=1`);
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

function buildUpdatedConsultationMemory(previousMemory: string | null, question: string, answer: string) {
  const previous = normalizeConsultationMemory(previousMemory);
  const themes = uniqueMemoryItems([...extractMemoryItems(previous, "継続テーマ"), ...detectConsultationThemes(question)], 8);
  const questions = uniqueMemoryItems([...extractMemoryItems(previous, "最近の相談"), cleanMemoryText(question, 90)], 8);
  const notes = uniqueMemoryItems([...extractMemoryItems(previous, "引き継ぐ読み筋"), summarizeAnswerForMemory(answer)], 6);

  const lines = [
    "星読みカルテ",
    "継続テーマ:",
    ...(themes.length ? themes : ["まだ蓄積中"]).map((item) => `- ${item}`),
    "最近の相談:",
    ...(questions.length ? questions : ["まだ蓄積中"]).map((item) => `- ${item}`),
    "引き継ぐ読み筋:",
    ...(notes.length ? notes : ["まだ蓄積中"]).map((item) => `- ${item}`)
  ];
  return lines.join("\n").slice(0, 3600);
}

function normalizeConsultationMemory(value: string | null | undefined) {
  return String(value || "").replace(/\r/g, "").trim();
}

function extractMemoryItems(memory: string, heading: string) {
  if (!memory) return [];
  const items: string[] = [];
  let active = false;
  for (const rawLine of memory.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line === `${heading}:`) {
      active = true;
      continue;
    }
    if (active && /^[^-].+:$/.test(line)) break;
    if (active && line.startsWith("- ")) {
      const item = cleanMemoryText(line.slice(2), 180);
      if (item && item !== "まだ蓄積中") items.push(item);
    }
  }
  return items;
}

function detectConsultationThemes(question: string) {
  const text = String(question || "");
  const detectors = [
    { label: "今日の運勢・日々の流れ", pattern: /(今日|本日|明日|運勢|ラッキー|気をつける|過ごし方)/ },
    { label: "恋愛・相性", pattern: /(恋愛|恋|好き|彼|彼女|相手|復縁|片思い|結婚|出会い|デート|相性)/ },
    { label: "仕事・キャリア", pattern: /(仕事|転職|職場|キャリア|上司|同僚|会社|独立|起業|働き方)/ },
    { label: "お金・才能の活かし方", pattern: /(金運|お金|収入|副業|稼|才能|強み|適職|価値)/ },
    { label: "人生の転機・選択", pattern: /(人生|転機|選択|迷い|決断|将来|未来|タイミング|変化)/ },
    { label: "感情・自己理解", pattern: /(不安|しんどい|つらい|モヤモヤ|自分|性格|本質|自己理解|気持ち)/ },
    { label: "人間関係", pattern: /(人間関係|友人|家族|親|子|距離|関係|コミュニケーション)/ }
  ];
  return detectors.filter((item) => item.pattern.test(text)).map((item) => item.label);
}

function summarizeAnswerForMemory(answer: string) {
  const cleaned = cleanMemoryText(answer.replace(/https?:\/\/\S+/g, ""), 260);
  if (!cleaned) return "";
  const sentence = cleaned.match(/^(.{24,220}?[。.!！?？])/);
  return sentence ? sentence[1].trim() : cleaned.slice(0, 180);
}

function cleanMemoryText(value: string, maxLength: number) {
  return String(value || "")
    .replace(/[#*_`>{}[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function uniqueMemoryItems(items: string[], limit: number) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = cleanMemoryText(item, 180);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result.slice(-limit);
}

function toPublicUserSnapshot(user: StoredUser): PublicUserSnapshot {
  return {
    addOnCredits: Number(user.add_on_credits || 0),
    birthCity: user.birth_city,
    birthDate: user.birth_date,
    birthTime: user.birth_time,
    consultationMemory: normalizeConsultationMemory(user.consultation_memory),
    consultationMemoryUpdatedAt: user.consultation_memory_updated_at,
    gender: user.gender,
    isMember: user.is_member,
    latitude: user.latitude === null ? null : Number(user.latitude),
    lineLinked: Boolean(user.line_user_id),
    longitude: user.longitude === null ? null : Number(user.longitude),
    name: user.name,
    plan: resolvePlan(user.plan).key,
    referralCode: user.referral_code ?? null,
    romanticInterest: user.romantic_interest
  };
}

export function birthInputFromStoredUser(user: StoredUser): BirthInput | null {
  if (!user.birth_date || user.latitude === null || user.longitude === null) return null;
  const latitude = Number(user.latitude);
  const longitude = Number(user.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    city: user.birth_city || "",
    date: user.birth_date,
    gender: user.gender || undefined,
    latitude,
    longitude,
    name: user.name || "あなた",
    romanticInterest: user.romantic_interest || undefined,
    time: user.birth_time ? String(user.birth_time).slice(0, 5) : ""
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

async function moveChatMessages(sourceUserId: string, targetUserId: string) {
  await supabaseJson(`chat_messages?user_id=eq.${encodeURIComponent(sourceUserId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: targetUserId })
  });
}

function buildMergedUserPayload(source: StoredUser, target: StoredUser, targetClientUserId: string) {
  const sourcePlan = resolvePlan(source.plan).key;
  const targetPlan = resolvePlan(target.plan).key;
  const plan = planRank(sourcePlan) > planRank(targetPlan) ? sourcePlan : targetPlan;
  return {
    client_user_id: targetClientUserId,
    line_user_id: target.line_user_id ?? source.line_user_id,
    name: target.name ?? source.name,
    birth_date: target.birth_date ?? source.birth_date,
    birth_time: target.birth_time ?? source.birth_time,
    birth_city: target.birth_city ?? source.birth_city,
    gender: target.gender ?? source.gender,
    romantic_interest: target.romantic_interest ?? source.romantic_interest,
    latitude: target.latitude ?? source.latitude,
    longitude: target.longitude ?? source.longitude,
    plan,
    is_member: target.is_member || source.is_member,
    free_bonus_remaining: Math.max(Number(target.free_bonus_remaining || 0), Number(source.free_bonus_remaining || 0)),
    add_on_credits: Math.max(0, Number(target.add_on_credits || 0)) + Math.max(0, Number(source.add_on_credits || 0)),
    referral_code: target.referral_code ?? source.referral_code,
    referred_by_user_id: target.referred_by_user_id ?? source.referred_by_user_id,
    stripe_customer_id: target.stripe_customer_id ?? source.stripe_customer_id,
    stripe_subscription_id: target.stripe_subscription_id ?? source.stripe_subscription_id,
    consultation_memory: target.consultation_memory ?? source.consultation_memory,
    consultation_memory_updated_at: target.consultation_memory_updated_at ?? source.consultation_memory_updated_at
  };
}

function buildChartUserPayload(
  chart: Chart,
  base: {
    client_user_id?: string | null;
    free_bonus_remaining: number;
    is_member: boolean;
    line_user_id?: string | null;
  }
) {
  return {
    ...base,
    name: chart.input.name || null,
    birth_date: chart.input.date || null,
    birth_time: chart.input.time || null,
    birth_city: chart.input.city || null,
    gender: chart.input.gender || null,
    romantic_interest: chart.input.romanticInterest || null,
    latitude: Number.isFinite(Number(chart.input.latitude)) ? Number(chart.input.latitude) : null,
    longitude: Number.isFinite(Number(chart.input.longitude)) ? Number(chart.input.longitude) : null,
    updated_at: new Date().toISOString()
  };
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

async function countNonBillableEvents(scope: string, keyHash: string, windowStartIso: string) {
  const response = await supabaseFetch(
    `non_billable_events?scope=eq.${encodeURIComponent(scope)}&key_hash=eq.${encodeURIComponent(keyHash)}&created_at=gte.${encodeURIComponent(windowStartIso)}&select=id&limit=1`,
    {
      headers: { Prefer: "count=exact" }
    }
  );
  if (!response.ok) throw new Error(await response.text());
  const range = response.headers.get("content-range");
  const total = range?.split("/")[1];
  return total && total !== "*" ? Number(total) || 0 : 0;
}

async function cleanupOldNonBillableEvents(date = new Date()) {
  const cutoff = new Date(date.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const response = await supabaseFetch(`non_billable_events?created_at=lt.${encodeURIComponent(cutoff)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });
  if (!response.ok) throw new Error(await response.text());
}

function checkLocalNonBillableRateLimit(key: string, now: number): NonBillableRateLimitResult {
  const windowStart = now - nonBillableRateLimit.windowMs;
  const events = (localNonBillableEvents.get(key) ?? []).filter((timestamp) => timestamp >= windowStart);
  if (events.length >= nonBillableRateLimit.limit) {
    localNonBillableEvents.set(key, events);
    return buildNonBillableRateLimitResult(events.length, now, events[0] + nonBillableRateLimit.windowMs, false);
  }

  const nextEvents = [...events, now];
  localNonBillableEvents.set(key, nextEvents);
  return buildNonBillableRateLimitResult(nextEvents.length, now, nextEvents[0] + nonBillableRateLimit.windowMs);
}

function buildNonBillableRateLimitResult(used: number, now: number, resetAtMs = now + nonBillableRateLimit.windowMs, allowed = true): NonBillableRateLimitResult {
  return {
    allowed,
    limit: nonBillableRateLimit.limit,
    remaining: Math.max(0, nonBillableRateLimit.limit - used),
    retryAfterSeconds: Math.max(1, Math.ceil((resetAtMs - now) / 1000)),
    resetAt: new Date(resetAtMs).toISOString(),
    used
  };
}

function hashRateLimitKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeRateLimitValue(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 120);
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
  const text = await response.text();
  if (!response.ok) throw new Error(text);
  if (!text) return null as T;
  return JSON.parse(text) as T;
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
  const url = readEnv("SUPABASE_URL") || readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return { key, url: url.replace(/\/$/, "") };
}

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}
