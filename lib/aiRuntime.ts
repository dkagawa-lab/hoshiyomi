import { PlanKey, resolvePlan } from "@/lib/plans";
import { normalizeAnswerText } from "@/lib/answerText";

export type ChatRuntimeMessage = {
  role: "user" | "assistant";
  content: string;
};

type GenerateAnswerInput = {
  freeAnswerCount?: number;
  messages: ChatRuntimeMessage[];
  planKey: PlanKey;
  system: string;
};

type GenerateAnswerResult = {
  answer: string;
  mode: "anthropic";
  model: string;
};

type AnthropicMessageResponse = {
  content?: { text?: string }[];
  stop_reason?: string | null;
};

const defaultAnthropicModel = "claude-sonnet-4-6";
const defaultFreeAfterTrialModel = "claude-haiku-4-5-20251001";
export const highPerformanceFreeTrialLimit = 10;

export type AnthropicRateLimitInfo = {
  inputTokensRemaining?: number;
  inputTokensReset?: string | null;
  outputTokensRemaining?: number;
  outputTokensReset?: string | null;
  requestsRemaining?: number;
  requestsReset?: string | null;
  retryAfterSeconds?: number;
  tokensRemaining?: number;
  tokensReset?: string | null;
};

export class AnthropicRateLimitError extends Error {
  code = "ANTHROPIC_RATE_LIMIT" as const;
  rateLimit: AnthropicRateLimitInfo;
  retryAfterSeconds?: number;
  status = 429;

  constructor(message: string, rateLimit: AnthropicRateLimitInfo) {
    super(message);
    this.name = "AnthropicRateLimitError";
    this.rateLimit = rateLimit;
    this.retryAfterSeconds = rateLimit.retryAfterSeconds;
  }
}

export class AnthropicApiError extends Error {
  code = "ANTHROPIC_API_ERROR" as const;
  rateLimit: AnthropicRateLimitInfo;
  status: number;

  constructor(message: string, status: number, rateLimit: AnthropicRateLimitInfo) {
    super(message);
    this.name = "AnthropicApiError";
    this.status = status;
    this.rateLimit = rateLimit;
  }
}

export function isProductionAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function resolveAnthropicModel(planKey: PlanKey, freeAnswerCount = 0) {
  if (planKey === "free") {
    if (freeAnswerCount < highPerformanceFreeTrialLimit) {
      return process.env.ANTHROPIC_MODEL_FREE_TRIAL || process.env.ANTHROPIC_MODEL_STANDARD || process.env.ANTHROPIC_MODEL || defaultAnthropicModel;
    }
    return process.env.ANTHROPIC_MODEL_FREE_AFTER_TRIAL || process.env.ANTHROPIC_MODEL_FREE || process.env.ANTHROPIC_MODEL || defaultFreeAfterTrialModel;
  }
  const planSpecificKey = `ANTHROPIC_MODEL_${planKey.toUpperCase()}`;
  return process.env[planSpecificKey] || process.env.ANTHROPIC_MODEL || defaultAnthropicModel;
}

export function isAnthropicRateLimitError(error: unknown): error is AnthropicRateLimitError {
  return error instanceof AnthropicRateLimitError;
}

export function isAnthropicApiError(error: unknown): error is AnthropicApiError {
  return error instanceof AnthropicApiError;
}

export function normalizeChatMessages(messages: ChatRuntimeMessage[] | undefined, question: string, planKey: PlanKey) {
  const limit = planKey === "luxury" ? 28 : planKey === "standard" ? 18 : 8;
  const normalized: ChatRuntimeMessage[] = [];
  for (const message of messages || []) {
    const content = sanitizeMessageContent(message.content);
    if (!content || (message.role !== "user" && message.role !== "assistant")) continue;
    const previous = normalized[normalized.length - 1];
    if (previous?.role === message.role) {
      previous.content = sanitizeMessageContent(`${previous.content}\n${content}`);
    } else {
      normalized.push({ role: message.role, content });
    }
  }

  const latestQuestion = sanitizeMessageContent(question);
  const last = normalized[normalized.length - 1];
  if (latestQuestion && !(last?.role === "user" && last.content === latestQuestion)) {
    normalized.push({ role: "user", content: latestQuestion });
  }

  return normalized.slice(-limit);
}

export function mergeConversationMessages(serverMessages: ChatRuntimeMessage[], clientMessages: ChatRuntimeMessage[], question: string, planKey: PlanKey) {
  const merged = [...serverMessages, ...clientMessages];
  const deduped: ChatRuntimeMessage[] = [];
  for (const message of merged) {
    const content = sanitizeMessageContent(message.content);
    if (!content) continue;
    const previous = deduped[deduped.length - 1];
    if (previous?.role === message.role && previous.content === content) continue;
    deduped.push({ role: message.role, content });
  }
  return normalizeChatMessages(deduped, question, planKey);
}

export function buildConversationContext(messages: ChatRuntimeMessage[], planKey: PlanKey) {
  const plan = resolvePlan(planKey);
  const historyLimit = plan.key === "luxury" ? 12 : plan.key === "standard" ? 8 : 4;
  const history = messages.slice(0, -1).slice(-historyLimit);
  const latest = messages[messages.length - 1]?.content ?? "";
  const historyText = history
    .map((message) => `${message.role === "user" ? "相談者" : "鑑定士"}: ${message.content}`)
    .join("\n");

  return [
    "会話文脈:",
    latest ? `今回の質問: ${latest}` : "",
    historyText ? `直近の相談履歴:\n${historyText}` : "直近の相談履歴: なし",
    plan.key === "free"
      ? "無料プランでは、直近の質問に直接答えつつ、過去文脈は重く扱いすぎない。"
      : "有料プランでは、過去の相談で繰り返し出ている不安、願い、判断の癖を拾い、今回の答えに自然に接続する。",
    plan.key === "luxury"
      ? "プライベートプランでは、相談者が避けている前提、矛盾、言葉にしていない期待まで丁寧に扱う。ただし不安を煽らない。"
      : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateAstrologyAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
  const plan = resolvePlan(input.planKey);
  const model = resolveAnthropicModel(plan.key, input.freeAnswerCount);
  const temperature = resolveTemperature(plan.key);
  const data = await requestAnthropicMessage({
    maxTokens: plan.maxTokens,
    messages: input.messages,
    model,
    system: input.system,
    temperature
  });

  let rawAnswer = extractAnthropicText(data);
  if (data.stop_reason === "max_tokens" && rawAnswer) {
    const continuation = await requestAnthropicMessage({
      maxTokens: Math.min(1800, Math.max(1000, Math.floor(plan.maxTokens * 0.45))),
      messages: [
        ...input.messages,
        { role: "assistant", content: rawAnswer },
        {
          role: "user",
          content:
            "先ほどの鑑定文が途中で終わらないよう、同じ文脈で自然に続きを書いて最後まで締めてください。新しい挨拶、謝罪、Markdown記号は不要です。"
        }
      ],
      model,
      system: input.system,
      temperature
    });
    const continuationText = extractAnthropicText(continuation);
    rawAnswer = continuationText ? `${rawAnswer}\n\n${continuationText}` : closeTruncatedAnswer(rawAnswer);
    if (continuation.stop_reason === "max_tokens") rawAnswer = closeTruncatedAnswer(rawAnswer);
  }

  const answer = normalizeGeneratedAnswer(rawAnswer);
  if (!answer) throw new Error("AI response was empty");
  return { answer, mode: "anthropic", model };
}

async function requestAnthropicMessage(input: {
  maxTokens: number;
  messages: ChatRuntimeMessage[];
  model: string;
  system: string;
  temperature: number;
}): Promise<AnthropicMessageResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: input.model,
      max_tokens: input.maxTokens,
      temperature: input.temperature,
      system: input.system,
      messages: input.messages
    })
  });

  if (!response.ok) {
    const rateLimit = readAnthropicRateLimitHeaders(response.headers);
    const apiMessage = extractAnthropicApiMessage(await response.text());
    if (response.status === 429) {
      throw new AnthropicRateLimitError(apiMessage || "Anthropic rate limit exceeded", rateLimit);
    }
    throw new AnthropicApiError(apiMessage || `Anthropic API failed with status ${response.status}`, response.status, rateLimit);
  }

  return (await response.json()) as AnthropicMessageResponse;
}

function extractAnthropicText(data: AnthropicMessageResponse) {
  return data.content?.map((part) => part.text).filter(Boolean).join("\n").trim() || "";
}

function readAnthropicRateLimitHeaders(headers: Headers): AnthropicRateLimitInfo {
  return {
    inputTokensRemaining: readNumberHeader(headers, "anthropic-ratelimit-input-tokens-remaining"),
    inputTokensReset: headers.get("anthropic-ratelimit-input-tokens-reset"),
    outputTokensRemaining: readNumberHeader(headers, "anthropic-ratelimit-output-tokens-remaining"),
    outputTokensReset: headers.get("anthropic-ratelimit-output-tokens-reset"),
    requestsRemaining: readNumberHeader(headers, "anthropic-ratelimit-requests-remaining"),
    requestsReset: headers.get("anthropic-ratelimit-requests-reset"),
    retryAfterSeconds: readNumberHeader(headers, "retry-after"),
    tokensRemaining: readNumberHeader(headers, "anthropic-ratelimit-tokens-remaining"),
    tokensReset: headers.get("anthropic-ratelimit-tokens-reset")
  };
}

function readNumberHeader(headers: Headers, name: string) {
  const value = headers.get(name);
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractAnthropicApiMessage(body: string) {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return parsed.error?.message || "";
  } catch {
    return body.slice(0, 300);
  }
}

function resolveTemperature(planKey: PlanKey) {
  if (planKey === "luxury") return 0.78;
  if (planKey === "standard") return 0.72;
  return 0.66;
}

function sanitizeMessageContent(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 2400);
}

function normalizeGeneratedAnswer(value: string) {
  return normalizeAnswerText(value);
}

function closeTruncatedAnswer(value: string) {
  const trimmed = value.trim();
  const punctuation = ["。", "！", "？", "\n"];
  const lastBoundary = Math.max(...punctuation.map((mark) => trimmed.lastIndexOf(mark)));
  const base = lastBoundary > trimmed.length * 0.65 ? trimmed.slice(0, lastBoundary + 1).trim() : trimmed.replace(/[、,]\s*$/, "。");
  return `${base}\n\nここでいったん区切ります。続けて聞くなら「続きを読んで」と送ってください。同じ星の文脈のまま、残りの可能性まで深く見ます。`;
}
