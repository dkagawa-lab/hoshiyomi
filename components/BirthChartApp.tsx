"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BirthInput, calculateChart, Chart } from "@/lib/astrology";
import { ChartWheel } from "@/components/ChartWheel";
import { PricingPanel } from "@/components/PricingPanel";
import { ensureClientUserId } from "@/lib/clientIdentity";
import { findPrefecture, japanLocations, Municipality } from "@/lib/japanLocations";
import { municipalityReadings } from "@/lib/municipalityReadings.generated";
import { coerceAnswerText, normalizeAnswerText } from "@/lib/answerText";
import { isReaderStyleKey, ReaderStyleKey, readerStyles } from "@/lib/readerStyles";
import {
  GenderKey,
  genderLabel,
  genderOptions,
  hasRomanticInterest,
  isGenderKey,
  isRomanticInterestKey,
  RomanticInterestKey,
  romanticInterestLabel,
  romanticInterestOptions
} from "@/lib/profileOptions";
import {
  addAddOnCredits,
  addOnPack,
  canUseReaderStyle,
  ensureFreeBonusRemaining,
  isPlanKey,
  planQuotaLabel,
  planQuotaRemaining,
  planStatusLabel,
  PlanKey,
  readAddOnCredits,
  readFreeBonusRemaining,
  readPlanFromStorage,
  readPlanUsage,
  registeredFreeBonusLimit,
  requiredPlanForReaderStyle,
  resolvePlan,
  shouldUseFreeBonus,
  usageLimitsDisabled,
  writeAddOnCredits,
  writeFreeBonusRemaining,
  writePlanUsage
} from "@/lib/plans";
import { QuestionIntentKey, resolveQuestionIntent, starterQuestions } from "@/lib/questionIntents";

type Message = {
  role: "user" | "assistant";
  content: string;
  readerStyle?: ReaderStyleKey;
};

type HistoryEntry = {
  id: string;
  createdAt: string;
  question: string;
  answer: string;
  chartName: string;
  birthDate: string;
  readerStyle?: ReaderStyleKey;
};

type ServerUsage = {
  addOnCredits?: number;
  freeBonusRemaining?: number;
  isMember?: boolean;
  plan?: PlanKey;
  used?: number;
};

type ServerProfile = {
  birthCity?: string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  gender?: GenderKey | null;
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
  romanticInterest?: RomanticInterestKey | null;
};

type ServerSnapshot = {
  history?: HistoryEntry[];
  messages?: Message[];
  mode?: string;
  usage?: ServerUsage;
  user?: ServerProfile | null;
};

type LocationSearchMatch = {
  label: string;
  municipality: Municipality;
  prefecture: string;
  score: number;
};

const loadingStepPool = [
  "出生図の中で、今の相談に反応している星を探しています",
  "太陽・月・水星の出方を照らし合わせています",
  "現在の星と、出生図の接点を重ねています",
  "相談内容に強く響いている天体を絞っています",
  "感情・現実・タイミングを分けて読んでいます",
  "短期・中期・長期の流れを並べています",
  "言い切れることと、まだ揺れることを分けています",
  "星の配置が示す矛盾を見ています",
  "同じ悩みを繰り返しやすい場所を探しています",
  "今の星が押している選択肢を見ています",
  "避けた方がいい読み違いを確認しています",
  "次に聞くと深まりそうな問いを残しています",
  "あなたに返すべき核心を言葉にしています"
];
const streamingLoadingText = "言葉になったところから、少しずつお渡ししています";

const emptyInput: BirthInput = {
  name: "",
  date: "1995-06-15",
  time: "",
  city: "東京都 新宿区",
  latitude: 35.6938,
  longitude: 139.7034
};

const currentYear = new Date().getFullYear();
const birthYearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, index) => 1900 + index);
const birthMonthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const kanaCollator = new Intl.Collator("ja-JP", { usage: "sort", sensitivity: "base", numeric: true });
const loveIntentKeys = new Set<QuestionIntentKey>(["love_values", "new_encounter", "reconciliation", "relationship_distance", "continue_love", "marriage"]);

type PendingLoveQuestion = {
  questionIntent?: QuestionIntentKey;
  text: string;
};

export function BirthChartApp({ compact = false, consultationOnly = false, hideConsultation = false }: { compact?: boolean; consultationOnly?: boolean; hideConsultation?: boolean }) {
  const [input, setInput] = useState<BirthInput>(emptyInput);
  const [chart, setChart] = useState<Chart | null>(null);
  const initialLocation = parseSavedLocation(input.city);
  const [prefecture, setPrefecture] = useState(initialLocation.prefecture);
  const [municipality, setMunicipality] = useState(initialLocation.municipality);
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [selectedQuestionIntent, setSelectedQuestionIntent] = useState<QuestionIntentKey | undefined>();
  const [locationQuery, setLocationQuery] = useState("");
  const [locationChoicePending, setLocationChoicePending] = useState(false);
  const [pendingLoveQuestion, setPendingLoveQuestion] = useState<PendingLoveQuestion | null>(null);
  const [clientUserId, setClientUserId] = useState("");
  const [used, setUsed] = useState(0);
  const [plan, setPlan] = useState<PlanKey>("free");
  const [member, setMember] = useState(false);
  const [freeBonusRemaining, setFreeBonusRemaining] = useState(0);
  const [addOnCredits, setAddOnCredits] = useState(0);
  const [readerStyle, setReaderStyle] = useState<ReaderStyleKey>("normal");
  const [readerStyleNotice, setReaderStyleNotice] = useState("");
  const [readerStyleUpgradePlan, setReaderStyleUpgradePlan] = useState<Exclude<PlanKey, "free"> | null>(null);
  const [readerStyleExpanded, setReaderStyleExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingSequence, setLoadingSequence] = useState<string[]>(() => buildLoadingSequence("", "normal"));
  const [loadingStep, setLoadingStep] = useState(0);
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [birthError, setBirthError] = useState("");
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const currentPlan = resolvePlan(plan);
  const remainingQuota = planQuotaRemaining(currentPlan, used, member, freeBonusRemaining, addOnCredits);
  const quotaDisabled = usageLimitsDisabled();
  const readerStyleLocksDisabled = quotaDisabled;
  const quotaLabel = quotaDisabled ? "開発環境: 相談回数の制限なし" : planQuotaLabel(currentPlan, used, member, freeBonusRemaining, addOnCredits);
  const visibleQuotaLabel = !quotaDisabled && remainingQuota <= 0 ? "聞きたいことを入力して、内容を確認してから相談できます。" : quotaLabel;
  const currentPlanLabel = planStatusLabel(currentPlan, member);
  const birthDateParts = parseBirthDateParts(input.date);
  const birthDayOptions = useMemo(() => buildBirthDayOptions(birthDateParts.year, birthDateParts.month), [birthDateParts.year, birthDateParts.month]);
  const canViewMemory = plan !== "free" || member;
  const mainPlanets = useMemo(() => chart?.planets || [], [chart]);
  const natalProfile = useMemo(() => (chart ? buildNatalProfile(chart) : null), [chart]);
  const selectedLocation = getSelectedLocation(prefecture, municipality);
  const selectedBirthCity = `${selectedLocation.location.prefecture} ${selectedLocation.municipality.name}`;
  const locationSearchMatches = useMemo(() => buildLocationSearchMatches(locationQuery), [locationQuery]);
  const followUpQuestions = useMemo(() => buildFollowUpQuestions(messages), [messages]);
  const selectedReaderStyle = readerStyles.find((style) => style.key === readerStyle) ?? readerStyles[0];
  const activeReaderStyle = readerStyleLocksDisabled || canUseReaderStyle(selectedReaderStyle.key, plan) ? selectedReaderStyle : readerStyles[0];
  const readerStyleGroups = useMemo(
    () => [
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
    ],
    []
  );

  useEffect(() => {
    const savedBirth = readStoredBirth();
    if (savedBirth) {
      try {
        setInput(savedBirth);
        setChart(calculateChart(savedBirth));
        const savedLocation = parseSavedLocation(savedBirth.city);
        setPrefecture(savedLocation.prefecture);
        setMunicipality(savedLocation.municipality);
      } catch {
        setInput(emptyInput);
      }
    }
    setMessages(normalizeStoredMessages(readJson<Message[]>("hoshiyomi:messages", [])));
    setHistory(normalizeStoredHistory(readJson<HistoryEntry[]>("hoshiyomi:history", [])));
    const nextClientUserId = ensureClientUserId();
    setClientUserId(nextClientUserId);
    syncServerState(nextClientUserId);
    const savedPlan = readPlanFromStorage();
    const savedMember = window.localStorage.getItem("hoshiyomi:member") === "true" || window.sessionStorage.getItem("hoshiyomi:member") === "true";
    setPlan(savedPlan);
    setUsed(readPlanUsage(savedPlan));
    setMember(savedMember);
    setFreeBonusRemaining(savedMember ? ensureFreeBonusRemaining() : readFreeBonusRemaining());
    setAddOnCredits(readAddOnCredits());
    const savedStyle = window.localStorage.getItem("hoshiyomi:readerStyle") ?? window.sessionStorage.getItem("hoshiyomi:readerStyle");
    setReaderStyle(isReaderStyleKey(savedStyle) && (readerStyleLocksDisabled || canUseReaderStyle(savedStyle, savedPlan)) ? savedStyle : "normal");
  }, []);

  useEffect(() => {
    if (!messages.length && !loading && !streamingAnswer) return;
    scrollToLatestMessage();
  }, [messages, loading, streamingAnswer]);

  useEffect(() => {
    if (!readerStyleLocksDisabled && !canUseReaderStyle(selectedReaderStyle.key, plan)) {
      setReaderStyle("normal");
    }
  }, [plan, readerStyleLocksDisabled, selectedReaderStyle.key]);

  function scrollToLatestMessage(behavior: ScrollBehavior = "smooth") {
    window.requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior
        });
      }
      messageEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }

  function updateLocationQuery(value: string) {
    setLocationQuery(value);
    const matches = buildLocationSearchMatches(value);
    const match = resolveAutoLocationMatch(matches);
    if (match) {
      setLocationChoicePending(false);
      applyBirthLocation(match.prefecture, match.municipality);
      return;
    }
    setLocationChoicePending(matches.some((item) => item.score <= 4));
  }

  function chooseLocationMatch(match: LocationSearchMatch) {
    setLocationQuery(match.label);
    setLocationChoicePending(false);
    applyBirthLocation(match.prefecture, match.municipality);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function chooseLocationMatchImmediately(match: LocationSearchMatch) {
    return (event: { preventDefault: () => void }) => {
      event.preventDefault();
      chooseLocationMatch(match);
    };
  }

  function applyBirthLocation(nextPrefecture: string, nextMunicipality: Municipality) {
    setPrefecture(nextPrefecture);
    setMunicipality(nextMunicipality.name);
    setInput((current) => ({
      ...current,
      city: `${nextPrefecture} ${nextMunicipality.name}`,
      latitude: nextMunicipality.latitude,
      longitude: nextMunicipality.longitude
    }));
  }

  function updateBirthDate(part: "day" | "month" | "year", value: string) {
    const next = {
      ...birthDateParts,
      [part]: Number(value)
    };
    const maxDay = daysInMonth(next.year, next.month);
    setInput((current) => ({
      ...current,
      date: formatBirthDate(next.year, next.month, Math.min(next.day, maxDay))
    }));
  }

  function updateBirthProfile(profile: Partial<Pick<BirthInput, "gender" | "romanticInterest">>) {
    setInput((current) => {
      const next = { ...current, ...profile };
      if (chart) writeStoredBirth(next);
      return next;
    });
    setChart((current) => (current ? { ...current, input: { ...current.input, ...profile } } : current));
  }

  function chooseRomanticInterest(nextRomanticInterest: RomanticInterestKey) {
    updateBirthProfile({ romanticInterest: nextRomanticInterest });
    if (pendingLoveQuestion) {
      const pending = pendingLoveQuestion;
      setPendingLoveQuestion(null);
      void ask(pending.text, pending.questionIntent, { bypassLovePreference: true, romanticInterest: nextRomanticInterest });
    }
  }

  function updateReaderStyle(nextStyle: ReaderStyleKey) {
    const style = readerStyles.find((item) => item.key === nextStyle) ?? readerStyles[0];
    if (!readerStyleLocksDisabled && !canUseReaderStyle(style.key, plan)) {
      const requiredPlan = requiredPlanForReaderStyle(style.key);
      setReaderStyleNotice(`${style.readerName}は${requiredPlan.label}で選択可能です。いまの${currentPlanLabel}では${activeReaderStyle.label}の鑑定が使えます。`);
      setReaderStyleUpgradePlan(requiredPlan.key === "free" ? null : requiredPlan.key);
      return;
    }
    setReaderStyleNotice("");
    setReaderStyleUpgradePlan(null);
    setReaderStyle(nextStyle);
    writeStorageValue("localStorage", "hoshiyomi:readerStyle", nextStyle);
    writeStorageValue("sessionStorage", "hoshiyomi:readerStyle", nextStyle);
  }

  function submitBirth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBirthError("");
    const normalizedTime = normalizeBirthTime(input.time || "");
    if (input.time && !normalizedTime) {
      setBirthError("出生時刻は 14:30 または 1430 のように入力してください。不明な場合は空欄でOKです。");
      return;
    }
    if (locationChoicePending) {
      setBirthError("出生地の候補が複数あります。該当する市区町村を候補から選択してください。");
      return;
    }
    try {
      const currentSelectedLocation = getSelectedLocation(prefecture, municipality);
      const normalizedInput = {
        ...input,
        city: input.city === "手入力" ? input.city : `${currentSelectedLocation.location.prefecture} ${currentSelectedLocation.municipality.name}`,
        time: normalizedTime,
        latitude: input.city === "手入力" ? Number(input.latitude) : currentSelectedLocation.municipality.latitude,
        longitude: input.city === "手入力" ? Number(input.longitude) : currentSelectedLocation.municipality.longitude
      };
      const next = calculateChart(normalizedInput);
      setChart(next);
      writeStoredBirth(normalizedInput);
      const birthQuery = `?birth=${encodeURIComponent(JSON.stringify(normalizedInput))}`;
      window.location.assign(`/reading${birthQuery}`);
    } catch {
      setBirthError("出生情報の計算でエラーが出ました。生年月日、出生地、緯度経度を確認してください。");
    }
  }

  async function ask(text = question, questionIntent?: QuestionIntentKey, options?: { bypassLovePreference?: boolean; romanticInterest?: RomanticInterestKey }) {
    if (!chart || !text.trim() || loading) return;
    const trimmedQuestion = text.trim();
    const resolvedIntent = resolveQuestionIntent(trimmedQuestion, questionIntent).key;
    if (!quotaDisabled && remainingQuota <= 0) {
      setShowPaywallModal(true);
      return;
    }
    const effectiveRomanticInterest = options?.romanticInterest ?? input.romanticInterest ?? "unspecified";
    if (!options?.bypassLovePreference && loveIntentKeys.has(resolvedIntent) && !hasRomanticInterest(effectiveRomanticInterest)) {
      setPendingLoveQuestion({ questionIntent: resolvedIntent, text: trimmedQuestion });
      setQuestion(trimmedQuestion);
      window.requestAnimationFrame(() => document.querySelector(".love-preference-panel")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    const activeClientUserId = clientUserId || ensureClientUserId();
    if (!clientUserId) setClientUserId(activeClientUserId);
    const requestChart = chartWithProfile(chart, input, { romanticInterest: effectiveRomanticInterest });
    const currentMessages = normalizeStoredMessages(messages);
    const nextMessages: Message[] = [...currentMessages, { role: "user", content: trimmedQuestion }];
    const nextLoadingSequence = buildLoadingSequence(trimmedQuestion, activeReaderStyle.key);
    setMessages(nextMessages);
    setQuestion("");
    setSelectedQuestionIntent(undefined);
    setPendingLoveQuestion(null);
    setLoading(true);
    setLoadingSequence(nextLoadingSequence);
    setLoadingStep(0);
    setStreamingAnswer("");
    scrollToLatestMessage();
    let stepTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      let scheduledLoadingIndex = 0;
      const scheduleNextLoadingStep = () => {
        stepTimer = setTimeout(() => {
          scheduledLoadingIndex += 1;
          if (scheduledLoadingIndex < nextLoadingSequence.length) {
            setLoadingStep(scheduledLoadingIndex);
            scheduleNextLoadingStep();
          }
        }, randomLoadingDelay());
      };
      scheduleNextLoadingStep();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart: requestChart, question: trimmedQuestion, messages: nextMessages, readerStyle: activeReaderStyle.key, plan: currentPlan.key, questionIntent: resolvedIntent, clientUserId: activeClientUserId, isMember: member })
      });
      const data = await res.json().catch(() => ({}));
      if (data.usage) applyServerUsage(data.usage);
      if (res.status === 402) {
        if (stepTimer) clearTimeout(stepTimer);
        setMessages(currentMessages);
        setQuestion(trimmedQuestion);
        setSelectedQuestionIntent(resolvedIntent);
        setShowPaywallModal(true);
        return;
      }
      if (!res.ok || data.error || !data.answer) {
        throw new Error(data.error || "星からの返答を受け取れませんでした。");
      }
      const answer = normalizeAnswerText(data.answer);
      if (!answer) {
        throw new Error("星からの返答を受け取れませんでした。");
      }
      if (stepTimer) clearTimeout(stepTimer);
      await revealAnswer(answer);
      const answeredMessages: Message[] = [...nextMessages, { role: "assistant", content: answer, readerStyle: activeReaderStyle.key }];
      const nextHistory: HistoryEntry[] = [
        {
          id: `${Date.now()}`,
          createdAt: new Date().toISOString(),
          question: trimmedQuestion,
          answer,
          chartName: requestChart.input.name || "あなた",
          birthDate: requestChart.input.date,
          readerStyle: activeReaderStyle.key
        },
        ...history
      ].slice(0, 30);
      setMessages(answeredMessages);
      window.setTimeout(() => scrollToLatestMessage("auto"), 60);
      setHistory(nextHistory);
      window.localStorage.setItem("hoshiyomi:messages", JSON.stringify(answeredMessages));
      window.localStorage.setItem("hoshiyomi:history", JSON.stringify(nextHistory));
      if (!data.usage && !quotaDisabled) consumeLocalQuota();
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "鑑定文の生成で一時的な問題が起きました。相談回数は消費していません。少し時間をおいて、もう一度質問してみてください。";
      const failedMessages: Message[] = [
        ...nextMessages,
        {
          role: "assistant",
          content: errorMessage,
          readerStyle: activeReaderStyle.key
        }
      ];
      setMessages(failedMessages);
      window.setTimeout(() => scrollToLatestMessage("auto"), 60);
      window.localStorage.setItem("hoshiyomi:messages", JSON.stringify(failedMessages));
    } finally {
      if (stepTimer) clearTimeout(stepTimer);
      setLoading(false);
      setStreamingAnswer("");
    }
  }

  function prepareQuestion(text: string, intent?: QuestionIntentKey) {
    setQuestion(text);
    setSelectedQuestionIntent(intent);
    window.requestAnimationFrame(() => document.querySelector(".selected-question-card")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  async function revealAnswer(answer: string) {
    const minimumDelay = 500;
    await new Promise((resolve) => setTimeout(resolve, minimumDelay));
    const chunkSize = 18;
    for (let index = 0; index < answer.length; index += chunkSize) {
      setStreamingAnswer(answer.slice(0, index + chunkSize));
      await new Promise((resolve) => setTimeout(resolve, 28));
    }
  }

  async function checkout(nextPlan: Exclude<PlanKey, "free">) {
    const activeClientUserId = clientUserId || ensureClientUserId();
    if (!clientUserId) setClientUserId(activeClientUserId);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: nextPlan, clientUserId: activeClientUserId })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setPlan(nextPlan);
    setUsed(readPlanUsage(nextPlan));
    setReaderStyleNotice("");
    setReaderStyleUpgradePlan(null);
    window.localStorage.setItem("hoshiyomi:plan", nextPlan);
    window.sessionStorage.setItem("hoshiyomi:plan", nextPlan);
    window.localStorage.setItem("hoshiyomi:premium", "true");
  }

  async function buyAddOnPack() {
    const activeClientUserId = clientUserId || ensureClientUserId();
    if (!clientUserId) setClientUserId(activeClientUserId);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: addOnPack.key, clientUserId: activeClientUserId })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setAddOnCredits((current) => addAddOnCredits(current));
  }

  async function syncServerState(nextClientUserId = clientUserId) {
    if (!nextClientUserId) return;
    try {
      const res = await fetch(`/api/me?clientUserId=${encodeURIComponent(nextClientUserId)}`);
      const data = (await res.json()) as ServerSnapshot;
      if (!res.ok || data.mode !== "server") return;
      if (!data.user && !data.usage) {
        setMember(false);
        window.localStorage.removeItem("hoshiyomi:member");
        window.sessionStorage.removeItem("hoshiyomi:member");
      }
      if (data.usage) applyServerUsage(data.usage);
      if (data.user) applyServerProfile(data.user);
      if (Array.isArray(data.messages)) {
        const normalizedMessages = normalizeStoredMessages(data.messages);
        setMessages(normalizedMessages);
        window.localStorage.setItem("hoshiyomi:messages", JSON.stringify(normalizedMessages));
      }
      if (Array.isArray(data.history)) {
        const normalizedHistory = normalizeStoredHistory(data.history);
        setHistory(normalizedHistory);
        window.localStorage.setItem("hoshiyomi:history", JSON.stringify(normalizedHistory));
      }
    } catch {}
  }

  function applyServerProfile(profile: ServerProfile) {
    if (!profile.birthDate || !profile.birthCity || typeof profile.latitude !== "number" || typeof profile.longitude !== "number") return;
    const savedProfile = readStoredBirth();
    const nextInput: BirthInput = {
      name: profile.name || "",
      date: profile.birthDate,
      time: profile.birthTime || "",
      city: profile.birthCity,
      gender: isGenderKey(profile.gender) ? profile.gender : savedProfile?.gender,
      latitude: profile.latitude,
      longitude: profile.longitude,
      romanticInterest: isRomanticInterestKey(profile.romanticInterest) ? profile.romanticInterest : savedProfile?.romanticInterest
    };
    setInput(nextInput);
    writeStoredBirth(nextInput);
    try {
      setChart(calculateChart(nextInput));
    } catch {}
    const savedLocation = parseSavedLocation(nextInput.city);
    setPrefecture(savedLocation.prefecture);
    setMunicipality(savedLocation.municipality);
  }

  function applyServerUsage(usage: ServerUsage) {
    if (isPlanKey(usage.plan)) {
      setPlan(usage.plan);
      window.localStorage.setItem("hoshiyomi:plan", usage.plan);
      window.sessionStorage.setItem("hoshiyomi:plan", usage.plan);
    }
    if (typeof usage.used === "number" && isPlanKey(usage.plan)) {
      setUsed(usage.used);
      writePlanUsage(usage.plan, usage.used);
    }
    if (typeof usage.freeBonusRemaining === "number") {
      setFreeBonusRemaining(usage.freeBonusRemaining);
      writeFreeBonusRemaining(usage.freeBonusRemaining);
    }
    if (typeof usage.addOnCredits === "number") {
      setAddOnCredits(usage.addOnCredits);
      writeAddOnCredits(usage.addOnCredits);
    }
    if (typeof usage.isMember === "boolean") {
      setMember(usage.isMember);
      if (usage.isMember) {
        window.localStorage.setItem("hoshiyomi:member", "true");
        window.sessionStorage.setItem("hoshiyomi:member", "true");
      } else {
        window.localStorage.removeItem("hoshiyomi:member");
        window.sessionStorage.removeItem("hoshiyomi:member");
      }
    }
  }

  function consumeLocalQuota() {
    const baseRemaining = Math.max(0, currentPlan.questionLimit - used);
    if (shouldUseFreeBonus(currentPlan.key, member, freeBonusRemaining)) {
      const nextBonusRemaining = Math.max(0, freeBonusRemaining - 1);
      setFreeBonusRemaining(nextBonusRemaining);
      writeFreeBonusRemaining(nextBonusRemaining);
      if (nextBonusRemaining === 0) {
        setUsed(currentPlan.questionLimit);
        writePlanUsage(currentPlan.key, currentPlan.questionLimit);
      }
    } else if (baseRemaining > 0) {
      const nextUsed = used + 1;
      setUsed(nextUsed);
      writePlanUsage(currentPlan.key, nextUsed);
    } else {
      const nextAddOnCredits = Math.max(0, addOnCredits - 1);
      setAddOnCredits(nextAddOnCredits);
      writeAddOnCredits(nextAddOnCredits);
    }
  }

  const containerClass = compact ? "panel form-panel" : consultationOnly ? "consultation-grid" : "app-grid";

  return (
    <div className={containerClass}>
      {!consultationOnly ? (
      <form className={compact ? "" : "panel form-panel"} onSubmit={submitBirth}>
        <div className="form-intro">
          <div className="eyebrow">Birth Data</div>
          <h2>まずは、あなたの星を知るところから</h2>
          <p className="small">
            ホロスコープは、生まれた日と場所から「その瞬間の星の配置」を描くところから始まります。ここで入力した情報をもとに、あなたの本質や相談の土台になる星を読み取ります。
          </p>
          <p className="small">出生時刻がわからない場合は空欄でもOKです。その場合はASCとハウスを省略して診断します。</p>
        </div>
        <div className="grid">
          <div className="field full">
            <label>名前</label>
            <input value={input.name} onChange={(e) => setInput({ ...input, name: e.target.value })} placeholder="任意で入力" />
          </div>
          <div className="field">
            <label>あなたの性別（任意）</label>
            <select
              value={input.gender ?? "unspecified"}
              onChange={(e) => {
                const nextGender = isGenderKey(e.target.value) ? e.target.value : "unspecified";
                setInput({ ...input, gender: nextGender });
              }}
            >
              {genderOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>生年月日</label>
            <div className="birth-date-selects">
              <select aria-label="出生年" value={birthDateParts.year} onChange={(e) => updateBirthDate("year", e.target.value)}>
                {birthYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
              <select aria-label="出生月" value={birthDateParts.month} onChange={(e) => updateBirthDate("month", e.target.value)}>
                {birthMonthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
              <select aria-label="出生日" value={birthDateParts.day} onChange={(e) => updateBirthDate("day", e.target.value)}>
                {birthDayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}日
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>出生時刻</label>
            <input
              type="text"
              inputMode="numeric"
              value={input.time || ""}
              onChange={(e) => setInput({ ...input, time: e.target.value })}
              placeholder="例: 14:30 / 1430"
              aria-describedby="birth-time-help"
            />
            <span className="field-hint" id="birth-time-help">
              わからない場合は空欄のままでOKです
            </span>
          </div>
          <div className="location-picker full">
            <div className="field location-search-field">
              <label htmlFor="birth-location-search">出生地を検索</label>
              <input
                autoComplete="off"
                autoCorrect="off"
                id="birth-location-search"
                onChange={(event) => updateLocationQuery(event.currentTarget.value)}
                placeholder="例: 町田市 / 静岡市 / 札幌市中央区"
                spellCheck={false}
                type="search"
                value={locationQuery}
              />
              <span className="field-hint">
                候補が複数ある場合は、該当する出生地を選んでください。
              </span>
              <div className="location-search-status" aria-live="polite">
                <span>現在反映されている出生地</span>
                <strong>{locationChoicePending ? "候補から選択してください" : selectedBirthCity}</strong>
                {locationQuery.trim() ? (
                  <small>
                    {locationSearchMatches.some((match) => match.score <= 4)
                      ? locationChoicePending
                        ? "同名の市区町村があります。下の候補から選択すると反映されます。"
                        : "候補から該当する出生地を選択できます。"
                      : locationSearchMatches.length
                        ? "都道府県名だけでは反映しません。市区町村名まで入力してください。"
                        : "一致する市区町村がありません。漢字の市区町村名で入力してください。"}
                  </small>
                ) : (
                  <small>市区町村名を入力すると、出生地がここに反映されます。</small>
                )}
              </div>
              {locationSearchMatches.some((match) => match.score <= 4) ? (
                <div className="location-candidate-list" role="listbox" aria-label="出生地候補">
                  {locationSearchMatches
                    .filter((match) => match.score <= 4)
                    .slice(0, 8)
                    .map((match) => {
                      const isSelected = !locationChoicePending && match.prefecture === selectedLocation.location.prefecture && match.municipality.name === selectedLocation.municipality.name;
                      return (
                        <button
                          aria-pressed={isSelected}
                          className={`location-candidate ${isSelected ? "active" : ""}`}
                          key={`${match.prefecture}-${match.municipality.name}-${match.municipality.latitude}-${match.municipality.longitude}`}
                          onClick={() => chooseLocationMatch(match)}
                          onPointerDown={chooseLocationMatchImmediately(match)}
                          onTouchStart={chooseLocationMatchImmediately(match)}
                          type="button"
                        >
                          <span>{match.prefecture}</span>
                          <strong>{match.municipality.name}</strong>
                        </button>
                      );
                    })}
                </div>
              ) : null}
            </div>
          </div>
          <div className="birth-place-preview full">
            <span>選択中の出生地</span>
            <strong>{input.city === "手入力" ? "手入力" : selectedBirthCity}</strong>
            <small>
              緯度 {Number(input.city === "手入力" ? input.latitude : selectedLocation.municipality.latitude).toFixed(4)} / 経度{" "}
              {Number(input.city === "手入力" ? input.longitude : selectedLocation.municipality.longitude).toFixed(4)}
            </small>
          </div>
          <div className="field">
            <label>緯度</label>
            <input type="number" step="0.0001" value={input.latitude} onChange={(e) => setInput({ ...input, latitude: Number(e.target.value), city: "手入力" })} />
          </div>
          <div className="field">
            <label>経度</label>
            <input type="number" step="0.0001" value={input.longitude} onChange={(e) => setInput({ ...input, longitude: Number(e.target.value), city: "手入力" })} />
          </div>
        </div>
        <div className="actions">
          <button className="button primary" type="submit">
            ホロスコープを作成
          </button>
        </div>
        {birthError ? <p className="form-error">{birthError}</p> : null}
      </form>
      ) : null}

      {!compact && chart ? (
        <div className="stack">
          {!consultationOnly ? (
          <section className="chart-area">
            <div className="panel chart-card">
              <ChartWheel chart={chart} />
            </div>
            <div className="panel reading-card">
              <div className="eyebrow">Natal Reading</div>
              <h2>{chart.input.name || "あなた"}の星読み</h2>
              <div className="birth-summary compact">
                <div>
                  <span>出生地</span>
                  <strong>{chart.input.city}</strong>
                </div>
                <div>
                  <span>出生日時</span>
                  <strong>
                    {chart.input.date} {chart.input.time || "時刻不明"}
                  </strong>
                </div>
              </div>
              {natalProfile ? (
                <div className="natal-profile">
                  <p className="natal-summary">{natalProfile.summary}</p>
                  <Link className="text-link" href="/glossary">
                    ASC・ハウス・アスペクトなどを完全ガイド・用語集で見る
                  </Link>
                  <div className="natal-insight-grid">
                    {natalProfile.blocks.map((block) => (
                      <article className="natal-insight" key={block.title}>
                        <span>{block.label}</span>
                        <h3>{block.title}</h3>
                        <p>{block.text}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="list">
                {mainPlanets.map((planet) => (
                  <div className="row" key={planet.key}>
                    <strong>{planet.name}</strong>
                    <span>
                      {planet.sign.name} {planet.degree.toFixed(1)}度{planet.house ? ` / ${planet.house}H` : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pill-row">
                {chart.aspects.slice(0, 5).map((aspect) => (
                  <span className="pill" key={`${aspect.from}-${aspect.to}`}>
                    {aspect.from} × {aspect.to} {aspect.type}
                  </span>
                ))}
              </div>
            </div>
          </section>
          ) : null}

          {hideConsultation && !consultationOnly ? (
            <section className="panel consultation-cta-card">
              <div className="eyebrow">Continue Reading</div>
              <h2>ここから先は、星の文脈を記憶し、あなた専用の占い師として未来を占います</h2>
              <p>
                今はあなたの星の配置を理解した段階です。恋愛、仕事、相性、将来の迷いなど、具体的な悩みを重ねるほど、鑑定はあなた自身の文脈に近づいていきます。
              </p>
              <div className="actions compact-actions">
                <Link className="button primary" href="/consultation">
                  この星で相談する
                </Link>
              </div>
            </section>
          ) : null}

          {!hideConsultation || consultationOnly ? (
          <section className="panel chat-card">
            <div className="eyebrow">Private Reading</div>
            <h2>ここから先は、星の文脈を記憶し、あなた専用の占い師として未来を占います</h2>
            <p className="small">
              あなたの出生図とこれまでの鑑定をもとに、恋愛、仕事、相性、将来の迷いまで、同じ星の文脈を引き継いで見ていきます。
            </p>
            <div className="plan-entry-card">
              <div>
                <span>Current Plan</span>
                <strong>{currentPlanLabel}</strong>
                <p>{quotaLabel}</p>
              </div>
              <Link className="button" href="/pricing">
                プランを見る
              </Link>
            </div>
            <div className="consultation-profile-card">
              <div className="consultation-profile-heading">
                <span>プロフィール</span>
                <p>恋愛相談では、相手や恋愛対象の性別を決めつけずに読むために使います。</p>
              </div>
              <div className="profile-select-grid">
                <label>
                  <span>あなたの性別（任意）</span>
                  <select
                    value={input.gender ?? "unspecified"}
                    onChange={(e) => {
                      const nextGender = isGenderKey(e.target.value) ? e.target.value : "unspecified";
                      updateBirthProfile({ gender: nextGender });
                    }}
                  >
                    {genderOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>恋愛対象</span>
                  <select
                    value={input.romanticInterest ?? "unspecified"}
                    onChange={(e) => {
                      const nextRomanticInterest = isRomanticInterestKey(e.target.value) ? e.target.value : "unspecified";
                      updateBirthProfile({ romanticInterest: nextRomanticInterest });
                    }}
                  >
                    {romanticInterestOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="reader-style-panel">
              <div className="reader-style-panel-header">
                <div className="reader-style-panel-title">
                  <span>占い師タイプ</span>
                  <strong>{activeReaderStyle.label} / {activeReaderStyle.readerName}</strong>
                </div>
                <button
                  aria-controls="reader-style-options"
                  aria-expanded={readerStyleExpanded}
                  className="reader-style-toggle"
                  onClick={() => setReaderStyleExpanded((expanded) => !expanded)}
                  type="button"
                >
                  {readerStyleExpanded ? "折り畳む" : "選択肢を開く"}
                </button>
              </div>
              {readerStyleExpanded ? (
                <div className="reader-style-groups" id="reader-style-options">
                  {readerStyleGroups.map((group) => (
                    <div className={`reader-style-group ${group.key}`} key={group.key}>
                      <span className="reader-style-group-label">{group.label}</span>
                      <div className="reader-style-grid">
                        {group.items.map((style) => (
                          <button
                            aria-pressed={activeReaderStyle.key === style.key}
                            className={`reader-style-button reader-style-${style.requiredPlan} ${activeReaderStyle.key === style.key ? "active" : ""} ${
                              !readerStyleLocksDisabled && !canUseReaderStyle(style.key, plan) ? "locked" : ""
                            } ${readerStyleLocksDisabled && style.requiredPlan !== "free" ? "dev-unlocked" : ""}`}
                            key={style.key}
                            onClick={() => updateReaderStyle(style.key)}
                            type="button"
                          >
                            <img src={style.imageSrc} alt="" />
                            <span className="reader-style-copy">
                              <strong>{style.label}</strong>
                              <em>{style.readerName}</em>
                              <small>{style.persona}</small>
                            </span>
                            <b>{readerStyleLocksDisabled && style.requiredPlan !== "free" ? "開発環境で選択可" : `${requiredPlanForReaderStyle(style.key).label}で選択可能`}</b>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="reader-style-current">
                  <img src={activeReaderStyle.imageSrc} alt="" />
                  <div>
                    <span>現在の占い師タイプ</span>
                    <strong>{activeReaderStyle.label} / {activeReaderStyle.readerName}</strong>
                    <p>{activeReaderStyle.persona}</p>
                  </div>
                </div>
              )}
              {readerStyleNotice ? (
                <div className="reader-style-unlock">
                  <p>{readerStyleNotice}</p>
                  {readerStyleUpgradePlan ? (
                    <button className="button primary" onClick={() => setShowPaywallModal(true)} type="button">
                      プランを見る
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <p className="small plan-limit-line">
              {visibleQuotaLabel}
            </p>
            <div className="question-guide">
              <span>相談テーマを選ぶ</span>
              <p>下の候補から選んでも、そのまま自由に書いても大丈夫です。恋愛、仕事、相性、将来の迷い、不安、願いまで、いま知りたいことを占いましょう。</p>
            </div>
            {pendingLoveQuestion ? (
              <div className="love-preference-panel">
                <span>恋愛相談の前に確認します</span>
                <strong>あなたが恋愛対象として見ることが多いのはどちらですか？</strong>
                <p>ここを選ぶと、その前提で鑑定を続けます。まだ決めきれない場合や、恋愛対象がない場合も選べます。</p>
                <div className="love-preference-options">
                  {romanticInterestOptions
                    .filter((option) => option.key !== "unspecified")
                    .map((option) => (
                      <button className="love-preference-option" key={option.key} onClick={() => chooseRomanticInterest(option.key)} type="button">
                        <strong>{option.label}</strong>
                        <span>{option.description}</span>
                      </button>
                    ))}
                </div>
              </div>
            ) : null}
            <div className="pill-row">
              {starterQuestions.map((sample) => (
                <button className={`pill ${question === sample.text ? "active" : ""}`} key={sample.text} onClick={() => prepareQuestion(sample.text, sample.intent)} type="button">
                  {sample.text}
                </button>
              ))}
            </div>
            <div className="messages" ref={messagesRef}>
              {!messages.length && !loading ? (
                <div className="message assistant hint-message">
                  候補から選ぶか、下の入力欄にそのまま相談を書いてください。送信すると、ここに最新の鑑定が表示されます。
                </div>
              ) : null}
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} onFollowUp={(followUp) => prepareQuestion(followUp)} />
              ))}
              {loading ? (
                <div className="message assistant reader-answer thinking-message">
                  <ReaderAnswerHeader readerStyle={activeReaderStyle.key} />
                  <span>{streamingAnswer ? streamingLoadingText : loadingSequence[loadingStep] ?? loadingSequence[loadingSequence.length - 1] ?? loadingStepPool[0]}</span>
                  <i />
                  {streamingAnswer ? <p className="reader-answer-body">{streamingAnswer}</p> : null}
                </div>
              ) : null}
              <div aria-hidden="true" className="message-end" ref={messageEndRef} />
            </div>
            {!loading && followUpQuestions.length ? (
              <div className="follow-up-panel">
                <span>この続きを深掘りする</span>
                <div className="pill-row">
                  {followUpQuestions.map((followUp) => (
                    <button className={`pill ${question === followUp ? "active" : ""}`} key={followUp} onClick={() => prepareQuestion(followUp)} type="button">
                      {followUp}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <form
              className="chat-form"
              onSubmit={(event) => {
                event.preventDefault();
                ask(question, selectedQuestionIntent);
              }}
            >
              <div className="chat-form-heading">
                <span>{question ? "この質問について相談しますか？" : "自由に相談を書く"}</span>
                <small>{question ? "内容を確認してから開始できます" : "候補にない悩みも、そのまま送れます"}</small>
              </div>
              {question ? (
                <div className="selected-question-card">
                  <span>選択中の相談</span>
                  <p>{question}</p>
                  <button className="text-button" onClick={() => { setQuestion(""); setSelectedQuestionIntent(undefined); }} type="button">
                    内容を変更する
                  </button>
                </div>
              ) : null}
              <textarea
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setSelectedQuestionIntent(undefined);
                }}
                placeholder="候補にないことでも大丈夫です。例: あの人との今後は？今の仕事を続けるべき？今年動くなら何を意識すればいい？"
              />
              <button className="button primary" type="submit" disabled={loading}>
                {question ? "この内容で相談する" : "相談する"}
              </button>
            </form>
          </section>
          ) : null}

          {!hideConsultation || consultationOnly ? (
          <section className="panel memory-card">
            <div className="eyebrow">Member Memory</div>
            <h2>あなたの星と鑑定履歴</h2>
            {canViewMemory ? (
              <>
                <div className="memory-profile">
                  <div>
                    <span>Profile</span>
                    <strong>{chart.input.name || "名前未設定"}</strong>
                    <p>
                      {chart.input.date} {chart.input.time || "出生時刻不明"} / {chart.input.city}
                    </p>
                    <p>
                      性別: {genderLabel(input.gender ?? chart.input.gender)} / 恋愛対象: {romanticInterestLabel(input.romanticInterest ?? chart.input.romanticInterest)}
                    </p>
                  </div>
                  <div>
                    <span>Main Chart</span>
                    <strong>
                      太陽 {chart.planets[0].sign.name} / 月 {chart.planets[1].sign.name}
                    </strong>
                    <p>{chart.ascendant ? `ASC ${chart.ascendant.sign.name}` : "ASCは出生時刻入力後に表示されます"}</p>
                  </div>
                </div>
                <div className="history-list">
                  {history.length ? (
                    history.map((entry) => {
                      const expanded = expandedHistoryId === entry.id;
                      const answerText = normalizeAssistantDisplayContent(entry.answer);
                      return (
                        <article className="history-entry" key={entry.id}>
                          <span>
                            {new Date(entry.createdAt).toLocaleString("ja-JP")}
                            {entry.readerStyle ? ` / ${resolveMessageReaderStyle(entry.readerStyle).readerName}` : ""}
                          </span>
                          <strong>{entry.question}</strong>
                          <p className={expanded ? "history-full-answer" : ""}>{expanded ? answerText : `${answerText.slice(0, 180)}${answerText.length > 180 ? "..." : ""}`}</p>
                          <div className="history-actions">
                            <button className="text-button" type="button" onClick={() => setExpandedHistoryId(expanded ? null : entry.id)}>
                              {expanded ? "全文を閉じる" : "全文を表示"}
                            </button>
                            <button
                              className="text-button"
                              type="button"
                              onClick={() => {
                                setMessages([
                                  { role: "user", content: normalizeAssistantDisplayContent(entry.question) },
                                  { role: "assistant", content: normalizeAssistantDisplayContent(entry.answer), readerStyle: entry.readerStyle }
                                ]);
                                window.setTimeout(() => scrollToLatestMessage("auto"), 60);
                              }}
                            >
                              この鑑定を会話に戻す
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="small">まだ保存された鑑定履歴はありません。相談するとここに記録されます。</p>
                  )}
                </div>
              </>
            ) : (
              <div className="memory-gate">
                <p>
                  会員登録すると、あなたの出生プロフィール、過去に占った相談内容、鑑定履歴を参照できます。毎回ゼロから説明しなくても、あなたの星の文脈を引き継いで相談できます。
                </p>
                <div className="actions">
                  <Link className="button primary" href="/register?returnTo=/consultation">
                    この星を記録して履歴を残す
                  </Link>
                  <Link className="button" href="/login?returnTo=/consultation">
                    登録済みの方はログイン
                  </Link>
                </div>
              </div>
            )}
          </section>
          ) : null}
        </div>
      ) : compact ? null : consultationOnly ? (
        <div className="panel reading-card">
          <h2 className="consultation-empty-title">
            <span>先にホロスコープを</span>
            <span>作成してください</span>
          </h2>
          <p>相談を始めるには、生年月日と出生地からあなたの星を読み取る必要があります。</p>
          <div className="actions">
            <Link className="button primary" href="/m">
              出生情報を入力する
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel reading-card">
          <h2>まず出生情報を入力してください</h2>
          <p>チャート作成後、星読みと相談欄が表示されます。</p>
        </div>
      )}
      {showPaywallModal ? (
        <PaywallModal
          addOnCredits={addOnCredits}
          currentPlanKey={plan}
          freeBonusRemaining={freeBonusRemaining}
          isMember={member}
          onBuyAddOn={async () => {
            await buyAddOnPack();
            setShowPaywallModal(false);
          }}
          onCheckout={async (nextPlan) => {
            await checkout(nextPlan);
            setShowPaywallModal(false);
          }}
          onClose={() => setShowPaywallModal(false)}
        />
      ) : null}
    </div>
  );
}

function MessageBubble({ message, onFollowUp }: { message: Message; onFollowUp?: (question: string) => void }) {
  if (message.role === "user") {
    return <div className="message user">{coerceAnswerText(message.content)}</div>;
  }
  const { body, followUps } = extractAssistantFollowUps(normalizeAssistantDisplayContent(message.content));

  return (
    <div className="message assistant reader-answer">
      {message.readerStyle ? <ReaderAnswerHeader readerStyle={message.readerStyle} /> : null}
      <div className="reader-answer-body">{body}</div>
      {followUps.length ? (
        <div className="answer-follow-up-actions">
          <span>続けて掘り下げるなら</span>
          <div className="answer-follow-up-list">
            {followUps.map((followUp) => (
              <button className="answer-follow-up-button" key={followUp} onClick={() => onFollowUp?.(followUp)} type="button">
                {followUp}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeAssistantDisplayContent(value: unknown) {
  return normalizeAnswerText(value);
}

function extractAssistantFollowUps(content: string) {
  const lines = content.split("\n");
  const markerIndex = findFollowUpMarkerIndex(lines);
  if (markerIndex < 0) return { body: content, followUps: [] };

  const followUps = lines
    .slice(markerIndex + 1)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("・"))
    .map((line) => cleanFollowUpQuestion(line.replace(/^・+/, "")))
    .filter((line) => line.length >= 4)
    .slice(0, 4);

  if (!followUps.length) return { body: content, followUps: [] };

  const bodyLines = lines.slice(0, markerIndex);
  while (bodyLines.length && isFollowUpHeading(bodyLines[bodyLines.length - 1])) {
    bodyLines.pop();
  }

  return {
    body: bodyLines.join("\n").trim(),
    followUps: uniqueTexts(followUps)
  };
}

function findFollowUpMarkerIndex(lines: string[]) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index].trim();
    if (line.includes("続けて掘り下げるなら") || line.includes("次に聞くなら") || line.includes("次に聞くと深")) {
      return index;
    }
  }
  return -1;
}

function isFollowUpHeading(value: string) {
  const normalized = value.replace(/[【】]/g, "").trim();
  return normalized.includes("続けて掘り下げるなら") || normalized.includes("次に聞くなら") || normalized.includes("次に聞くと深");
}

function cleanFollowUpQuestion(value: string) {
  return value.replace(/^[「『]/, "").replace(/[」』。.\s]+$/g, "").trim();
}

function ReaderAnswerHeader({ readerStyle }: { readerStyle: ReaderStyleKey }) {
  const style = resolveMessageReaderStyle(readerStyle);
  const title = style.key === "normal" ? "標準鑑定で読みました" : `${style.readerName}が読みました`;

  return (
    <div className={`reader-answer-header reader-answer-${style.requiredPlan}`}>
      <img src={style.imageSrc} alt="" />
      <div>
        <span>{style.label}タイプの鑑定</span>
        <strong>{title}</strong>
        <p>{style.description}</p>
      </div>
    </div>
  );
}

function resolveMessageReaderStyle(value: ReaderStyleKey | undefined) {
  if (!isReaderStyleKey(value)) return readerStyles[0];
  return readerStyles.find((style) => style.key === value) ?? readerStyles[0];
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeStoredMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const message = item as { content?: unknown; readerStyle?: unknown; role?: unknown };
      if (message.role !== "user" && message.role !== "assistant") return null;
      const content = normalizeAnswerText(message.content);
      if (!content || content === "[object Object]") return null;
      const readerStyle = typeof message.readerStyle === "string" && isReaderStyleKey(message.readerStyle) ? message.readerStyle : undefined;
      const normalized: Message = {
        role: message.role,
        content
      };
      if (readerStyle) normalized.readerStyle = readerStyle;
      return normalized;
    })
    .filter((message): message is Message => message !== null);
}

function normalizeStoredHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const entry = item as Record<string, unknown>;
      const question = normalizeAnswerText(entry.question);
      const answer = normalizeAnswerText(entry.answer);
      if (!question || !answer || answer === "[object Object]") return null;
      const readerStyle = typeof entry.readerStyle === "string" && isReaderStyleKey(entry.readerStyle) ? entry.readerStyle : undefined;
      const normalized: HistoryEntry = {
        id: typeof entry.id === "string" ? entry.id : `history-${index}`,
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
        question,
        answer,
        chartName: typeof entry.chartName === "string" ? entry.chartName : "あなた",
        birthDate: typeof entry.birthDate === "string" ? entry.birthDate : ""
      };
      if (readerStyle) normalized.readerStyle = readerStyle;
      return normalized;
    })
    .filter((entry): entry is HistoryEntry => entry !== null);
}

function readStoredBirth() {
  return readStorageJson<BirthInput>("localStorage", "hoshiyomi:birth") ?? readStorageJson<BirthInput>("sessionStorage", "hoshiyomi:birth");
}

function writeStoredBirth(input: BirthInput) {
  const value = JSON.stringify(input);
  const savedLocal = writeStorageValue("localStorage", "hoshiyomi:birth", value);
  const savedSession = writeStorageValue("sessionStorage", "hoshiyomi:birth", value);
  return savedLocal || savedSession;
}

function chartWithProfile(chart: Chart, input: BirthInput, overrides: Partial<Pick<BirthInput, "gender" | "romanticInterest">> = {}) {
  return {
    ...chart,
    input: {
      ...chart.input,
      gender: input.gender ?? chart.input.gender,
      romanticInterest: input.romanticInterest ?? chart.input.romanticInterest,
      ...overrides
    }
  };
}

function readStorageJson<T>(storageName: "localStorage" | "sessionStorage", key: string): T | null {
  try {
    const storage = window[storageName];
    const value = storage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeStorageValue(storageName: "localStorage" | "sessionStorage", key: string, value: string) {
  try {
    window[storageName].setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function getSelectedLocation(prefecture: string, municipality: string) {
  const location = findPrefecture(prefecture);
  const sortedMunicipalities = sortMunicipalitiesByReading(location.prefecture, location.municipalities);
  return {
    location,
    municipality: sortedMunicipalities.find((item) => item.name === municipality) ?? sortedMunicipalities[0]
  };
}

function buildLocationSearchMatches(query: string): LocationSearchMatch[] {
  const normalizedQuery = normalizeLocationSearchText(query);
  if (!normalizedQuery) return [];
  const matches = japanLocations.flatMap((location) =>
    location.municipalities
      .map((municipality) => {
        const label = `${location.prefecture} ${municipality.name}`;
        const searchable = normalizeLocationSearchText(`${label} ${municipalityReading(location.prefecture, municipality)}`);
        const municipalityText = normalizeLocationSearchText(municipality.name);
        const prefectureText = normalizeLocationSearchText(location.prefecture);
        let score = 99;
        if (municipalityText === normalizedQuery || searchable === normalizedQuery) score = 0;
        else if (municipalityText.startsWith(normalizedQuery)) score = 1;
        else if (searchable.startsWith(normalizedQuery)) score = 2;
        else if (municipalityText.includes(normalizedQuery)) score = 3;
        else if (searchable.includes(normalizedQuery)) score = 4;
        else if (prefectureText.includes(normalizedQuery)) score = 5;
        return score < 99 ? { label, municipality, prefecture: location.prefecture, score } : null;
      })
      .filter((match): match is LocationSearchMatch => Boolean(match))
  );
  return matches
    .sort((a, b) => a.score - b.score || kanaCollator.compare(municipalityReading(a.prefecture, a.municipality), municipalityReading(b.prefecture, b.municipality)))
    .slice(0, 12);
}

function resolveAutoLocationMatch(matches: LocationSearchMatch[]) {
  const candidates = matches.filter((match) => match.score <= 4);
  if (candidates.length === 1) return candidates[0];
  const bestScore = candidates[0]?.score;
  if (bestScore === undefined) return null;
  const bestMatches = candidates.filter((match) => match.score === bestScore);
  return bestMatches.length === 1 && bestScore <= 2 ? bestMatches[0] : null;
}

function normalizeLocationSearchText(value: string) {
  return value.replace(/\s+/g, "").replace(/[　]/g, "").trim().toLowerCase();
}

function sortMunicipalitiesByReading(prefecture: string, municipalities: Municipality[]) {
  return [...municipalities].sort((a, b) => {
    const byReading = kanaCollator.compare(municipalityReading(prefecture, a), municipalityReading(prefecture, b));
    if (byReading !== 0) return byReading;
    return kanaCollator.compare(a.name, b.name);
  });
}

function municipalityReading(prefecture: string, municipality: Municipality) {
  return municipalityReadings[`${prefecture}|${municipality.name}`] ?? municipality.name;
}

function parseBirthDateParts(date: string) {
  const [rawYear, rawMonth, rawDay] = date.split("-").map(Number);
  const year = Number.isFinite(rawYear) ? clamp(rawYear, 1900, currentYear) : 1995;
  const month = Number.isFinite(rawMonth) ? clamp(rawMonth, 1, 12) : 6;
  const day = Number.isFinite(rawDay) ? clamp(rawDay, 1, daysInMonth(year, month)) : 15;
  return { day, month, year };
}

function buildBirthDayOptions(year: number, month: number) {
  return Array.from({ length: daysInMonth(year, month) }, (_, index) => index + 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function formatBirthDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeBirthTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const compact = trimmed.replace(/[：.]/g, ":");
  const digitOnly = compact.replace(/\D/g, "");
  if (/^\d{3,4}$/.test(digitOnly)) {
    const hourDigits = digitOnly.length === 3 ? digitOnly.slice(0, 1) : digitOnly.slice(0, 2);
    const minuteDigits = digitOnly.slice(-2);
    const hour = Number(hourDigits);
    const minute = Number(minuteDigits);
    if (hour > 23 || minute > 59) return "";
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  const match = compact.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return "";
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function buildNatalProfile(chart: Chart) {
  const sun = chart.planets.find((planet) => planet.key === "sun")!;
  const moon = chart.planets.find((planet) => planet.key === "moon")!;
  const mercury = chart.planets.find((planet) => planet.key === "mercury")!;
  const venus = chart.planets.find((planet) => planet.key === "venus")!;
  const mars = chart.planets.find((planet) => planet.key === "mars")!;
  const jupiter = chart.planets.find((planet) => planet.key === "jupiter")!;
  const saturn = chart.planets.find((planet) => planet.key === "saturn")!;
  const uranus = chart.planets.find((planet) => planet.key === "uranus")!;
  const neptune = chart.planets.find((planet) => planet.key === "neptune")!;
  const pluto = chart.planets.find((planet) => planet.key === "pluto")!;
  const strongestAspect = chart.aspects[0];
  const ascText = chart.ascendant
    ? `外からは${chart.ascendant.sign.name}のように見られやすく、物事を始める時もその星座の質が入口になります。`
    : "出生時刻が空欄なのでASCとハウスは省略していますが、太陽・月・主要天体から性質の核は読めます。";

  return {
    summary: `この星の並びでは、表に出す意志は太陽${sun.sign.name}、心の奥で安心する条件は月${moon.sign.name}にあります。つまり、人生を進める時の自分と、素に戻った時の自分が少し違う質を持っています。${ascText} このチャートは「何を目指すか」だけでなく、「どう感じ、どう考え、どう愛し、どこで踏ん張る人か」を重ねて読むことで輪郭がはっきりします。`,
    blocks: [
      {
        label: "Core",
        title: "表の自分と素の自分",
        text: `太陽${sun.sign.name}は、人生の方向性や人前で発揮したい力を示します。${elementTone(sun.sign.element)}一方で月${moon.sign.name}は、疲れた時に戻りたい場所や安心の条件です。${elementTone(moon.sign.element)}この組み合わせは、外では前に進もうとしながら、内側では別のリズムで心を整えようとする人に出やすい配置です。`
      },
      {
        label: "Mind / Love / Drive",
        title: "考え方、愛し方、動き方",
        text: `水星${mercury.sign.name}は考え方と言葉の癖、金星${venus.sign.name}は好きになるポイントや心地よさ、火星${mars.sign.name}は欲しいものへ向かう時の動き方です。あなたは頭で整理する時、愛情を受け取る時、行動に移す時で使う星座の質が違います。だから、気持ちはあるのに言葉が追いつかない、好きなのに動き方が不器用になる、というズレも起こりやすくなります。`
      },
      {
        label: "Growth",
        title: "広がる力と、時間をかけて育つ力",
        text: `木星${jupiter.sign.name}は可能性が広がる方向、土星${saturn.sign.name}は苦手意識や責任として育てるテーマです。木星の領域では自然にチャンスを見つけやすく、土星の領域では最初は重さを感じやすいでしょう。ただし土星は、逃げずに向き合うほど人生の芯になる星です。若い頃に苦手だったことが、後から信頼や専門性に変わる可能性があります。`
      },
      {
        label: "Deep Layer",
        title: "無意識の変化と、深い願い",
        text: `天王星${uranus.sign.name}は変化の起こし方、海王星${neptune.sign.name}は理想や夢の見方、冥王星${pluto.sign.name}は人生の深い変容ポイントを示します。表面的には平気に見せていても、心の奥では「このままではいたくない」と感じる領域がありそうです。無理に大きく変えるより、何度も繰り返している選択の癖に気づくことが、運の流れを変える入口になります。`
      },
      {
        label: "Aspect",
        title: strongestAspect ? `${strongestAspect.from}と${strongestAspect.to}の${strongestAspect.type}` : "穏やかなアスペクト",
        text: strongestAspect
          ? `このチャートで目立つ角度は、${strongestAspect.from}と${strongestAspect.to}の${strongestAspect.type}です。アスペクトは天体同士の関係性なので、単なる性格説明ではなく、あなたの中で力が噛み合う場所や葛藤になりやすい場所を示します。この配置は、才能として自然に出る時もあれば、同じパターンを繰り返す癖として出る時もあります。`
          : "強く目立つアスペクトは少なめです。ひとつの大きな葛藤で動くというより、日々の選択や環境との相性を丁寧に見ることで、その人らしさが浮かびやすいチャートです。"
      }
    ]
  };
}

function elementTone(element: "火" | "地" | "風" | "水") {
  const tones = {
    火: "直感、情熱、勢いを使って前へ進む質があります。",
    地: "現実感、安定、積み重ねを大切にする質があります。",
    風: "言葉、情報、人との対話を通して整理する質があります。",
    水: "感情、共感、記憶や雰囲気を深く受け取る質があります。"
  };
  return tones[element];
}

function buildFollowUpQuestions(messages: Message[]) {
  const lastUser = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const lastAssistant = messages[messages.length - 1]?.role === "assistant";
  if (!lastAssistant) return [];

  const lower = lastUser.toLowerCase();
  if (lastUser.includes("今日の運勢") || lastUser.includes("今日") || lastUser.includes("ラッキー")) {
    return ["今日の恋愛運をもう少し詳しく見て", "今日の仕事運と注意点を見て", "明日の運勢も見て", "今週の流れも見て"];
  }
  if (lastUser.includes("恋") || lastUser.includes("復縁") || lastUser.includes("相性") || lastUser.includes("結婚") || lastUser.includes("あの人")) {
    return ["相手との相性をもっと深く見て", "この恋の短期・中期・長期を見て", "私が気をつけるべき恋愛の癖は？", "次に取るべき行動を具体的に教えて"];
  }
  if (lastUser.includes("仕事") || lastUser.includes("転職") || lastUser.includes("才能") || lastUser.includes("稼") || lower.includes("career")) {
    return ["仕事運の短期・中期・長期を見て", "私の才能を収入に変えるには？", "転職するならいつ動くべき？", "今の職場での課題を星から見て"];
  }
  if (lastUser.includes("お金") || lastUser.includes("収入") || lastUser.includes("稼")) {
    return ["お金の流れをもっと詳しく見て", "収入を増やすための私の星の使い方は？", "浪費しやすいパターンはある？", "今月のお金の注意点は？"];
  }
  return ["短期・中期・長期で詳しく見て", "今の悩みが変わる可能性を見て", "私が次に取るべき行動は？", "このテーマを恋愛と仕事に分けて見て"];
}

function buildLoadingSequence(question: string, readerStyle: ReaderStyleKey) {
  const themeSteps = buildThemeLoadingSteps(question);
  const readerSteps = buildReaderLoadingSteps(readerStyle);
  const candidates = uniqueTexts([...themeSteps, ...readerSteps, ...loadingStepPool]);
  const first = shuffleTexts([...themeSteps, ...readerSteps, ...loadingStepPool.slice(0, 4)])[0] ?? loadingStepPool[0];
  return [first, ...shuffleTexts(candidates.filter((step) => step !== first))].slice(0, 16);
}

function buildThemeLoadingSteps(question: string) {
  const text = question.toLowerCase();
  if (question.includes("今日の運勢") || question.includes("今日") || question.includes("ラッキー")) {
    return ["今日の月と出生図の接点を見ています", "ラッキーカラーとナンバーを星から拾っています", "今日気をつける流れを整えています"];
  }
  if (question.includes("復縁") || question.includes("連絡") || question.includes("元彼") || question.includes("元カノ")) {
    return ["月と金星から、寂しさと本心を分けています", "戻したい気持ちと、戻さない方がいい形を見ています", "連絡する前に見るべき星の条件を探しています"];
  }
  if (question.includes("恋") || question.includes("相性") || question.includes("結婚") || question.includes("あの人") || question.includes("出会い")) {
    return ["金星と火星から、惹かれ方と距離感を見ています", "相手に期待していることと、自分が求めている安心を分けています", "恋愛で繰り返しやすい反応を月の位置から探しています"];
  }
  if (question.includes("仕事") || question.includes("転職") || question.includes("職場") || text.includes("career")) {
    return ["太陽と土星から、働き方の負荷を見ています", "今の環境で伸びている力と、削られている力を分けています", "動くべき条件と、まだ確認すべき条件を並べています"];
  }
  if (question.includes("お金") || question.includes("収入") || question.includes("稼") || question.includes("副業")) {
    return ["金星と木星から、お金の流れを見ています", "増やす前に整えるべき場所を探しています", "才能が収入に変わりやすい使い方を見ています"];
  }
  if (question.includes("人生") || question.includes("転機") || question.includes("将来") || question.includes("運命")) {
    return ["太陽と冥王星から、変化の深さを見ています", "今の迷いが一時的なものか、転機の入口かを見分けています", "長く残る選択と、手放していい選択を分けています"];
  }
  return ["質問の中で一番強く響いている言葉を拾っています", "出生図のどこがこの悩みに反応しているか見ています", "今の星が照らしている焦点を絞っています"];
}

function buildReaderLoadingSteps(readerStyle: ReaderStyleKey) {
  if (readerStyle === "harsh") {
    return ["榊リカの視点で、見ないふりをしている前提を切り出しています", "甘い期待と現実のズレを星から洗い出しています", "耳に痛くても言うべき核心を絞っています", "逃げている場所を、星の配置から見ています"];
  }
  if (readerStyle === "direct") {
    return ["黒瀬レイの視点で、曖昧にしている条件を切り分けています", "現実的に動かすべきポイントを探しています"];
  }
  if (readerStyle === "companion") {
    return ["雨宮しずくの視点で、言葉にしきれない寂しさを拾っています", "揺れている気持ちと、本当に守りたい願いを分けています"];
  }
  if (readerStyle === "mild") {
    return ["白月まどかの視点で、心が受け取りやすい順番を探しています", "不安を強めずに見られる星の流れを選んでいます"];
  }
  return ["標準鑑定として、星の根拠を偏りなく見ています"];
}

function randomLoadingDelay() {
  return 2600 + Math.floor(Math.random() * 1800);
}

function uniqueTexts(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function shuffleTexts(values: string[]) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function parseSavedLocation(city: string) {
  const normalizedCity = city.trim();
  for (const location of japanLocations) {
    if (!normalizedCity.startsWith(location.prefecture)) continue;
    const municipalityName = normalizedCity.slice(location.prefecture.length).trim();
    const municipality =
      location.municipalities.find((item) => item.name === municipalityName) ??
      [...location.municipalities].sort((a, b) => b.name.length - a.name.length).find((item) => municipalityName.includes(item.name) || normalizedCity.includes(item.name)) ??
      location.municipalities[0];
    return { prefecture: location.prefecture, municipality: municipality.name };
  }
  return { prefecture: "東京都", municipality: "新宿区" };
}

function PaywallModal({
  addOnCredits,
  currentPlanKey,
  freeBonusRemaining,
  isMember,
  onBuyAddOn,
  onCheckout,
  onClose
}: {
  addOnCredits: number;
  currentPlanKey: PlanKey;
  freeBonusRemaining: number;
  isMember: boolean;
  onBuyAddOn: () => void | Promise<void>;
  onCheckout: (nextPlan: Exclude<PlanKey, "free">) => void | Promise<void>;
  onClose: () => void;
}) {
  const isUnregisteredFree = currentPlanKey === "free" && !isMember;
  const modalTitle = isUnregisteredFree ? "新規登録で続きを相談できます" : "ここから先は、星の文脈を保存して続きます";
  const freeMessage = isUnregisteredFree
    ? `未登録で使える${resolvePlan("free").questionLimit}回分の相談枠を使い切りました。新規登録をすると、あなたの星を記録して初回${registeredFreeBonusLimit}回分の相談枠を受け取れます。`
    : isMember && freeBonusRemaining <= 0
      ? `今日の無料相談枠を使い切りました。明日になれば無料プランでもまた3回相談できます。今すぐ続けたい場合は、相談回数と鑑定タイプを広げられます。`
      : "今日の無料相談枠を使い切りました。明日また3回相談できます。今すぐ続きを読みたい場合だけ、下のプランから選べます。";

  return (
    <div className="pricing-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pricing-modal-title">
      <div className="pricing-modal">
        <button className="modal-close" type="button" onClick={onClose} aria-label="閉じる">
          ×
        </button>
        <div className="pricing-modal-heading">
          <div className="eyebrow">Continue Reading</div>
          <h2 id="pricing-modal-title">{modalTitle}</h2>
          <p>{freeMessage}</p>
        </div>
        {isUnregisteredFree ? (
          <div className="actions compact-actions">
            <Link className="button primary" href="/register?returnTo=/consultation">
              新規登録して続きを相談する
            </Link>
            <Link className="button" href="/pricing">
              有料プランも見る
            </Link>
          </div>
        ) : (
          <PricingPanel addOnCredits={addOnCredits} currentPlanKey={currentPlanKey} onBuyAddOn={onBuyAddOn} onCheckout={onCheckout} />
        )}
      </div>
    </div>
  );
}
