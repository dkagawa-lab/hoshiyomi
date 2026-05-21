import { NextResponse } from "next/server";
import { Chart, calculateTransits } from "@/lib/astrology";
import { buildChartContext, buildTransitContext, demoAnswer, systemPrompt } from "@/lib/prompt";
import { ReaderStyleKey, resolveReaderStyle } from "@/lib/readerStyles";
import { PlanKey, resolvePlan, usageLimitsDisabled } from "@/lib/plans";
import { QuestionIntentKey, resolveQuestionIntent } from "@/lib/questionIntents";
import { buildConversationContext, generateAstrologyAnswer, isAnthropicApiError, isAnthropicRateLimitError, isProductionAiConfigured, mergeConversationMessages, normalizeChatMessages } from "@/lib/aiRuntime";
import { consumeQuota, countLifetimeUserMessages, getQuotaState, getUsageSnapshot, insertChatTurn, isServerStoreConfigured, listChatMessages, normalizeClientUserId, upsertUserForChart } from "@/lib/serverStore";

type ChatRequest = {
  chart: Chart;
  question: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  readerStyle?: ReaderStyleKey;
  plan?: PlanKey;
  questionIntent?: QuestionIntentKey;
  clientUserId?: string;
  isMember?: boolean;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  if (!body.chart || !body.question) {
    return NextResponse.json({ error: "chart and question are required" }, { status: 400 });
  }

  const transits = calculateTransits(body.chart);
  const readerStyle = resolveReaderStyle(body.readerStyle).key;
  const questionIntent = resolveQuestionIntent(body.question, body.questionIntent).key;
  const clientUserId = normalizeClientUserId(body.clientUserId);
  const storedUser = isServerStoreConfigured() && clientUserId ? await upsertUserForChart({ chart: body.chart, clientUserId, isMember: Boolean(body.isMember) }) : null;
  const quota = storedUser ? await getQuotaState(storedUser) : null;
  const plan = resolvePlan(quota?.plan ?? body.plan);
  const quotaDisabled = usageLimitsDisabled();
  const clientMessages = normalizeChatMessages(body.messages, body.question, plan.key);
  const storedMessages = storedUser
    ? (await listChatMessages(storedUser.id, plan.key === "luxury" ? 80 : 40)).map((message) => ({ role: message.role, content: message.content }))
    : [];
  const conversationMessages = mergeConversationMessages(storedMessages, clientMessages, body.question, plan.key);
  const freeAnswerCount = plan.key === "free" && storedUser ? await countLifetimeUserMessages(storedUser.id) : countPreviousClientUserQuestions(body.messages);

  if (!quotaDisabled && storedUser && quota && quota.remaining <= 0) {
    return NextResponse.json(
      {
        error: "相談回数を使い切りました。追加100回パック、または上位プランで続けて相談できます。",
        usage: await getUsageSnapshot(storedUser)
      },
      { status: 402 }
    );
  }

  if (!isProductionAiConfigured()) {
    const answer = demoAnswer(body.question, body.chart, transits, readerStyle, plan.key, questionIntent);
    if (storedUser && quota) {
      await insertChatTurn({ answer, question: body.question, userId: storedUser.id });
      if (quotaDisabled) return NextResponse.json({ answer, mode: "demo", usage: await getUsageSnapshot(storedUser) });
      const updatedUser = await consumeQuota(storedUser, quota);
      return NextResponse.json({ answer, mode: "demo", usage: await getUsageSnapshot(updatedUser) });
    }
    return NextResponse.json({ answer, mode: "demo" });
  }

  let answer = "";
  let aiMode: "anthropic" | undefined;
  let aiModel: string | undefined;
  try {
    const result = await generateAstrologyAnswer({
      freeAnswerCount,
      planKey: plan.key,
      system: [
        systemPrompt(readerStyle, plan.key, questionIntent, body.question),
        buildConversationContext(conversationMessages, plan.key),
        `出生図データ:\n${buildChartContext(body.chart)}`,
        `現在のトランジットデータ:\n${buildTransitContext(transits)}`
      ].join("\n\n"),
      messages: conversationMessages
    });
    answer = result.answer;
    aiMode = result.mode;
    aiModel = result.model;
  } catch (error) {
    if (isAnthropicRateLimitError(error)) {
      console.warn("Anthropic rate limit reached", {
        inputTokensRemaining: error.rateLimit.inputTokensRemaining,
        outputTokensRemaining: error.rateLimit.outputTokensRemaining,
        requestsRemaining: error.rateLimit.requestsRemaining,
        retryAfterSeconds: error.retryAfterSeconds,
        tokensRemaining: error.rateLimit.tokensRemaining
      });
      return NextResponse.json(
        {
          code: error.code,
          error: buildRateLimitMessage(error.retryAfterSeconds),
          retryAfterSeconds: error.retryAfterSeconds
        },
        { status: 429 }
      );
    }

    if (isAnthropicApiError(error)) {
      console.warn("Anthropic API error", {
        inputTokensRemaining: error.rateLimit.inputTokensRemaining,
        outputTokensRemaining: error.rateLimit.outputTokensRemaining,
        requestsRemaining: error.rateLimit.requestsRemaining,
        status: error.status,
        tokensRemaining: error.rateLimit.tokensRemaining
      });
      return NextResponse.json(
        {
          code: error.status === 529 ? "ANTHROPIC_OVERLOADED" : error.code,
          error: error.status === 529 ? "今、鑑定が集中していて少しつながりにくくなっています。相談回数は消費していません。少し時間をおいて、もう一度送ってください。" : "鑑定文の生成で一時的な問題が起きました。相談回数は消費していません。少し時間をおいて、もう一度送ってください。"
        },
        { status: error.status === 529 ? 503 : 502 }
      );
    }

    console.warn("AI response failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: "鑑定文の生成で一時的な問題が起きました。相談回数は消費していません。少し時間をおいて、もう一度送ってください。" }, { status: 502 });
  }

  if (storedUser && quota) {
    await insertChatTurn({ answer, question: body.question, userId: storedUser.id });
    if (quotaDisabled) return NextResponse.json({ answer, mode: aiMode, model: aiModel, usage: await getUsageSnapshot(storedUser) });
    const updatedUser = await consumeQuota(storedUser, quota);
    return NextResponse.json({ answer, mode: aiMode, model: aiModel, usage: await getUsageSnapshot(updatedUser) });
  }
  return NextResponse.json({ answer, mode: aiMode, model: aiModel });
}

function countPreviousClientUserQuestions(messages: ChatRequest["messages"]) {
  const currentIncludedCount =
    messages?.filter((message) => message.role === "user" && typeof message.content === "string" && message.content.trim()).length ?? 0;
  return Math.max(0, currentIncludedCount - 1);
}

function buildRateLimitMessage(retryAfterSeconds?: number) {
  const wait = formatRetryAfter(retryAfterSeconds);
  return `今、鑑定への相談が集中しています。相談回数は消費していません。${wait ? `${wait}ほど時間をおいて、` : "少し時間をおいて、"}もう一度送ってください。`;
}

function formatRetryAfter(seconds?: number) {
  if (!seconds || seconds <= 0) return "";
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  return `${Math.ceil(seconds / 60)}分`;
}
