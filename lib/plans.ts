import { ReaderStyleKey, readerStyles } from "@/lib/readerStyles";

export type PlanKey = "free" | "standard" | "luxury";
export type PlanUsagePeriod = "day" | "month";
export type AddOnPackKey = "addon_100";

export type ServicePlan = {
  key: PlanKey;
  label: string;
  shortLabel: string;
  priceLabel: string;
  renewalPriceLabel?: string;
  questionLimit: number;
  usagePeriod: PlanUsagePeriod;
  answerDisplay: string;
  answerLength: string;
  answerPolicy: string;
  readerSummary: string;
  regulations: string[];
  ctaLabel: string;
  maxTokens: number;
};

export const servicePlans: ServicePlan[] = [
  {
    key: "free",
    label: "無料プラン",
    shortLabel: "無料",
    priceLabel: "¥0",
    questionLimit: 3,
    usagePeriod: "day",
    answerDisplay: "要点鑑定",
    answerLength: "500〜800字程度",
    answerPolicy: "出生図と現在の星から、まず見るべき要点を整理します。",
    readerSummary: "通常鑑定のみ",
    regulations: ["登録すると初回10回まで相談できます", "特典後は1日3回まで相談できます", "占い師タイプは通常のみ", "回答は要点中心"],
    ctaLabel: "現在のプラン",
    maxTokens: 2400
  },
  {
    key: "standard",
    label: "通常プラン",
    shortLabel: "通常",
    priceLabel: "初回 ¥480",
    renewalPriceLabel: "2ヶ月目以降 ¥980/月",
    questionLimit: 50,
    usagePeriod: "month",
    answerDisplay: "詳細鑑定",
    answerLength: "900〜1400字程度",
    answerPolicy: "星の根拠、短期・中期・長期、次の行動まで詳しく読みます。",
    readerSummary: "マイルド / はっきり厳しめ",
    regulations: ["初回だけ480円で始められます", "月50回まで相談できます", "マイルド・はっきり厳しめを選べます", "出生プロフィールと鑑定履歴を参照できます"],
    ctaLabel: "初回480円で通常プランへ",
    maxTokens: 3800
  },
  {
    key: "luxury",
    label: "プライベートプラン",
    shortLabel: "プライベート",
    priceLabel: "¥2,980/月",
    questionLimit: 200,
    usagePeriod: "month",
    answerDisplay: "深層鑑定",
    answerLength: "1400〜2000字程度",
    answerPolicy: "矛盾、変化可能性、踏み込んだ判断基準まで濃く読みます。",
    readerSummary: "寄り添い系・辛辣を含む全タイプ / 深層鑑定",
    regulations: ["月200回まで相談できます", "共感を強めた寄り添い系と辛辣鑑定を含む、すべての鑑定士タイプを選べます", "過去の相談文脈をより深く参照します", "回答は濃いめ・長めで、判断基準まで踏み込みます"],
    ctaLabel: "プライベートプランにする",
    maxTokens: 5200
  }
];

export const defaultPlanKey: PlanKey = "free";
export const registeredFreeBonusLimit = 10;
const previousRegisteredFreeBonusLimit = 5;
export const freeBonusRemainingKey = "hoshiyomi:freeBonusRemaining";
const freeBonusLimitVersionKey = "hoshiyomi:freeBonusLimitVersion";
export const addOnCreditsKey = "hoshiyomi:addOnCredits";
export const addOnPack = {
  key: "addon_100" as const,
  label: "追加100回パック",
  shortLabel: "追加100回",
  priceLabel: "¥1,500",
  credits: 100,
  ctaLabel: "100回追加する",
  description: "月の相談回数を使い切った後も、100回単位で続けて相談できます。"
};
export const referralRewardCredits = 30;
export const reviewCombinedRewardCredits = 30;
export const reviewRatingRewardCredits = 10;
export const reviewCommentRewardCredits = reviewCombinedRewardCredits - reviewRatingRewardCredits;
export const legacyReviewRatingRewardCredits = reviewRatingRewardCredits;

export function usageLimitsDisabled() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DISABLE_USAGE_LIMITS === "true";
}

export function isPlanKey(value: string | null | undefined): value is PlanKey {
  return value === "free" || value === "standard" || value === "luxury";
}

export function resolvePlan(value: string | null | undefined) {
  return servicePlans.find((plan) => plan.key === value) ?? servicePlans[0];
}

export function planRank(key: PlanKey) {
  return key === "luxury" ? 2 : key === "standard" ? 1 : 0;
}

export function canUsePlan(requiredPlan: PlanKey, currentPlan: PlanKey) {
  return planRank(currentPlan) >= planRank(requiredPlan);
}

export function canUseReaderStyle(styleKey: ReaderStyleKey, currentPlan: PlanKey) {
  const style = readerStyles.find((item) => item.key === styleKey);
  return style ? canUsePlan(style.requiredPlan, currentPlan) : false;
}

export function requiredPlanForReaderStyle(styleKey: ReaderStyleKey) {
  const style = readerStyles.find((item) => item.key === styleKey);
  return resolvePlan(style?.requiredPlan ?? defaultPlanKey);
}

export function readPlanFromStorage() {
  if (typeof window === "undefined") return defaultPlanKey;
  const saved = window.localStorage.getItem("hoshiyomi:plan") ?? window.sessionStorage.getItem("hoshiyomi:plan");
  if (isPlanKey(saved)) return saved;
  const legacyPremium = window.localStorage.getItem("hoshiyomi:premium") === "true" || window.sessionStorage.getItem("hoshiyomi:premium") === "true";
  return legacyPremium ? "standard" : defaultPlanKey;
}

export function readFreeBonusRemaining() {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(freeBonusRemainingKey) ?? window.sessionStorage.getItem(freeBonusRemainingKey);
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return migrateFreeBonusRemaining(value);
}

export function ensureFreeBonusRemaining() {
  if (typeof window === "undefined") return 0;
  const hasLocal = window.localStorage.getItem(freeBonusRemainingKey) !== null;
  const hasSession = window.sessionStorage.getItem(freeBonusRemainingKey) !== null;
  if (!hasLocal && !hasSession) {
    writeFreeBonusRemaining(registeredFreeBonusLimit);
    return registeredFreeBonusLimit;
  }
  return readFreeBonusRemaining();
}

export function writeFreeBonusRemaining(remaining: number) {
  if (typeof window === "undefined") return;
  const value = String(Math.max(0, Math.min(registeredFreeBonusLimit, remaining)));
  window.localStorage.setItem(freeBonusRemainingKey, value);
  window.sessionStorage.setItem(freeBonusRemainingKey, value);
  window.localStorage.setItem(freeBonusLimitVersionKey, String(registeredFreeBonusLimit));
  window.sessionStorage.setItem(freeBonusLimitVersionKey, String(registeredFreeBonusLimit));
}

function migrateFreeBonusRemaining(remaining: number) {
  const clamped = Math.max(0, Math.min(registeredFreeBonusLimit, remaining));
  const savedVersion = Number(window.localStorage.getItem(freeBonusLimitVersionKey) ?? window.sessionStorage.getItem(freeBonusLimitVersionKey) ?? previousRegisteredFreeBonusLimit);
  if (!Number.isFinite(savedVersion) || savedVersion >= registeredFreeBonusLimit) return clamped;
  const migrated = Math.max(0, Math.min(registeredFreeBonusLimit, clamped + registeredFreeBonusLimit - savedVersion));
  writeFreeBonusRemaining(migrated);
  return migrated;
}

export function shouldUseFreeBonus(planKey: PlanKey, isMember: boolean, freeBonusRemaining: number) {
  return planKey === "free" && isMember && freeBonusRemaining > 0;
}

export function readAddOnCredits() {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(addOnCreditsKey) ?? window.sessionStorage.getItem(addOnCreditsKey);
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function writeAddOnCredits(credits: number) {
  if (typeof window === "undefined") return;
  const value = String(Math.max(0, credits));
  window.localStorage.setItem(addOnCreditsKey, value);
  window.sessionStorage.setItem(addOnCreditsKey, value);
}

export function addAddOnCredits(currentCredits: number, credits = addOnPack.credits) {
  const nextCredits = Math.max(0, currentCredits) + credits;
  writeAddOnCredits(nextCredits);
  return nextCredits;
}

export function planUsageLabel(plan: ServicePlan) {
  return plan.usagePeriod === "day" ? `1日${plan.questionLimit}回` : `月${plan.questionLimit}回`;
}

export function planPeriodLabel(plan: ServicePlan) {
  return plan.usagePeriod === "day" ? "今日" : "今月";
}

export function planRemainingLabel(plan: ServicePlan, used: number) {
  const remaining = Math.max(0, plan.questionLimit - used);
  return `残り${remaining}回 / ${planUsageLabel(plan)}`;
}

export function planStatusLabel(plan: ServicePlan, isMember: boolean) {
  if (plan.key === "free" && !isMember) return `未登録（${plan.questionLimit}回まで）`;
  return plan.label;
}

export function planQuotaRemaining(plan: ServicePlan, used: number, isMember: boolean, freeBonusRemaining: number, addOnCredits = 0) {
  const baseRemaining = Math.max(0, plan.questionLimit - used);
  if (shouldUseFreeBonus(plan.key, isMember, freeBonusRemaining)) return freeBonusRemaining + addOnCredits;
  return baseRemaining + addOnCredits;
}

export function planQuotaLabel(plan: ServicePlan, used: number, isMember: boolean, freeBonusRemaining: number, addOnCredits = 0) {
  const addOnLabel = addOnCredits > 0 ? ` / 追加残り${addOnCredits}回` : "";
  if (plan.key === "free" && !isMember) {
    const remaining = Math.max(0, plan.questionLimit - used);
    return `未登録: 残り${remaining}回 / ${plan.questionLimit}回まで${addOnLabel}`;
  }
  if (shouldUseFreeBonus(plan.key, isMember, freeBonusRemaining)) {
    return `${plan.label}: 登録特典 残り${freeBonusRemaining}回 / 初回${registeredFreeBonusLimit}回${addOnLabel}`;
  }
  return `${plan.label}: ${planPeriodLabel(plan)} ${planRemainingLabel(plan, used)}${addOnLabel}`;
}

export function currentUsagePeriod(planKey: PlanKey, date = new Date()) {
  const plan = resolvePlan(planKey);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    ...(plan.usagePeriod === "day" ? { day: "2-digit" as const } : {})
  }).format(date);
}

export function readPlanUsage(planKey: PlanKey) {
  if (typeof window === "undefined") return 0;
  const period = currentUsagePeriod(planKey);
  const periodKey = `hoshiyomi:usage:${planKey}:period`;
  const usedKey = `hoshiyomi:usage:${planKey}:used`;
  const savedPeriod = window.localStorage.getItem(periodKey);
  if (savedPeriod !== period) {
    window.localStorage.setItem(periodKey, period);
    window.localStorage.setItem(usedKey, "0");
    return 0;
  }
  return Number(window.localStorage.getItem(usedKey) || 0);
}

export function writePlanUsage(planKey: PlanKey, used: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`hoshiyomi:usage:${planKey}:period`, currentUsagePeriod(planKey));
  window.localStorage.setItem(`hoshiyomi:usage:${planKey}:used`, String(used));
}
