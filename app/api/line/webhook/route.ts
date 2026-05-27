import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { BirthInput, calculateChart, calculateTransits } from "@/lib/astrology";
import { buildChartContext, buildTransitContext, demoAnswer, systemPrompt } from "@/lib/prompt";
import { canUseReaderStyle, resolvePlan, usageLimitsDisabled } from "@/lib/plans";
import { classifyQuestionBilling, NonBillableQuestionKind, QuestionBilling } from "@/lib/questionBilling";
import { ReaderStyleKey, resolveReaderStyle } from "@/lib/readerStyles";
import { resolveQuestionIntent } from "@/lib/questionIntents";
import { buildConversationContext, generateAstrologyAnswer, isAnthropicApiError, isAnthropicRateLimitError, isProductionAiConfigured, mergeConversationMessages, normalizeChatMessages } from "@/lib/aiRuntime";
import { consumeQuota, countLifetimeUserMessages, getQuotaState, getUsageSnapshot, getUserByLineUserId, insertChatTurn, isServerStoreConfigured, listChatMessages, StoredUser, UsageSnapshot } from "@/lib/serverStore";

type LineWebhookBody = {
  events?: LineEvent[];
};

type LineEvent = {
  message?: {
    text?: string;
    type?: string;
  };
  replyToken?: string;
  source?: {
    userId?: string;
  };
  type?: string;
};

type LineTextMessage = {
  text: string;
  type: "text";
};

type LinePersistenceResult = {
  historySaved: boolean;
  quotaSaved: boolean;
  usage: UsageSnapshot | null;
  usageLoaded: boolean;
};

function verifyLineSignature(body: string, signature: string | null) {
  const secret = readEnv("LINE_CHANNEL_SECRET");
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: Request) {
  const body = await req.text();
  if (!readEnv("LINE_CHANNEL_SECRET")) {
    return NextResponse.json({ error: "LINE channel secret is not configured" }, { status: process.env.NODE_ENV === "production" ? 500 : 200 });
  }
  if (!verifyLineSignature(body, req.headers.get("x-line-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!isServerStoreConfigured()) {
    return NextResponse.json({ ok: true, mode: "store-not-configured" });
  }

  const payload = parseLinePayload(body);
  await Promise.all((payload.events || []).map(handleLineEvent));
  return NextResponse.json({ ok: true });
}

async function handleLineEvent(event: LineEvent) {
  const replyToken = event.replyToken;
  const lineUserId = event.source?.userId;
  if (!replyToken || !lineUserId) return;

  try {
    await handleLineEventCore(event, replyToken, lineUserId);
  } catch (error) {
    console.warn("LINE event failed", { message: error instanceof Error ? error.message : "Unknown error" });
    await replyLineText(replyToken, [buildLineSystemErrorReply()]);
  }
}

async function handleLineEventCore(event: LineEvent, replyToken: string, lineUserId: string) {
  if (event.type === "follow") {
    await replyLineText(replyToken, [
      "HOSHIYOMIを追加してくれてありがとうございます。\n\nWebで星を読んでLINE登録・友だち追加まで済ませると、このトーク画面からそのまま相談できます。\n\n登録済みの方は、いつもの言葉で質問を送ってください。"
    ]);
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text") return;
  const question = normalizeLineQuestion(event.message.text);
  if (!question) return;
  const billing = classifyQuestionBilling(question);

  const user = await getUserByLineUserId(lineUserId);
  if (!user) {
    if (!billing.countable) {
      await replyLineText(replyToken, [buildNonBillableLineReply(billing, null)]);
      return;
    }
    await replyLineText(replyToken, [
      `LINEから相談するには、先にHOSHIYOMIで会員登録とLINE登録・友だち追加が必要です。\n\n登録済みの場合も、アカウント画面からLINE登録をもう一度行うと、このLINEと鑑定履歴がつながります。\n${appUrl("/login?returnTo=/consultation")}`
    ]);
    return;
  }

  if (!billing.countable) {
    await replyLineText(replyToken, [buildNonBillableLineReply(billing, await getUsageSnapshot(user))]);
    return;
  }

  const birth = birthInputFromUser(user);
  if (!birth) {
    await replyLineText(replyToken, [
      `まだ出生情報が保存されていません。\n\nWebで「星を読む」から生年月日・出生地を登録すると、LINEでもあなたの星の文脈を使って相談できます。\n${appUrl("/#app")}`
    ]);
    return;
  }

  const quota = await getQuotaState(user);
  const plan = resolvePlan(quota.plan);
  const quotaDisabled = usageLimitsDisabled();
  if (!quotaDisabled && quota.remaining <= 0) {
    await replyLineText(replyToken, [buildLimitReply(user, quota)]);
    return;
  }

  const { readerStyle, normalizedQuestion, blockedReply } = resolveLineReaderStyle(question, plan.key);
  if (blockedReply) {
    await replyLineText(replyToken, [blockedReply]);
    return;
  }

  await startLineLoading(lineUserId);

  const chart = calculateChart(birth);
  const transits = calculateTransits(chart);
  const intent = resolveQuestionIntent(normalizedQuestion).key;
  const storedMessages =
    (await safeLineStore("read stored messages", () => listChatMessages(user.id, plan.key === "luxury" ? 80 : 40)))?.map((message) => ({ role: message.role, content: message.content })) ?? [];
  const clientMessages = normalizeChatMessages([{ role: "user", content: normalizedQuestion }], normalizedQuestion, plan.key);
  const conversationMessages = mergeConversationMessages(storedMessages, clientMessages, normalizedQuestion, plan.key);
  const freeAnswerCount = plan.key === "free" ? (await safeLineStore("count lifetime messages", () => countLifetimeUserMessages(user.id))) ?? 0 : 0;

  let answer = "";
  try {
    if (!isProductionAiConfigured()) {
      answer = demoAnswer(normalizedQuestion, chart, transits, readerStyle, plan.key, intent);
    } else {
      const result = await generateAstrologyAnswer({
        freeAnswerCount,
        planKey: plan.key,
        system: [
          systemPrompt(readerStyle, plan.key, intent, normalizedQuestion),
          "LINEでの相談です。返信は自然な手紙調にしつつ、星の根拠・現在の流れ・次に聞ける問いを省略しないでください。",
          buildConversationContext(conversationMessages, plan.key),
          `出生図データ:\n${buildChartContext(chart)}`,
          `現在のトランジットデータ:\n${buildTransitContext(transits)}`
        ].join("\n\n"),
        messages: conversationMessages
      });
      answer = result.answer;
    }
  } catch (error) {
    await replyLineText(replyToken, [buildLineAiErrorReply(error)]);
    return;
  }

  const persistence = await persistLineChatTurnAndQuota({ answer, normalizedQuestion, quota, quotaDisabled, user });
  const statusFooter = buildLineStatusFooter({
    persistence,
    readerStyle,
    usage: persistence.usage ?? usageSnapshotFromQuota(quota)
  });
  await replyLineText(replyToken, [answer, statusFooter]);
}

function parseLinePayload(body: string): LineWebhookBody {
  try {
    return JSON.parse(body) as LineWebhookBody;
  } catch {
    return {};
  }
}

function normalizeLineQuestion(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\r\n/g, "\n").slice(0, 1500);
}

function birthInputFromUser(user: StoredUser): BirthInput | null {
  if (!user.birth_date || user.latitude === null || user.longitude === null) return null;
  return {
    city: user.birth_city || "",
    date: user.birth_date,
    gender: user.gender || undefined,
    latitude: Number(user.latitude),
    longitude: Number(user.longitude),
    name: user.name || "あなた",
    romanticInterest: user.romantic_interest || undefined,
    time: user.birth_time ? String(user.birth_time).slice(0, 5) : ""
  };
}

function buildNonBillableLineReply(billing: QuestionBilling, usage: UsageSnapshot | null) {
  const usageText = usage ? `\n\n現在の利用状況\nプラン: ${resolvePlan(usage.plan).label}\n残り回数: ${usage.remaining}回` : "";
  const noCount = "\n\nこの確認では相談回数は消費していません。";
  const kind = billing.kind as NonBillableQuestionKind;

  if (kind === "usage") {
    return usage
      ? `${buildLineStatusFooter({ readerStyle: "normal", usage, verbose: true })}${noCount}`
      : `利用状況を確認するには、先にHOSHIYOMIで会員登録とLINE登録・友だち追加が必要です。\n${appUrl("/login?returnTo=/consultation")}${noCount}`;
  }
  if (kind === "pricing") {
    return `料金やプランは、プランページで確認できます。\n\n通常プラン、プライベートプラン、追加100回パックを用意しています。\n${appUrl("/pricing")}${usageText}${noCount}`;
  }
  if (kind === "reader") {
    return `占い師タイプは、通常・マイルド・はっきり厳しめ・寄り添い系・辛辣から選べます。\n\nLINEでは「辛辣: 復縁を見て」のように、占い師タイプを先頭につけて送れます。無料プランでは通常、通常プランではマイルドとはっきり厳しめ、プライベートプランでは全タイプが使えます。${usageText}${noCount}`;
  }
  if (kind === "line") {
    return `LINEでは、登録済みの星と鑑定履歴を引き継いで相談できます。\n\n連携状態や登録情報はWebの登録情報ページで確認できます。\n${appUrl("/account")}${usageText}${noCount}`;
  }
  if (kind === "account") {
    return `登録情報、ログイン状態、出生情報、鑑定履歴はWebの登録情報ページで確認できます。\n${appUrl("/account")}${usageText}${noCount}`;
  }
  if (kind === "legal") {
    return `利用規約、プライバシーポリシー、特定商取引法に基づく表記はこちらから確認できます。\n${appUrl("/terms")}\n${appUrl("/privacy")}\n${appUrl("/legal/commercial-disclosure")}${noCount}`;
  }
  if (kind === "small_talk") {
    return `ありがとうございます。占いたいことがあれば、そのまま短く送ってください。\n\n例: 今日の運勢は？ / 復縁をどう見ればいい？ / 転職するなら何を重視すべき？${usageText}${noCount}`;
  }
  if (kind === "off_topic") {
    return `ここでは、星読み・登録情報・使い方に関する内容を扱っています。\n\n医療、法律、投資など専門判断が必要なことは専門家へ相談してください。占いたいテーマがあれば、恋愛・仕事・人生の流れのように送ってください。${usageText}${noCount}`;
  }
  return `使い方や不具合については、Webの登録情報ページや問い合わせページから確認できます。\n${appUrl("/account")}\n${appUrl("/contact")}${usageText}${noCount}`;
}

function buildLineStatusFooter(input: { persistence?: LinePersistenceResult; readerStyle: ReaderStyleKey; usage: UsageSnapshot; verbose?: boolean }) {
  const plan = resolvePlan(input.usage.plan);
  const reader = resolveReaderStyle(input.readerStyle);
  const periodLabel = plan.usagePeriod === "day" ? "今日" : "今月";
  const lines = [
    input.verbose ? "現在の利用状況" : "今回の鑑定情報",
    "",
    `プラン: ${plan.label}`,
    `占い師: ${reader.readerName}（${reader.label}）`,
    `残り回数: ${input.usage.remaining}回`
  ];

  if (input.usage.freeBonusRemaining > 0 && input.usage.plan === "free") {
    lines.push(`登録特典: 残り${input.usage.freeBonusRemaining}回`);
  }
  if (input.usage.addOnCredits > 0) {
    lines.push(`追加分: 残り${input.usage.addOnCredits}回`);
  }
  if (!input.verbose) {
    lines.push(`集計期間: ${periodLabel}`);
  }
  if (input.persistence && (!input.persistence.historySaved || !input.persistence.quotaSaved || !input.persistence.usageLoaded)) {
    const unresolved = [
      !input.persistence.historySaved ? "履歴保存" : "",
      !input.persistence.quotaSaved ? "回数反映" : "",
      !input.persistence.usageLoaded ? "残り回数の再取得" : ""
    ].filter(Boolean);
    lines.push("");
    lines.push(`反映状況: ${unresolved.join("・")}を確認できませんでした。鑑定文は送信済みです。`);
    lines.push(`確認: ${appUrl("/account")}`);
  }

  return lines.join("\n");
}

function usageSnapshotFromQuota(quota: Awaited<ReturnType<typeof getQuotaState>>): UsageSnapshot {
  return {
    addOnCredits: quota.addOnCredits,
    freeBonusRemaining: quota.freeBonusRemaining,
    isMember: quota.isMember,
    plan: quota.plan,
    remaining: quota.remaining,
    used: quota.used
  };
}

function buildLimitReply(user: StoredUser, quota: Awaited<ReturnType<typeof getQuotaState>>) {
  const plan = resolvePlan(quota.plan);
  if (plan.key === "free") {
    const waitText = user.is_member ? "今日の相談回数を使い切りました。明日になるとまた3回相談できます。" : "未登録で使える相談回数を使い切りました。";
    return `${waitText}\n\n続けて深く読む場合は、通常プラン、プライベートプラン、追加100回パックを選べます。\n${appUrl("/pricing")}`;
  }
  return `今月の${plan.label}の相談回数を使い切りました。\n\n続けて相談する場合は、追加100回パックを使えます。\n${appUrl("/pricing")}`;
}

function buildLineAiErrorReply(error: unknown) {
  if (isAnthropicRateLimitError(error)) {
    const retry = error.retryAfterSeconds ? `\n\n${formatRetryAfter(error.retryAfterSeconds)}ほど時間をおいて、もう一度送ってください。` : "";
    return `今、鑑定への相談が集中しています。相談回数は消費していません。${retry}`;
  }
  if (isAnthropicApiError(error) && error.status === 529) {
    return "今、鑑定が集中していて少しつながりにくくなっています。相談回数は消費していません。少し時間をおいて、もう一度送ってください。";
  }
  return "鑑定文の生成で一時的な問題が起きました。相談回数は消費していません。少し時間をおいて、もう一度送ってください。";
}

function buildLineSystemErrorReply() {
  return `会員情報または相談枠の確認で一時的な問題が起きました。\n\nWebで登録情報を確認してから、少し時間をおいてもう一度送ってください。\n${appUrl("/account")}`;
}

function formatRetryAfter(seconds: number) {
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  return `${Math.ceil(seconds / 60)}分`;
}

async function persistLineChatTurnAndQuota(input: {
  answer: string;
  normalizedQuestion: string;
  quota: Awaited<ReturnType<typeof getQuotaState>>;
  quotaDisabled: boolean;
  user: StoredUser;
}) {
  const historyResult = await safeLineStoreResult("insert line chat turn", () => insertChatTurn({ answer: input.answer, question: input.normalizedQuestion, userId: input.user.id }));
  const quotaResult = input.quotaDisabled ? { ok: true as const, value: input.user } : await safeLineStoreResult("consume line quota", () => consumeQuota(input.user, input.quota));
  const usageUser = quotaResult.ok ? quotaResult.value : input.user;
  const usageResult = await safeLineStoreResult("read usage after line reply", () => getUsageSnapshot(usageUser));

  return {
    historySaved: historyResult.ok,
    quotaSaved: input.quotaDisabled || quotaResult.ok,
    usage: usageResult.ok ? usageResult.value : null,
    usageLoaded: usageResult.ok
  };
}

async function safeLineStore<T>(label: string, action: () => Promise<T>) {
  try {
    return await action();
  } catch (error) {
    console.warn(`LINE store skipped: ${label}`, { message: error instanceof Error ? error.message : "Unknown error" });
    return null;
  }
}

async function safeLineStoreResult<T>(label: string, action: () => Promise<T>) {
  try {
    return { ok: true as const, value: await action() };
  } catch (error) {
    console.warn(`LINE store failed: ${label}`, { message: error instanceof Error ? error.message : "Unknown error" });
    return { ok: false as const };
  }
}

function resolveLineReaderStyle(question: string, planKey: "free" | "standard" | "luxury"): { blockedReply?: string; normalizedQuestion: string; readerStyle: ReaderStyleKey } {
  const matched = question.match(/^(通常|標準|マイルド|やさしく|優しく|寄り添い|共感|厳しめ|はっきり|辛辣|容赦なく)[：:\s]+([\s\S]+)$/);
  if (!matched) return { normalizedQuestion: question, readerStyle: "normal" };

  const keyword = matched[1];
  const normalizedQuestion = matched[2].trim() || question;
  const readerStyle = keyword.includes("辛辣") || keyword.includes("容赦") ? "harsh" : keyword.includes("寄り添い") || keyword.includes("共感") ? "companion" : keyword.includes("厳し") || keyword.includes("はっきり") ? "direct" : keyword.includes("マイルド") || keyword.includes("やさ") || keyword.includes("優") ? "mild" : "normal";
  const style = resolveReaderStyle(readerStyle);
  if (!canUseReaderStyle(style.key, planKey)) {
    const plan = resolvePlan(style.requiredPlan);
    return {
      blockedReply: `${style.readerName}は${plan.label}で選べます。\n\n今は通常鑑定として相談するか、プランを変更してからもう一度送ってください。\n${appUrl("/pricing")}`,
      normalizedQuestion,
      readerStyle: "normal"
    };
  }
  return { normalizedQuestion, readerStyle: style.key };
}

async function replyLineText(replyToken: string, texts: string[]) {
  const allMessages = texts.flatMap((text) => toLineTextMessages(text));
  const messages = allMessages.length > 5 ? [...allMessages.slice(0, 4), allMessages[allMessages.length - 1]] : allMessages;
  const accessToken = readEnv("LINE_CHANNEL_ACCESS_TOKEN");
  if (messages.length === 0 || !accessToken) return;
  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages, replyToken })
  });
  if (!response.ok) throw new Error(await response.text());
}

async function startLineLoading(lineUserId: string) {
  const accessToken = readEnv("LINE_CHANNEL_ACCESS_TOKEN");
  if (!accessToken) return;
  await fetch("https://api.line.me/v2/bot/chat/loading/start", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ chatId: lineUserId, loadingSeconds: 20 })
  }).catch(() => undefined);
}

function toLineTextMessages(text: string): LineTextMessage[] {
  const chunks = splitLineText(text, 4500);
  return chunks.map((chunk) => ({ text: chunk, type: "text" }));
}

function splitLineText(text: string, limit: number) {
  const source = text.trim();
  if (!source) return [];
  const chunks: string[] = [];
  let rest = source;
  while (rest.length > limit && chunks.length < 4) {
    const slice = rest.slice(0, limit);
    const breakAt = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf("\n"), slice.lastIndexOf("。"));
    const index = breakAt > Math.floor(limit * 0.55) ? breakAt + 1 : limit;
    chunks.push(rest.slice(0, index).trim());
    rest = rest.slice(index).trim();
  }
  if (rest) chunks.push(rest);
  return chunks.slice(0, 5);
}

function appUrl(path: string) {
  const origin = (readEnv("NEXT_PUBLIC_APP_URL") || "https://hoshiyomi4u.com").replace(/\/$/, "");
  return `${origin}${path}`;
}

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}
