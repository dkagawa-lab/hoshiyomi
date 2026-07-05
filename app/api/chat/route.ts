import { NextResponse } from "next/server";
import { Chart, calculateChart, calculateTransits } from "@/lib/astrology";
import { buildChartContext, buildTransitContext, demoAnswer, systemPrompt } from "@/lib/prompt";
import { ReaderStyleKey, resolveReaderStyle } from "@/lib/readerStyles";
import { PlanKey, resolvePlan, usageLimitsDisabled } from "@/lib/plans";
import { classifyQuestionBilling, NonBillableQuestionKind, QuestionBilling } from "@/lib/questionBilling";
import { QuestionIntentKey, resolveQuestionIntent } from "@/lib/questionIntents";
import { buildConsultationMemoryContext, buildConversationContext, generateAstrologyAnswer, isAnthropicApiError, isAnthropicRateLimitError, isProductionAiConfigured, mergeConversationMessages, normalizeChatMessages } from "@/lib/aiRuntime";
import { anonymousSessionCookieName, getAuthenticatedRequestUser, getOrCreateAnonymousRequestUser } from "@/lib/serverAuth";
import { birthInputFromStoredUser, checkNonBillableRateLimit, consumeQuota, countLifetimeUserMessages, getQuotaState, getUsageSnapshot, insertChatTurn, isServerStoreConfigured, listChatMessages, normalizeClientUserId, NonBillableRateLimitResult, StoredUser, updateConsultationMemory, upsertUserForChart, upsertUserForLineChart } from "@/lib/serverStore";

type ChatRequest = {
  chart: Chart;
  question: string;
  language?: "ja" | "en";
  messages?: { role: "user" | "assistant"; content: string }[];
  readerStyle?: ReaderStyleKey;
  plan?: PlanKey;
  questionIntent?: QuestionIntentKey;
  clientUserId?: string;
  clientUsage?: ClientUsageSnapshot;
  isMember?: boolean;
};

type ClientUsageSnapshot = {
  addOnCredits?: number;
  freeBonusRemaining?: number;
  isMember?: boolean;
  plan?: PlanKey;
  remaining?: number;
  unlimited?: boolean;
  used?: number;
};

type DisplayUsageSnapshot = {
  addOnCredits: number;
  freeBonusRemaining: number;
  isMember: boolean;
  plan: PlanKey;
  remaining: number;
  unlimited?: boolean;
  used: number;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  const language = body.language === "en" ? "en" : "ja";
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
    return respond({ error: language === "en" ? "chart and question are required" : "chart and question are required" }, { status: 400 });
  }

  const billing = classifyQuestionBilling(body.question);
  const requestClientUserId = normalizeClientUserId(body.clientUserId);
  const clientUserId = authUser?.clientUserId ?? anonymousUser?.clientUserId ?? (process.env.NODE_ENV === "production" && isServerStoreConfigured() ? null : requestClientUserId);
  const requiresServerBackedAi = billing.countable && isProductionAiConfigured() && process.env.NODE_ENV === "production";
  if (requiresServerBackedAi && !isServerStoreConfigured()) {
    return respond({ error: messageFor(language, "相談回数の確認ができないため、鑑定を開始できません。少し時間をおいてもう一度お試しください。", "We could not verify your reading credits, so the reading cannot start. Please try again shortly.") }, { status: 503 });
  }
  if (requiresServerBackedAi && !clientUserId) {
    return respond({ error: messageFor(language, "お試し相談枠を確認できませんでした。少し時間をおいてもう一度お試しください。", "We could not verify your trial credits. Please try again shortly.") }, { status: 503 });
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
    return respond({ error: messageFor(language, "相談回数の確認ができないため、鑑定を開始できません。少し時間をおいてもう一度お試しください。", "We could not verify your reading credits, so the reading cannot start. Please try again shortly.") }, { status: 503 });
  }
  const plan = resolvePlan(quota?.plan ?? body.plan);
  const quotaDisabled = usageLimitsDisabled();
  if (!billing.countable) {
    const serverUsage = storedUser ? await safeServerStore("read usage for non-billable chat", () => getUsageSnapshot(storedUser)) : null;
    const usage = serverUsage ?? normalizeClientUsageSnapshot(body.clientUsage, body.plan, body.isMember);
    const rateLimit = await checkNonBillableRateLimit({
      identifier: buildWebNonBillableIdentifier(req, storedUser?.id ?? clientUserId),
      kind: billing.kind,
      scope: storedUser ? "web-user" : clientUserId ? "web-client" : "web-anonymous"
    });
    if (!rateLimit.allowed) {
      return respond(
        {
          counted: false,
          error: buildNonBillableLimitMessage(rateLimit, language),
          nonBillableKind: billing.kind,
          nonBillableLimited: true,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
          ...(usage ? { usage } : {})
        },
        { status: 429 }
      );
    }
    return respond({
      answer: buildNonBillableChatAnswer(billing, usage, language),
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
        error: messageFor(language, "相談回数を使い切りました。追加100回パック、または上位プランで続けて相談できます。", "You have used your reading credits. You can continue with the 100-question add-on or an upgraded plan."),
        usage: await getUsageSnapshot(storedUser)
      },
      { status: 402 }
    );
  }

  if (!isProductionAiConfigured()) {
    const answer = demoAnswer(body.question, effectiveChart, transits, readerStyle, plan.key, questionIntent, language);
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
        systemPrompt(readerStyle, plan.key, questionIntent, body.question, language),
        buildConsultationMemoryContext(storedUser?.consultation_memory, plan.key),
        buildConversationContext(conversationMessages, plan.key),
        `${language === "en" ? "Birth chart data" : "出生図データ"}:\n${buildChartContext(effectiveChart, language)}`,
        `${language === "en" ? "Current transit data" : "現在のトランジットデータ"}:\n${buildTransitContext(transits, language)}`
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
          error: buildRateLimitMessage(error.retryAfterSeconds, language),
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
          error: error.status === 529
            ? messageFor(language, "今、鑑定が集中していて少しつながりにくくなっています。相談回数は消費していません。少し時間をおいて、もう一度送ってください。", "Readings are busy right now. Your credit was not used. Please try again shortly.")
            : messageFor(language, "鑑定文の生成で一時的な問題が起きました。相談回数は消費していません。少し時間をおいて、もう一度送ってください。", "A temporary issue occurred while preparing the reading. Your credit was not used. Please try again shortly.")
        },
        { status: error.status === 529 ? 503 : 502 }
      );
    }

    console.warn("AI response failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return respond({ error: messageFor(language, "鑑定文の生成で一時的な問題が起きました。相談回数は消費していません。少し時間をおいて、もう一度送ってください。", "A temporary issue occurred while preparing the reading. Your credit was not used. Please try again shortly.") }, { status: 502 });
  }

  if (storedUser && quota) {
    const usage = await persistChatTurnAndQuota({ answer, question: body.question, quota, quotaDisabled, storedUser });
    if (requiresServerBackedAi && !usage) {
      return respond({ error: messageFor(language, "相談履歴を保存できなかったため、鑑定を完了できませんでした。相談回数は消費していません。", "The reading could not be completed because the conversation history could not be saved. Your credit was not used.") }, { status: 503 });
    }
    return respond({ answer, mode: aiMode, model: aiModel, ...(usage ? { usage } : {}) });
  }
  if (requiresServerBackedAi) {
    return respond({ error: messageFor(language, "相談履歴を保存できなかったため、鑑定を完了できませんでした。相談回数は消費していません。", "The reading could not be completed because the conversation history could not be saved. Your credit was not used.") }, { status: 503 });
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
    const memoryUser = await updateConsultationMemory({ answer: input.answer, question: input.question, user: input.storedUser }).catch((error) => {
      console.warn("Consultation memory update skipped", { message: error instanceof Error ? error.message : "Unknown error" });
      return input.storedUser;
    });
    if (input.quotaDisabled) return getUsageSnapshot(memoryUser);
    const updatedUser = await consumeQuota(memoryUser, input.quota);
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

function buildNonBillableChatAnswer(billing: QuestionBilling, usage: DisplayUsageSnapshot | null, language: "ja" | "en") {
  const english = language === "en";
  const usageText = usage
    ? english
      ? `\n\nCurrent status\nPlan: ${formatUsagePlanLabel(usage, language)}\n${formatUsageRemaining(usage, language)}`
      : `\n\n現在の利用状況\nプラン: ${formatUsagePlanLabel(usage, language)}\n${formatUsageRemaining(usage, language)}`
    : "";
  const noCount = english ? "\n\nThis check did not use a reading credit." : "\n\nこの確認では相談回数は消費していません。";
  const kind = billing.kind as NonBillableQuestionKind;

  if (kind === "usage") {
    if (english) {
      return usage
        ? `Here is your current usage.\n\nPlan: ${formatUsagePlanLabel(usage, language)}\n${formatUsageRemaining(usage, language)}${usage.freeBonusRemaining > 0 && usage.plan === "free" ? `\nRegistration bonus: ${usage.freeBonusRemaining} left` : ""}${usage.addOnCredits > 0 ? `\nAdd-on credits: ${usage.addOnCredits} left` : ""}\n\nChecking credits, prices, or registration does not use a reading credit. Only horoscope readings use credits.`
        : `To check your usage, please connect your account information.\n/account${noCount}`;
    }
    return usage
      ? `現在の利用状況です。\n\nプラン: ${formatUsagePlanLabel(usage, language)}\n${formatUsageRemaining(usage, language)}${usage.freeBonusRemaining > 0 && usage.plan === "free" ? `\n登録特典: 残り${usage.freeBonusRemaining}回` : ""}${usage.addOnCredits > 0 ? `\n追加分: 残り${usage.addOnCredits}回` : ""}\n\n残り回数や料金、登録方法の確認では相談回数は減りません。星を読んで鑑定する内容だけ、相談枠を使います。`
      : `利用状況を確認するには、登録情報との連携が必要です。登録情報ページから確認できます。\n/account${noCount}`;
  }
  if (kind === "pricing") {
    if (english) return `You can view prices and plans on the plan page.\n\nStandard Plan, Private Plan, and the 100-question add-on are available.\n/pricing${usageText}${noCount}`;
    return `料金やプランは、プランページで確認できます。\n\n通常プラン、プライベートプラン、追加100回パックを用意しています。\n/pricing${usageText}${noCount}`;
  }
  if (kind === "reader") {
    if (english) return `Reader styles include Standard, Gentle, Direct, Compassionate, and Sharp.\n\nThe Free Plan includes Standard. The Standard Plan opens Gentle and Direct. The Private Plan opens all styles, including Compassionate and Sharp.${usageText}${noCount}`;
    return `占い師タイプは、通常・マイルド・はっきり厳しめ・寄り添い系・辛辣から選べます。\n\n無料プランでは通常、通常プランではマイルドとはっきり厳しめ、プライベートプランでは寄り添い系と辛辣を含む全タイプが使えます。${usageText}${noCount}`;
  }
  if (kind === "line") {
    if (english) return `To consult through LINE, connect your account with LINE. LINE registration also guides you to add the official account.\n\nOpen Account and choose LINE registration.\n/account${usageText}${noCount}`;
    return `LINEで相談するには、登録情報とLINEをつなぎます。LINE登録を進めると、公式アカウントの友だち追加までできます。\n\n登録情報ページから「LINEで登録・友だち追加」を選んでください。\n/account${usageText}${noCount}`;
  }
  if (kind === "account") {
    if (english) return `You can check your registration, login status, birth data, and star memory on the Account page.\n/account${usageText}${noCount}`;
    return `登録情報、ログイン状態、出生情報、星読みカルテは登録情報ページで確認できます。\n/account${usageText}${noCount}`;
  }
  if (kind === "legal") {
    if (english) return `Terms, privacy policy, and legal disclosure are available here.\n\n/terms\n/privacy\n/legal/commercial-disclosure${noCount}`;
    return `利用規約、プライバシーポリシー、特定商取引法に基づく表記は各ページで確認できます。\n\n/terms\n/privacy\n/legal/commercial-disclosure${noCount}`;
  }
  if (kind === "menu_consult") {
    if (english) return `Send what you want to ask in one sentence.\n\nExamples:\n“What should I understand about this hesitation?”\n“Is this choice right for me?”\n“I keep worrying about the same thing.”\n\nThe more specific the question, the more deeply it can be read through your chart and current timing.${usageText}${noCount}`;
    return `相談したいことを、そのまま一言で送ってください。\n\n例:\n「今の迷いをどう見ればいい？」\n「この選択をして大丈夫？」\n「最近同じことで悩んでいる」\n\n内容が具体的なほど、あなたの星と今の流れに合わせて深く読めます。${usageText}${noCount}`;
  }
  if (kind === "menu_love") {
    if (english) return `Let’s look at love.\n\nWhich situation is closest?\n\n“I have someone I like.”\n“I am in a relationship.”\n“I want reconciliation.”\n“I want to look at new encounters.”\n“I want to understand their feelings.”\n\nSend the relationship and what you most want to know.${usageText}${noCount}`;
    return `恋愛について見ていきます。\n\nまず、どの相手・状況に近いですか？\n\n「好きな人がいる」\n「付き合っている人がいる」\n「復縁したい」\n「出会いを見たい」\n「相手の気持ちを知りたい」\n\n相手との関係や、今いちばん知りたいことを添えて送ってください。${usageText}${noCount}`;
  }
  if (kind === "menu_work") {
    if (english) return `Let’s look at work and life direction.\n\nWhich is closest?\n\n“I am unsure about changing jobs.”\n“Should I stay in my current work?”\n“I want to know my best way of working.”\n“I want to look at work relationships.”\n“I want to see a larger turning point.”\n\nSend the closest one, or add a little context.${usageText}${noCount}`;
    return `仕事や人生の流れを見ていきます。\n\n今知りたいことは、どれに近いですか？\n\n「転職するか迷っている」\n「今の仕事を続けるべき？」\n「向いている働き方を知りたい」\n「人間関係を見たい」\n「人生全体の転機を見たい」\n\n近いものをそのまま送るか、今の状況を一言添えてください。${usageText}${noCount}`;
  }
  if (kind === "small_talk") {
    if (english) return `Thank you. If there is something you want read, send it simply. Love, work, today’s luck, or this month’s flow can all be read through your chart.${usageText}${noCount}`;
    return `ありがとうございます。占いたいことがあれば、そのまま短く送ってください。恋愛、仕事、今日の運勢、今月の流れなど、気になるテーマから読めます。${usageText}${noCount}`;
  }
  if (kind === "off_topic") {
    if (english) return `Here, HOSHIYOMI handles astrology readings, account questions, and usage guidance.\n\nFor medical, legal, or investment decisions, please consult a qualified professional. If you want a reading, ask about love, work, relationships, or life direction.${usageText}${noCount}`;
    return `ここでは、星読み・登録情報・使い方に関する内容を扱っています。\n\n医療、法律、投資など専門判断が必要なことは専門家へ相談してください。占いたいテーマがあれば、恋愛や仕事、人生の流れのように聞いてください。${usageText}${noCount}`;
  }
  if (english) return `You can check usage or contact support from Account and Contact.\n/account\n/contact${usageText}${noCount}`;
  return `使い方や不具合については、登録情報ページや問い合わせページから確認できます。\n/account\n/contact${usageText}${noCount}`;
}

function normalizeClientUsageSnapshot(input: ClientUsageSnapshot | undefined, fallbackPlan: PlanKey | undefined, fallbackIsMember: boolean | undefined): DisplayUsageSnapshot | null {
  if (!input) return null;
  const plan = resolvePlan(input.plan ?? fallbackPlan).key;
  const remaining = coerceNonNegativeInteger(input.remaining);
  if (remaining === null && !input.unlimited) return null;
  return {
    addOnCredits: coerceNonNegativeInteger(input.addOnCredits) ?? 0,
    freeBonusRemaining: coerceNonNegativeInteger(input.freeBonusRemaining) ?? 0,
    isMember: Boolean(input.isMember ?? fallbackIsMember),
    plan,
    remaining: remaining ?? 0,
    unlimited: Boolean(input.unlimited),
    used: coerceNonNegativeInteger(input.used) ?? 0
  };
}

function coerceNonNegativeInteger(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.floor(number));
}

function formatUsagePlanLabel(usage: DisplayUsageSnapshot, language: "ja" | "en") {
  const plan = resolvePlan(usage.plan);
  if (language === "en") {
    if (plan.key === "free" && !usage.isMember) return `Guest trial (${plan.questionLimit} questions)`;
    if (plan.key === "standard") return "Standard Plan";
    if (plan.key === "luxury") return "Private Plan";
    return "Free Plan";
  }
  if (plan.key === "free" && !usage.isMember) return `未登録（${plan.questionLimit}回まで）`;
  return plan.label;
}

function formatUsageRemaining(usage: DisplayUsageSnapshot, language: "ja" | "en") {
  if (usage.unlimited) return language === "en" ? "Development mode: no question limit" : "開発環境: 相談回数の制限なし";
  return language === "en" ? `Remaining credits: ${usage.remaining}` : `残り回数: ${usage.remaining}回`;
}

function buildNonBillableLimitMessage(rateLimit: NonBillableRateLimitResult, language: "ja" | "en") {
  const wait = formatRetryAfter(rateLimit.retryAfterSeconds, language);
  if (language === "en") {
    return `Too many check messages were sent in a short time. No reading credit was used. ${wait ? `Please wait about ${wait} and ` : "Please wait a little and "}try again.`;
  }
  return `確認メッセージが短時間に続いているため、一時的に受付を止めています。占い相談の回数は消費していません。${wait ? `${wait}ほど時間をおいて、` : "少し時間をおいて、"}もう一度送ってください。`;
}

function buildWebNonBillableIdentifier(req: Request, userKey?: string | null) {
  if (userKey) return userKey;
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const userAgent = req.headers.get("user-agent")?.trim();
  return [forwardedFor || realIp || "unknown-ip", userAgent || "unknown-agent"].join("|");
}

function buildRateLimitMessage(retryAfterSeconds?: number, language: "ja" | "en" = "ja") {
  const wait = formatRetryAfter(retryAfterSeconds, language);
  if (language === "en") {
    return `Readings are busy right now. Your credit was not used. ${wait ? `Please wait about ${wait} and ` : "Please wait a little and "}try again.`;
  }
  return `今、鑑定の依頼が集中しています。相談回数は消費していません。${wait ? `${wait}ほど時間をおいて、` : "少し時間をおいて、"}もう一度送ってください。`;
}

function messageFor(language: "ja" | "en", ja: string, en: string) {
  return language === "en" ? en : ja;
}

function formatRetryAfter(seconds?: number, language: "ja" | "en" = "ja") {
  if (!seconds || seconds <= 0) return "";
  if (seconds < 60) return language === "en" ? `${Math.ceil(seconds)} seconds` : `${Math.ceil(seconds)}秒`;
  return language === "en" ? `${Math.ceil(seconds / 60)} minutes` : `${Math.ceil(seconds / 60)}分`;
}
