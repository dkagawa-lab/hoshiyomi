import { NextResponse } from "next/server";
import { Chart, calculateChart, calculateTransits } from "@/lib/astrology";
import { buildChartContext, buildTransitContext, demoAnswer, systemPrompt } from "@/lib/prompt";
import { ReaderStyleKey, resolveReaderStyle } from "@/lib/readerStyles";
import { PlanKey, resolvePlan, usageLimitsDisabled } from "@/lib/plans";
import { classifyQuestionBilling, NonBillableQuestionKind, QuestionBilling } from "@/lib/questionBilling";
import { QuestionIntentKey, resolveQuestionIntent } from "@/lib/questionIntents";
import { buildConversationContext, generateAstrologyAnswer, isAnthropicApiError, isAnthropicRateLimitError, isProductionAiConfigured, mergeConversationMessages, normalizeChatMessages } from "@/lib/aiRuntime";
import { anonymousSessionCookieName, getAuthenticatedRequestUser, getOrCreateAnonymousRequestUser } from "@/lib/serverAuth";
import { birthInputFromStoredUser, checkNonBillableRateLimit, consumeQuota, countLifetimeUserMessages, getQuotaState, getUsageSnapshot, insertChatTurn, isServerStoreConfigured, listChatMessages, normalizeClientUserId, NonBillableRateLimitResult, StoredUser, upsertUserForChart, upsertUserForLineChart } from "@/lib/serverStore";

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
  const authUser = await getAuthenticatedRequestUser(req);
  const anonymousUser = authUser ? null : getOrCreateAnonymousRequestUser(req);
  const respond = (payload: unknown, init?: ResponseInit) => {
    const response = NextResponse.json(payload, init);
    if (anonymousUser?.cookieValue) {
      response.cookies.set(anonymousSessionCookieName, anonymousUser.cookieValue, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }
    return response;
  };

  if (!body.chart || !body.question) {
    return respond({ error: "chart and question are required" }, { status: 400 });
  }

  const billing = classifyQuestionBilling(body.question);
  const requestClientUserId = normalizeClientUserId(body.clientUserId);
  const clientUserId = authUser?.clientUserId ?? anonymousUser?.clientUserId ?? (process.env.NODE_ENV === "production" && isServerStoreConfigured() ? null : requestClientUserId);
  const requiresServerBackedAi = billing.countable && isProductionAiConfigured() && process.env.NODE_ENV === "production";
  if (requiresServerBackedAi && !isServerStoreConfigured()) {
    return respond({ error: "相談回数の確認ができないため、鑑定を開始できません。少し時間をおいてもう一度お試しください。" }, { status: 503 });
  }
  if (requiresServerBackedAi && !clientUserId) {
    return respond({ error: "お試し相談枠を確認できませんでした。少し時間をおいてもう一度お試しください。" }, { status: 503 });
  }

  const storedUser =
    isServerStoreConfigured() && clientUserId
      ? requiresServerBackedAi
        ? await requiredServerStore("upsert user for chat", () => upsertChatUser({ authUser, chart: body.chart, clientUserId, isMember: Boolean(authUser) }))
        : await safeServerStore("upsert user for chat", () => upsertChatUser({ authUser, chart: body.chart, clientUserId, isMember: Boolean(authUser || body.isMember) }))
      : null;
  const quota = storedUser
    ? requiresServerBackedAi
      ? await requiredServerStore("read quota for chat", () => getQuotaState(storedUser))
      : await safeServerStore("read quota for chat", () => getQuotaState(storedUser))
    : null;
  if (requiresServerBackedAi && (!storedUser || !quota)) {
    return respond({ error: "相談回数の確認ができないため、鑑定を開始できません。少し時間をおいてもう一度お試しください。" }, { status: 503 });
  }
  const plan = resolvePlan(quota?.plan ?? body.plan);
  const quotaDisabled = usageLimitsDisabled();
  if (!billing.countable) {
    const usage = storedUser ? await safeServerStore("read usage for non-billable chat", () => getUsageSnapshot(storedUser)) : null;
    const rateLimit = await checkNonBillableRateLimit({
      identifier: buildWebNonBillableIdentifier(req, storedUser?.id ?? clientUserId),
      kind: billing.kind,
      scope: storedUser ? "web-user" : clientUserId ? "web-client" : "web-anonymous"
    });
    if (!rateLimit.allowed) {
      return respond(
        {
          counted: false,
          error: buildNonBillableLimitMessage(rateLimit),
          nonBillableKind: billing.kind,
          nonBillableLimited: true,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
          ...(usage ? { usage } : {})
        },
        { status: 429 }
      );
    }
    return respond({
      answer: buildNonBillableChatAnswer(billing, usage),
      counted: false,
      nonBillableKind: billing.kind,
      nonBillableRemaining: rateLimit.remaining,
      ...(usage ? { usage } : {})
    });
  }

  const effectiveChart = resolveEffectiveChart(storedUser, body.chart);
  const transits = calculateTransits(effectiveChart);
  const readerStyle = resolveReaderStyle(body.readerStyle).key;
  const questionIntent = resolveQuestionIntent(body.question, body.questionIntent).key;
  const clientMessages = normalizeChatMessages(body.messages, body.question, plan.key);
  const storedMessages = storedUser
    ? (await safeServerStore("read stored chat messages", () => listChatMessages(storedUser.id, plan.key === "luxury" ? 80 : 40)))?.map((message) => ({ role: message.role, content: message.content })) ?? []
    : [];
  const conversationMessages = mergeConversationMessages(storedMessages, clientMessages, body.question, plan.key);
  const freeAnswerCount =
    plan.key === "free" && storedUser
      ? (await safeServerStore("count lifetime user messages", () => countLifetimeUserMessages(storedUser.id))) ?? countPreviousClientUserQuestions(body.messages)
      : countPreviousClientUserQuestions(body.messages);

  if (!quotaDisabled && storedUser && quota && quota.remaining <= 0) {
    return respond(
      {
        error: "相談回数を使い切りました。追加100回パック、または上位プランで続けて相談できます。",
        usage: await getUsageSnapshot(storedUser)
      },
      { status: 402 }
    );
  }

  if (!isProductionAiConfigured()) {
    const answer = demoAnswer(body.question, effectiveChart, transits, readerStyle, plan.key, questionIntent);
    if (storedUser && quota) {
      const usage = await persistChatTurnAndQuota({ answer, question: body.question, quota, quotaDisabled, storedUser });
      return respond({ answer, mode: "demo", ...(usage ? { usage } : {}) });
    }
    return respond({ answer, mode: "demo" });
  }

  let answer = "";
  let aiMode: "anthropic" | undefined;
  let aiModel: string | undefined;
  try {
    const result = await generateAstrologyAnswer({
      freeAnswerCount,
      planKey: plan.key,
      periodUsed: quota?.used ?? countPreviousClientUserQuestions(body.messages),
      questionIntent,
      quotaMode: resolveQuotaMode(quota),
      readerStyle,
      system: [
        systemPrompt(readerStyle, plan.key, questionIntent, body.question),
        buildConversationContext(conversationMessages, plan.key),
        `出生図データ:\n${buildChartContext(effectiveChart)}`,
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
      return respond(
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
      return respond(
        {
          code: error.status === 529 ? "ANTHROPIC_OVERLOADED" : error.code,
          error: error.status === 529 ? "今、鑑定が集中していて少しつながりにくくなっています。相談回数は消費していません。少し時間をおいて、もう一度送ってください。" : "鑑定文の生成で一時的な問題が起きました。相談回数は消費していません。少し時間をおいて、もう一度送ってください。"
        },
        { status: error.status === 529 ? 503 : 502 }
      );
    }

    console.warn("AI response failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return respond({ error: "鑑定文の生成で一時的な問題が起きました。相談回数は消費していません。少し時間をおいて、もう一度送ってください。" }, { status: 502 });
  }

  if (storedUser && quota) {
    const usage = await persistChatTurnAndQuota({ answer, question: body.question, quota, quotaDisabled, storedUser });
    if (requiresServerBackedAi && !usage) {
      return respond({ error: "相談履歴を保存できなかったため、鑑定を完了できませんでした。相談回数は消費していません。" }, { status: 503 });
    }
    return respond({ answer, mode: aiMode, model: aiModel, ...(usage ? { usage } : {}) });
  }
  if (requiresServerBackedAi) {
    return respond({ error: "相談履歴を保存できなかったため、鑑定を完了できませんでした。相談回数は消費していません。" }, { status: 503 });
  }
  return respond({ answer, mode: aiMode, model: aiModel });
}

function upsertChatUser(input: { authUser: Awaited<ReturnType<typeof getAuthenticatedRequestUser>>; chart: Chart; clientUserId: string; isMember: boolean }) {
  if (input.authUser?.provider === "line" && input.authUser.lineUserId) {
    return upsertUserForLineChart({
      chart: input.chart,
      clientUserId: input.clientUserId,
      isMember: true,
      lineUserId: input.authUser.lineUserId
    });
  }
  return upsertUserForChart({ chart: input.chart, clientUserId: input.clientUserId, isMember: input.isMember });
}

function resolveEffectiveChart(storedUser: StoredUser | null, fallback: Chart) {
  const birthInput = storedUser ? birthInputFromStoredUser(storedUser) : null;
  return birthInput ? calculateChart(birthInput) : fallback;
}

async function persistChatTurnAndQuota(input: {
  answer: string;
  question: string;
  quota: Awaited<ReturnType<typeof getQuotaState>>;
  quotaDisabled: boolean;
  storedUser: Awaited<ReturnType<typeof upsertUserForChart>>;
}) {
  if (!input.storedUser) return null;
  return safeServerStore("persist chat turn and quota", async () => {
    await insertChatTurn({ answer: input.answer, question: input.question, userId: input.storedUser.id });
    if (input.quotaDisabled) return getUsageSnapshot(input.storedUser);
    const updatedUser = await consumeQuota(input.storedUser, input.quota);
    return getUsageSnapshot(updatedUser);
  });
}

async function safeServerStore<T>(label: string, action: () => Promise<T>) {
  try {
    return await action();
  } catch (error) {
    console.warn(`Server store skipped: ${label}`, { message: error instanceof Error ? error.message : "Unknown error" });
    return null;
  }
}

async function requiredServerStore<T>(label: string, action: () => Promise<T>) {
  try {
    return await action();
  } catch (error) {
    console.warn(`Server store required but failed: ${label}`, { message: error instanceof Error ? error.message : "Unknown error" });
    return null;
  }
}

function countPreviousClientUserQuestions(messages: ChatRequest["messages"]) {
  const currentIncludedCount =
    messages?.filter((message) => message.role === "user" && typeof message.content === "string" && message.content.trim()).length ?? 0;
  return Math.max(0, currentIncludedCount - 1);
}

function resolveQuotaMode(quota: Awaited<ReturnType<typeof getQuotaState>> | null) {
  if (!quota) return "base";
  if (quota.usesFreeBonus) return "free_bonus";
  if (quota.baseRemaining <= 0 && quota.addOnCredits > 0) return "add_on";
  return "base";
}

function buildNonBillableChatAnswer(billing: QuestionBilling, usage: Awaited<ReturnType<typeof getUsageSnapshot>> | null) {
  const usageText = usage ? `\n\n現在の利用状況\nプラン: ${resolvePlan(usage.plan).label}\n残り回数: ${usage.remaining}回` : "";
  const noCount = "\n\nこの確認では相談回数は消費していません。";
  const kind = billing.kind as NonBillableQuestionKind;

  if (kind === "usage") {
    return usage
      ? `現在の利用状況です。\n\nプラン: ${resolvePlan(usage.plan).label}\n残り回数: ${usage.remaining}回${usage.freeBonusRemaining > 0 && usage.plan === "free" ? `\n登録特典: 残り${usage.freeBonusRemaining}回` : ""}${usage.addOnCredits > 0 ? `\n追加分: 残り${usage.addOnCredits}回` : ""}${noCount}`
      : `利用状況を確認するには、登録情報との連携が必要です。登録情報ページから確認できます。\n/account${noCount}`;
  }
  if (kind === "pricing") {
    return `料金やプランは、プランページで確認できます。\n\n通常プラン、プライベートプラン、追加100回パックを用意しています。\n/pricing${usageText}${noCount}`;
  }
  if (kind === "reader") {
    return `占い師タイプは、通常・マイルド・はっきり厳しめ・寄り添い系・辛辣から選べます。\n\n無料プランでは通常、通常プランではマイルドとはっきり厳しめ、プライベートプランでは寄り添い系と辛辣を含む全タイプが使えます。${usageText}${noCount}`;
  }
  if (kind === "line") {
    return `LINEで相談するには、登録情報とLINEをつなぎます。LINE登録の流れで公式アカウントの友だち追加も行えます。\n\n登録情報ページから「LINEで登録・友だち追加」を選んでください。\n/account${usageText}${noCount}`;
  }
  if (kind === "account") {
    return `登録情報、ログイン状態、出生情報、鑑定履歴は登録情報ページで確認できます。\n/account${usageText}${noCount}`;
  }
  if (kind === "legal") {
    return `利用規約、プライバシーポリシー、特定商取引法に基づく表記は各ページで確認できます。\n\n/terms\n/privacy\n/legal/commercial-disclosure${noCount}`;
  }
  if (kind === "menu_consult") {
    return `相談したいことを、そのまま一言で送ってください。\n\n例:\n「今の迷いをどう見ればいい？」\n「この選択をして大丈夫？」\n「最近同じことで悩んでいる」\n\n内容が具体的なほど、あなたの星と今の流れに合わせて読みやすくなります。${usageText}${noCount}`;
  }
  if (kind === "menu_love") {
    return `恋愛について見ていきます。\n\nまず、どの相手・状況に近いですか？\n\n「好きな人がいる」\n「付き合っている人がいる」\n「復縁したい」\n「出会いを見たい」\n「相手の気持ちを知りたい」\n\n相手との関係や、今いちばん知りたいことを添えて送ってください。${usageText}${noCount}`;
  }
  if (kind === "menu_work") {
    return `仕事・人生の流れを見ていきます。\n\n今知りたいことは、どれに近いですか？\n\n「転職するか迷っている」\n「今の仕事を続けるべき？」\n「向いている働き方を知りたい」\n「人間関係を見たい」\n「人生全体の転機を見たい」\n\n近いものをそのまま送るか、今の状況を一言添えてください。${usageText}${noCount}`;
  }
  if (kind === "small_talk") {
    return `ありがとうございます。占いたいことがあれば、そのまま短く送ってください。恋愛、仕事、今日の運勢、今月の流れなど、気になるテーマから読めます。${usageText}${noCount}`;
  }
  if (kind === "off_topic") {
    return `ここでは、星読み・登録情報・使い方に関する内容を扱っています。\n\n医療、法律、投資など専門判断が必要なことは専門家へ相談してください。占いたいテーマがあれば、恋愛・仕事・人生の流れのように聞いてください。${usageText}${noCount}`;
  }
  return `使い方や不具合については、登録情報ページや問い合わせページから確認できます。\n/account\n/contact${usageText}${noCount}`;
}

function buildNonBillableLimitMessage(rateLimit: NonBillableRateLimitResult) {
  const wait = formatRetryAfter(rateLimit.retryAfterSeconds);
  return `確認系のメッセージが短時間に続いているため、一時的に受付を止めています。占い相談の回数は消費していません。${wait ? `${wait}ほど時間をおいて、` : "少し時間をおいて、"}もう一度送ってください。`;
}

function buildWebNonBillableIdentifier(req: Request, userKey?: string | null) {
  if (userKey) return userKey;
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const userAgent = req.headers.get("user-agent")?.trim();
  return [forwardedFor || realIp || "unknown-ip", userAgent || "unknown-agent"].join("|");
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
