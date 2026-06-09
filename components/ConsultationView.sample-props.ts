import type { ConsultationViewProps } from "@/components/ConsultationView";
import { resolvePlan } from "@/lib/plans";
import { readerStyles } from "@/lib/readerStyles";
import { starterQuestions } from "@/lib/questionIntents";

const freePlan = resolvePlan("free");
const standardPlan = resolvePlan("standard");
const readerStyleGroups = [
  {
    key: "basic",
    label: "基本鑑定",
    items: readerStyles.filter((style) => style.requiredPlan === "free")
  },
  {
    key: "standard",
    label: "通常プランで選択可能",
    items: readerStyles.filter((style) => style.requiredPlan === "standard")
  },
  {
    key: "private",
    label: "プライベートプラン専用",
    items: readerStyles.filter((style) => style.requiredPlan === "luxury")
  }
];

const noop = () => {};

export const consultationViewSampleProps: Record<
  "normal" | "empty" | "loading" | "limited" | "error" | "readerExpanded" | "lovePending" | "unlimited" | "noChart",
  ConsultationViewProps
> = {
  normal: buildSampleProps({
    messages: [
      { role: "user", content: "今日の運勢は？" },
      {
        role: "assistant",
        content: "今日の星は、気持ちを急がせるよりも、ひとつだけ整えることに向いています。\n\n続けて掘り下げるなら\n・今日の恋愛運をもう少し詳しく見て",
        readerStyle: "normal"
      }
    ]
  }),
  empty: buildSampleProps({ messages: [] }),
  loading: buildSampleProps({
    loading: true,
    loadingText: "現在の星と、出生図の接点を重ねています",
    streamingAnswer: "まず、今日の流れは"
  }),
  limited: buildSampleProps({ usage: { remaining: 0 } }),
  error: buildSampleProps({ error: "一時的に鑑定文を受け取れませんでした。" }),
  readerExpanded: buildSampleProps({ readerStyleExpanded: true }),
  lovePending: buildSampleProps({ pendingLoveQuestion: true, question: "あの人との距離感をどう見ればいい？" }),
  unlimited: buildSampleProps({ usage: { plan: "standard", planLabel: standardPlan.label, remaining: 999, unlimited: true } }),
  noChart: buildSampleProps({ hasChart: false, messages: [] })
};

type SampleOverrides = Partial<Omit<ConsultationViewProps, "usage">> & {
  usage?: Partial<ConsultationViewProps["usage"]>;
};

function buildSampleProps(overrides: SampleOverrides = {}): ConsultationViewProps {
  const { usage: usageOverride, ...restOverrides } = overrides;
  const usage: ConsultationViewProps["usage"] = {
    addOnCredits: 0,
    freeBonusRemaining: 0,
    isMember: true,
    periodLabel: "今日",
    plan: freePlan.key,
    planLabel: freePlan.label,
    remaining: 2,
    used: 1,
    unlimited: false,
    ...usageOverride
  };

  return {
    activeReaderStyleKey: "normal",
    checkoutNotice: "",
    error: "",
    followUpQuestions: ["短期・中期・長期で詳しく見て", "今日できることを具体的に見て"],
    hasChart: true,
    isReaderStyleLocked: (key) => key !== "normal",
    lineEntry: { connectHref: "/api/auth/line/login", friendUrl: "https://line.me/R/", lineLinked: false },
    loading: false,
    loadingText: "星の配置を確認しています",
    messages: [],
    onChooseRomanticInterest: noop,
    onClearQuestion: noop,
    onFollowUp: noop,
    onOpenPaywall: noop,
    onQuestionChange: noop,
    onSelectReaderStyle: noop,
    onSelectStarter: noop,
    onSend: noop,
    onToggleReaderStyleExpanded: noop,
    pendingLoveQuestion: false,
    pricingHref: "/pricing",
    question: "",
    readerStyleExpanded: false,
    readerStyleGroups,
    readerStyleNotice: "",
    readerStyleUpgradePlan: null,
    requiredPlanLabelFor: (key) => `${resolvePlan(readerStyles.find((style) => style.key === key)?.requiredPlan ?? "free").label}で選択可能`,
    startReadingHref: "/m",
    starterQuestions,
    streamingAnswer: "",
    ...restOverrides,
    usage
  };
}
