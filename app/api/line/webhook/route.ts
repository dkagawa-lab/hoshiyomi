import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { BirthInput, calculateChart, calculateTransits } from "@/lib/astrology";
import { buildChartContext, buildTransitContext, demoAnswer, systemPrompt } from "@/lib/prompt";
import { canUseReaderStyle, resolvePlan, usageLimitsDisabled } from "@/lib/plans";
import { ReaderStyleKey, resolveReaderStyle } from "@/lib/readerStyles";
import { resolveQuestionIntent } from "@/lib/questionIntents";
import { buildConversationContext, generateAstrologyAnswer, isAnthropicApiError, isAnthropicRateLimitError, isProductionAiConfigured, mergeConversationMessages, normalizeChatMessages } from "@/lib/aiRuntime";
import { consumeQuota, countLifetimeUserMessages, getQuotaState, getUsageSnapshot, getUserByLineUserId, insertChatTurn, isServerStoreConfigured, listChatMessages, StoredUser } from "@/lib/serverStore";

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

function verifyLineSignature(body: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: Request) {
  const body = await req.text();
  if (process.env.LINE_CHANNEL_SECRET && !verifyLineSignature(body, req.headers.get("x-line-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!isServerStoreConfigured()) {
    return NextResponse.json({ ok: true, mode: "store-not-configured" });
  }

  const payload = parseLinePayload(body);
  await Promise.all((payload.events || []).map((event) => handleLineEvent(event).catch((error) => console.warn("LINE event failed", { message: error instanceof Error ? error.message : "Unknown error" }))));
  return NextResponse.json({ ok: true });
}

async function handleLineEvent(event: LineEvent) {
  const replyToken = event.replyToken;
  const lineUserId = event.source?.userId;
  if (!replyToken || !lineUserId) return;

  if (event.type === "follow") {
    await replyLineText(replyToken, [
      "HOSHIYOMIを追加してくれてありがとうございます。\n\nWebで星を読んでLINE登録まで済ませると、このトーク画面からそのまま相談できます。\n\n登録済みの方は、いつもの言葉で質問を送ってください。"
    ]);
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text") return;
  const question = normalizeLineQuestion(event.message.text);
  if (!question) return;

  const user = await getUserByLineUserId(lineUserId);
  if (!user) {
    await replyLineText(replyToken, [
      `LINEから相談するには、先にHOSHIYOMIで会員登録とLINE連携が必要です。\n\n登録済みの場合も、アカウント画面からLINE登録をもう一度行うと、このLINEと鑑定履歴がつながります。\n${appUrl("/login?returnTo=/consultation")}`
    ]);
    return;
  }

  if (isUsageQuestion(question)) {
    await replyLineText(replyToken, [await buildUsageReply(user)]);
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
  const storedMessages = (await listChatMessages(user.id, plan.key === "luxury" ? 80 : 40)).map((message) => ({ role: message.role, content: message.content }));
  const clientMessages = normalizeChatMessages([{ role: "user", content: normalizedQuestion }], normalizedQuestion, plan.key);
  const conversationMessages = mergeConversationMessages(storedMessages, clientMessages, normalizedQuestion, plan.key);
  const freeAnswerCount = plan.key === "free" ? await countLifetimeUserMessages(user.id) : 0;

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

  await insertChatTurn({ answer, question: normalizedQuestion, userId: user.id });
  const updatedUser = quotaDisabled ? user : await consumeQuota(user, quota);
  await replyLineText(replyToken, [answer, buildShortUsageFooter(await getUsageSnapshot(updatedUser))]);
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

function isUsageQuestion(question: string) {
  return /^(残り|回数|相談回数|トークン|プラン|利用状況|あと何回)/.test(question.trim());
}

async function buildUsageReply(user: StoredUser) {
  return buildShortUsageFooter(await getUsageSnapshot(user), true);
}

function buildShortUsageFooter(usage: Awaited<ReturnType<typeof getUsageSnapshot>>, verbose = false) {
  const plan = resolvePlan(usage.plan);
  const base = `${verbose ? "現在の利用状況\n\n" : ""}${plan.label}: 残り${usage.remaining}回`;
  const details = usage.addOnCredits > 0 ? `\n追加分: 残り${usage.addOnCredits}回` : "";
  const bonus = usage.freeBonusRemaining > 0 && usage.plan === "free" ? `\n登録特典: 残り${usage.freeBonusRemaining}回` : "";
  return `${base}${bonus}${details}`;
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

function formatRetryAfter(seconds: number) {
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  return `${Math.ceil(seconds / 60)}分`;
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
  const messages = texts.flatMap((text) => toLineTextMessages(text)).slice(0, 5);
  if (messages.length === 0 || !process.env.LINE_CHANNEL_ACCESS_TOKEN) return;
  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages, replyToken })
  });
  if (!response.ok) throw new Error(await response.text());
}

async function startLineLoading(lineUserId: string) {
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) return;
  await fetch("https://api.line.me/v2/bot/chat/loading/start", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
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
  const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://hoshiyomi4u.com").replace(/\/$/, "");
  return `${origin}${path}`;
}
