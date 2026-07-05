import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { calculateChart, calculateTransits } from "@/lib/astrology";
import type { BirthInput } from "@/lib/astrology";
import { japanLocations } from "@/lib/japanLocations";
import type { Municipality } from "@/lib/japanLocations";
import { municipalityReadings } from "@/lib/municipalityReadings.generated";
import { buildChartContext, buildTransitContext, demoAnswer, systemPrompt } from "@/lib/prompt";
import { canUseReaderStyle, resolvePlan, usageLimitsDisabled } from "@/lib/plans";
import { classifyQuestionBilling, NonBillableQuestionKind, QuestionBilling } from "@/lib/questionBilling";
import { ReaderStyleKey, resolveReaderStyle } from "@/lib/readerStyles";
import { resolveQuestionIntent } from "@/lib/questionIntents";
import { buildConversationContext, generateAstrologyAnswer, isAnthropicApiError, isAnthropicRateLimitError, isProductionAiConfigured, mergeConversationMessages, normalizeChatMessages } from "@/lib/aiRuntime";
import {
  birthInputFromStoredUser,
  checkNonBillableRateLimit,
  consumeQuota,
  countLifetimeUserMessages,
  deleteLineBirthRegistrationSession,
  getLineBirthRegistrationSession,
  getQuotaState,
  getUsageSnapshot,
  getUserByLineUserId,
  insertChatTurn,
  isServerStoreConfigured,
  LineBirthPlaceCandidate,
  LineBirthRegistrationPayload,
  LineBirthRegistrationSession,
  listChatMessages,
  NonBillableRateLimitResult,
  registerLineUser,
  StoredUser,
  upsertLineBirthRegistrationSession,
  upsertUserForLineChart,
  UsageSnapshot
} from "@/lib/serverStore";
import { worldLocations } from "@/lib/worldLocations";
import type { WorldCity } from "@/lib/worldLocations";

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
    await safeLineStore("register line follower", () => registerLineUser({ clientUserId: lineClientUserId(lineUserId), lineUserId }));
    await replyLineText(replyToken, [
      "HOSHIYOMIを追加してくれてありがとうございます。\n\nこのトーク画面でも星を登録できます。生年月日、出生時刻、出生地を順番に聞いていきます。\n\n始める場合は「星を登録」と送ってください。登録中は相談回数を消費しません。"
    ]);
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text") return;
  const question = normalizeLineQuestion(event.message.text);
  if (!question) return;
  const billing = classifyQuestionBilling(question);

  let user = await getUserByLineUserId(lineUserId);
  const activeBirthRegistration = await safeLineStore("read line birth registration", () => getLineBirthRegistrationSession(lineUserId));
  if (activeBirthRegistration || shouldStartLineBirthRegistration(question, user, billing)) {
    if (!user) {
      user = await safeLineStore("register line user for birth registration", () => registerLineUser({ clientUserId: lineClientUserId(lineUserId), lineUserId }));
    }
    await handleLineBirthRegistration({ lineUserId, question, replyToken, session: activeBirthRegistration, user });
    return;
  }

  if (!user) {
    if (!billing.countable) {
      const rateLimit = await checkNonBillableRateLimit({
        identifier: lineUserId,
        kind: billing.kind,
        scope: "line-unlinked"
      });
      if (!rateLimit.allowed) {
        await replyLineText(replyToken, [buildNonBillableLineLimitReply(rateLimit)]);
        return;
      }
      await replyLineText(replyToken, [buildNonBillableLineReply(billing, null)]);
      return;
    }
    await startLineBirthRegistration(replyToken, lineUserId);
    return;
  }

  if (!billing.countable) {
    const rateLimit = await checkNonBillableRateLimit({
      identifier: user.id,
      kind: billing.kind,
      scope: "line-user"
    });
    if (!rateLimit.allowed) {
      await replyLineText(replyToken, [buildNonBillableLineLimitReply(rateLimit)]);
      return;
    }
    await replyLineText(replyToken, [buildNonBillableLineReply(billing, await getUsageSnapshot(user))]);
    return;
  }

  const birth = birthInputFromStoredUser(user);
  if (!birth) {
    await startLineBirthRegistration(replyToken, lineUserId);
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
        periodUsed: quota.used,
        questionIntent: intent,
        quotaMode: resolveLineQuotaMode(quota),
        readerStyle,
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

type LineBirthRegistrationInput = {
  lineUserId: string;
  question: string;
  replyToken: string;
  session: LineBirthRegistrationSession | null;
  user: StoredUser | null;
};

type ParsedBirthTime = { ok: true; value: string } | { ok: false };

type RemoteLocationResult = {
  country?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  region?: string;
  subtitle?: string;
};

type RemoteLocationResponse = {
  results?: RemoteLocationResult[];
};

const japanesePlaceCollator = new Intl.Collator("ja-JP", { numeric: true, sensitivity: "base", usage: "sort" });
const englishPlaceCollator = new Intl.Collator("en-US", { numeric: true, sensitivity: "base", usage: "sort" });

function shouldStartLineBirthRegistration(question: string, user: StoredUser | null, billing: QuestionBilling) {
  if (isLineBirthRegistrationIntent(question)) return true;
  if (!billing.countable) return false;
  if (!user) return true;
  return !birthInputFromStoredUser(user);
}

async function handleLineBirthRegistration(input: LineBirthRegistrationInput) {
  if (isLineBirthRegistrationCancel(input.question)) {
    await safeLineStore("cancel line birth registration", () => deleteLineBirthRegistrationSession(input.lineUserId));
    await replyLineText(input.replyToken, [
      `星の登録を中止しました。\n\nもう一度始める場合は「星を登録」と送ってください。この操作では相談回数を消費していません。`
    ]);
    return;
  }

  if (!input.session || isLineBirthRegistrationRestart(input.question)) {
    await startLineBirthRegistration(input.replyToken, input.lineUserId, input.user, input.session ? "登録を最初からやり直します。" : undefined);
    return;
  }

  const payload = input.session.payload ?? {};
  if (input.session.step === "date") {
    const birthDate = parseLineBirthDate(input.question);
    if (!birthDate) {
      await replyLineText(input.replyToken, [
        `生年月日をうまく読み取れませんでした。\n\n例のように送ってください。\n1989-05-25\n1989/5/25\n1989年5月25日\n\n登録中は相談回数を消費していません。`
      ]);
      return;
    }
    const saved = await saveLineBirthRegistrationStep(input.replyToken, input.lineUserId, "time", { ...payload, birthDate });
    if (!saved) return;
    await replyLineText(input.replyToken, [
      `生年月日を受け取りました。\n\n次に、出生時刻を24時間表記で送ってください。\n例: 14:30 / 9時05分\n\nわからない場合は「不明」と送ってください。`
    ]);
    return;
  }

  if (input.session.step === "time") {
    const birthTime = parseLineBirthTime(input.question);
    if (!birthTime.ok) {
      await replyLineText(input.replyToken, [
        `出生時刻をうまく読み取れませんでした。\n\n例: 14:30 / 9時05分\nわからない場合は「不明」と送ってください。\n\n登録中は相談回数を消費していません。`
      ]);
      return;
    }
    const saved = await saveLineBirthRegistrationStep(input.replyToken, input.lineUserId, "place", { ...payload, birthTime: birthTime.value });
    if (!saved) return;
    await replyLineText(input.replyToken, [
      `出生時刻を受け取りました。\n\n最後に、出生地の市区町村を送ってください。\n例: 東京都 町田市 / 大阪府 大阪市 / New York\n\n都道府県だけだと星の位置が粗くなるため、市区町村まで送ってください。`
    ]);
    return;
  }

  if (input.session.step === "place") {
    const selectedCandidate = pickLineBirthPlaceCandidate(input.question, payload.candidates);
    if (selectedCandidate) {
      await confirmLineBirthPlace(input.replyToken, input.lineUserId, payload, selectedCandidate);
      return;
    }

    if (isJapanPrefectureOnly(input.question)) {
      const examples = buildPrefectureCityExamples(input.question);
      await replyLineText(input.replyToken, [
        `都道府県までは受け取れました。\n\n出生地は市区町村まで必要です。\n${examples}\n\nもう一度、市区町村まで入れて送ってください。`
      ]);
      return;
    }

    const candidates = await buildLineBirthPlaceCandidates(input.question);
    if (candidates.length === 0) {
      await replyLineText(input.replyToken, [
        `出生地を見つけられませんでした。\n\n市区町村まで入れて、もう一度送ってください。\n例: 東京都 町田市 / 京都府 京都市 / Fukuoka / London\n\n候補が出ない場合は「緯度,経度 市区町村名」の形でも登録できます。\n例: 35.5466,139.4386 町田市`
      ]);
      return;
    }
    if (candidates.length === 1) {
      await confirmLineBirthPlace(input.replyToken, input.lineUserId, payload, candidates[0]);
      return;
    }

    await saveLineBirthRegistrationStep(input.replyToken, input.lineUserId, "place", { ...payload, candidates });
    await replyLineText(input.replyToken, [
      `候補が複数あります。出生地に近いものを番号で送ってください。\n\n${candidates.map((candidate, index) => `${index + 1}. ${candidate.label}`).join("\n")}\n\n例: 1\n\n登録中は相談回数を消費していません。`
    ]);
    return;
  }

  if (input.session.step === "confirm") {
    if (isLineBirthRegistrationReject(input.question)) {
      await startLineBirthRegistration(input.replyToken, input.lineUserId, input.user, "内容を修正します。最初から登録し直してください。");
      return;
    }
    if (!isLineBirthRegistrationApprove(input.question)) {
      await replyLineText(input.replyToken, [
        `${buildLineBirthRegistrationSummary(payload)}\n\nこの内容で登録する場合は「はい」、修正する場合は「修正」と送ってください。\n\n登録中は相談回数を消費していません。`
      ]);
      return;
    }

    const birth = buildBirthInputFromLinePayload(payload, input.user);
    if (!birth) {
      await startLineBirthRegistration(input.replyToken, input.lineUserId, input.user, "登録内容が不足していました。もう一度最初から確認します。");
      return;
    }

    const saveResult = await safeLineStoreResult("save line birth chart", () =>
      upsertUserForLineChart({
        chart: calculateChart(birth),
        clientUserId: lineClientUserId(input.lineUserId),
        isMember: true,
        lineUserId: input.lineUserId
      })
    );
    if (!saveResult.ok) {
      await replyLineText(input.replyToken, [buildLineBirthRegistrationUnavailableReply()]);
      return;
    }
    await safeLineStore("finish line birth registration", () => deleteLineBirthRegistrationSession(input.lineUserId));
    await replyLineText(input.replyToken, [
      `星の登録が完了しました。\n\nここからは、この星の文脈をもとにLINEで相談できます。\n登録中のやりとりでは相談回数を消費していません。\n\n最初に送ってくれた相談内容は、登録を始めるために使っています。あらためて、占いたい内容をもう一度送ってください。\n例: 今日の運勢を占って / 恋愛について見て / 仕事の流れを知りたい`
    ]);
  }
}

async function startLineBirthRegistration(replyToken: string, lineUserId: string, user?: StoredUser | null, prefix?: string) {
  const saved = await saveLineBirthRegistrationStep(replyToken, lineUserId, "date", {});
  if (!saved) return;
  const intro = prefix ? `${prefix}\n\n` : "";
  const registeredText = user ? "" : "LINEのアカウントを登録用に準備しました。\n\n";
  await replyLineText(replyToken, [
    `${intro}${registeredText}このトーク画面で、あなたの星を登録できます。\n\nまず、生年月日を送ってください。\n例: 1989-05-25\n例: 1989年5月25日\n\nこの登録中は相談回数を消費しません。中止する場合は「キャンセル」と送ってください。`
  ]);
}

async function saveLineBirthRegistrationStep(
  replyToken: string,
  lineUserId: string,
  step: LineBirthRegistrationSession["step"],
  payload: LineBirthRegistrationPayload
) {
  const result = await safeLineStoreResult("save line birth registration", () => upsertLineBirthRegistrationSession({ lineUserId, payload, step }));
  if (!result.ok) {
    await replyLineText(replyToken, [buildLineBirthRegistrationUnavailableReply()]);
    return null;
  }
  return result.value;
}

async function confirmLineBirthPlace(replyToken: string, lineUserId: string, payload: LineBirthRegistrationPayload, candidate: LineBirthPlaceCandidate) {
  const nextPayload: LineBirthRegistrationPayload = {
    ...payload,
    birthCity: candidate.label,
    candidates: undefined,
    latitude: candidate.latitude,
    longitude: candidate.longitude
  };
  const saved = await saveLineBirthRegistrationStep(replyToken, lineUserId, "confirm", nextPayload);
  if (!saved) return;
  await replyLineText(replyToken, [
    `${buildLineBirthRegistrationSummary(nextPayload)}\n\nこの内容で星を登録しますか？\n「はい」で登録します。\n修正する場合は「修正」と送ってください。`
  ]);
}

function buildLineBirthRegistrationSummary(payload: LineBirthRegistrationPayload) {
  return [
    "登録内容の確認",
    "",
    `生年月日: ${payload.birthDate || "未入力"}`,
    `出生時刻: ${payload.birthTime ? payload.birthTime : "不明"}`,
    `出生地: ${payload.birthCity || "未入力"}`
  ].join("\n");
}

function buildBirthInputFromLinePayload(payload: LineBirthRegistrationPayload, user: StoredUser | null): BirthInput | null {
  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  if (!payload.birthDate || !payload.birthCity || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    city: payload.birthCity,
    date: payload.birthDate,
    gender: user?.gender || undefined,
    latitude,
    longitude,
    name: user?.name || "あなた",
    romanticInterest: user?.romantic_interest || undefined,
    time: payload.birthTime || ""
  };
}

function parseLineBirthDate(value: string) {
  const normalized = toHalfWidthDigits(value)
    .replace(/[年月./]/g, "-")
    .replace(/[日\s]/g, "")
    .replace(/--+/g, "-")
    .trim();
  const compact = normalized.match(/^(\d{4})(\d{2})(\d{2})$/);
  const dashed = compact ? compact.slice(1, 4) : normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)?.slice(1, 4);
  if (!dashed) return null;
  const [yearText, monthText, dayText] = dashed;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1900 || year > 2100) return null;
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const dateText = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (dateText > currentJstDateString()) return null;
  return dateText;
}

function parseLineBirthTime(value: string): ParsedBirthTime {
  const normalized = toHalfWidthDigits(value).trim().toLowerCase();
  if (/^(不明|わからない|分からない|不詳|なし|無し|未入力|スキップ|skip|unknown)$/.test(normalized)) return { ok: true, value: "" };
  const colon = normalized.match(/^(\d{1,2}):(\d{1,2})$/);
  const japanese = normalized.match(/^(\d{1,2})時(?:(\d{1,2})分?)?$/);
  const parts = colon ? [colon[1], colon[2]] : japanese ? [japanese[1], japanese[2] ?? "0"] : null;
  if (!parts) return { ok: false };
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return { ok: false };
  return { ok: true, value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` };
}

async function buildLineBirthPlaceCandidates(query: string) {
  const manual = parseManualBirthPlace(query);
  if (manual) return [manual];
  const localMatches = [...buildJapanBirthPlaceCandidates(query), ...buildWorldBirthPlaceCandidates(query)];
  const remoteMatches = localMatches.some((candidate) => normalizePlaceSearchText(candidate.label) === normalizePlaceSearchText(query))
    ? []
    : await fetchRemoteBirthPlaceCandidates(query);
  return mergeBirthPlaceCandidates([...localMatches, ...remoteMatches]).slice(0, 6);
}

function parseManualBirthPlace(query: string): LineBirthPlaceCandidate | null {
  const normalized = toHalfWidthDigits(query).trim();
  const matched = normalized.match(/(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)(?:\s+(.+))?/);
  if (!matched) return null;
  const latitude = Number(matched[1]);
  const longitude = Number(matched[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const label = (matched[3] || "指定した出生地").trim();
  return { city: label, label, latitude, longitude };
}

function buildJapanBirthPlaceCandidates(query: string) {
  const normalizedQuery = normalizePlaceSearchText(query);
  if (!normalizedQuery || isJapanPrefectureOnly(query)) return [];
  const matches = japanLocations.flatMap((location) =>
    location.municipalities
      .map((municipality): (LineBirthPlaceCandidate & { score: number }) | null => {
        const label = `${location.prefecture} ${municipality.name}`;
        const searchable = normalizePlaceSearchText(`${label} ${municipalityReading(location.prefecture, municipality)}`);
        const municipalityText = normalizePlaceSearchText(municipality.name);
        const prefectureText = normalizePlaceSearchText(location.prefecture);
        let score = 99;
        if (searchable === normalizedQuery || municipalityText === normalizedQuery) score = 0;
        else if (searchable.startsWith(normalizedQuery) || municipalityText.startsWith(normalizedQuery)) score = 1;
        else if (searchable.includes(normalizedQuery) || municipalityText.includes(normalizedQuery)) score = 2;
        else if (prefectureText && normalizedQuery.includes(prefectureText) && searchable.includes(normalizedQuery.replace(prefectureText, ""))) score = 3;
        else if (prefectureText.includes(normalizedQuery)) score = 8;
        return score < 99 ? { city: municipality.name, label, latitude: municipality.latitude, longitude: municipality.longitude, score } : null;
      })
      .filter((match): match is LineBirthPlaceCandidate & { score: number } => Boolean(match))
  );
  return matches
    .sort((a, b) => a.score - b.score || japanesePlaceCollator.compare(municipalityReading(labelPrefecture(a.label), { name: a.city, latitude: a.latitude, longitude: a.longitude }), municipalityReading(labelPrefecture(b.label), { name: b.city, latitude: b.latitude, longitude: b.longitude })))
    .slice(0, 8)
    .map(({ score, ...candidate }) => candidate);
}

function buildWorldBirthPlaceCandidates(query: string) {
  const normalizedQuery = normalizePlaceSearchText(query);
  if (!normalizedQuery) return [];
  const matches = worldLocations.flatMap((location) =>
    location.cities
      .map((city): (LineBirthPlaceCandidate & { score: number }) | null => {
        const label = formatWorldCandidateLabel(location.country, city);
        const aliasText = (city.aliases ?? []).join(" ");
        const searchable = normalizePlaceSearchText(`${city.name} ${city.region ?? ""} ${location.country} ${aliasText} ${label}`);
        const cityText = normalizePlaceSearchText(city.name);
        const aliases = (city.aliases ?? []).map(normalizePlaceSearchText);
        let score = 99;
        if (cityText === normalizedQuery || aliases.includes(normalizedQuery) || searchable === normalizedQuery) score = 0;
        else if (cityText.startsWith(normalizedQuery) || aliases.some((alias) => alias.startsWith(normalizedQuery))) score = 1;
        else if (searchable.includes(normalizedQuery)) score = 4;
        return score < 99 ? { city: city.name, label, latitude: city.latitude, longitude: city.longitude, score } : null;
      })
      .filter((match): match is LineBirthPlaceCandidate & { score: number } => Boolean(match))
  );
  return matches
    .sort((a, b) => a.score - b.score || englishPlaceCollator.compare(a.label, b.label))
    .slice(0, 8)
    .map(({ score, ...candidate }) => candidate);
}

async function fetchRemoteBirthPlaceCandidates(query: string) {
  const cleaned = query.replace(/\s+/g, " ").trim().slice(0, 80);
  if (cleaned.length < 2) return [];
  const searchUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  searchUrl.searchParams.set("name", cleaned);
  searchUrl.searchParams.set("count", "8");
  searchUrl.searchParams.set("language", "en");
  searchUrl.searchParams.set("format", "json");
  try {
    const response = await fetch(searchUrl, { headers: { accept: "application/json" }, cache: "no-store" });
    if (!response.ok) return [];
    const data = (await response.json()) as RemoteLocationResponse;
    return (data.results ?? [])
      .filter((item) => typeof item.name === "string" && typeof item.country === "string" && typeof item.latitude === "number" && typeof item.longitude === "number")
      .map((item): LineBirthPlaceCandidate => {
        const label = `${item.name}, ${item.country}`;
        return {
          city: item.name || label,
          label,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude)
        };
      });
  } catch {
    return [];
  }
}

function pickLineBirthPlaceCandidate(question: string, candidates?: LineBirthPlaceCandidate[]) {
  if (!candidates?.length) return null;
  const normalized = toHalfWidthDigits(question).trim();
  const number = Number(normalized);
  if (Number.isInteger(number) && number >= 1 && number <= candidates.length) return candidates[number - 1];
  const text = normalizePlaceSearchText(normalized);
  return candidates.find((candidate) => normalizePlaceSearchText(candidate.label) === text || normalizePlaceSearchText(candidate.city) === text) ?? null;
}

function mergeBirthPlaceCandidates(candidates: LineBirthPlaceCandidate[]) {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = `${normalizePlaceSearchText(candidate.label)}|${candidate.latitude.toFixed(3)}|${candidate.longitude.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isJapanPrefectureOnly(value: string) {
  const normalized = normalizePlaceSearchText(value);
  return japanLocations.some((location) => normalizePlaceSearchText(location.prefecture) === normalized);
}

function buildPrefectureCityExamples(value: string) {
  const normalized = normalizePlaceSearchText(value);
  const location = japanLocations.find((item) => normalizePlaceSearchText(item.prefecture) === normalized);
  const examples = (location?.municipalities ?? []).slice(0, 2);
  if (!location || examples.length === 0) return "例: 東京都 町田市\n例: 大阪府 大阪市";
  return examples.map((municipality) => `例: ${location.prefecture} ${municipality.name}`).join("\n");
}

function isLineBirthRegistrationIntent(question: string) {
  return /(星|出生|生年月日|ホロスコープ|プロフィール).*(登録|確認|変更|修正)|登録したい|星を登録|星の登録/.test(question);
}

function isLineBirthRegistrationRestart(question: string) {
  return /^(やり直し|最初から|リセット|修正)$/.test(question.trim());
}

function isLineBirthRegistrationCancel(question: string) {
  return /^(キャンセル|中止|やめる|登録しない)$/.test(question.trim());
}

function isLineBirthRegistrationApprove(question: string) {
  return /^(はい|ok|OK|オーケー|大丈夫|登録|これで|お願いします|よい|良い)$/.test(question.trim());
}

function isLineBirthRegistrationReject(question: string) {
  return /^(いいえ|違う|修正|やり直し|最初から)$/.test(question.trim());
}

function buildLineBirthRegistrationUnavailableReply() {
  return `LINE内で星を登録する準備が一時的に整っていません。\n\n相談回数は消費していません。少し時間をおいて「星を登録」と送るか、Webの星の登録ページから登録してください。\n${appUrl("/#app")}`;
}

function lineClientUserId(lineUserId: string) {
  return `line:${lineUserId}`;
}

function normalizePlaceSearchText(value: string) {
  return toHalfWidthDigits(value).replace(/\s+/g, "").replace(/[　,，]/g, "").trim().toLowerCase();
}

function toHalfWidthDigits(value: string) {
  return value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
}

function currentJstDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric"
  }).format(new Date());
}

function municipalityReading(prefecture: string, municipality: Municipality) {
  return municipalityReadings[`${prefecture}|${municipality.name}`] ?? municipality.name;
}

function labelPrefecture(label: string) {
  return label.split(/\s+/)[0] || "";
}

function formatWorldCandidateLabel(country: string, city: WorldCity) {
  return city.region ? `${city.name}, ${city.region}, ${country}` : `${city.name}, ${country}`;
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
    return `LINEでは、登録済みの星と鑑定履歴を引き継いで相談できます。\n\nまだ星を登録していない場合は、このトークで「星を登録」と送ってください。生年月日、出生時刻、出生地を順番に聞いていきます。\n\n連携状態や登録情報はWebの登録情報ページでも確認できます。\n${appUrl("/account")}${usageText}${noCount}`;
  }
  if (kind === "account") {
    return `登録情報、ログイン状態、出生情報、鑑定履歴はWebの登録情報ページで確認できます。\n\n出生情報だけなら、LINEで「星を登録」と送ってこのまま登録することもできます。\n${appUrl("/account")}${usageText}${noCount}`;
  }
  if (kind === "legal") {
    return `利用規約、プライバシーポリシー、特定商取引法に基づく表記はこちらから確認できます。\n${appUrl("/terms")}\n${appUrl("/privacy")}\n${appUrl("/legal/commercial-disclosure")}${noCount}`;
  }
  if (kind === "menu_consult") {
    return `相談したいことを、そのまま一言で送ってください。\n\n例:\n「今の迷いをどう見ればいい？」\n「この選択をして大丈夫？」\n「最近同じことで悩んでいる」\n\n内容が具体的なほど、あなたの星と今の流れに合わせて深く読めます。${usageText}${noCount}`;
  }
  if (kind === "menu_love") {
    return `恋愛について見ていきます。\n\nまず、どの相手・状況に近いですか？\n\n「好きな人がいる」\n「付き合っている人がいる」\n「復縁したい」\n「出会いを見たい」\n「相手の気持ちを知りたい」\n\n相手との関係や、今いちばん知りたいことを添えて送ってください。${usageText}${noCount}`;
  }
  if (kind === "menu_work") {
    return `仕事や人生の流れを見ていきます。\n\n今知りたいことは、どれに近いですか？\n\n「転職するか迷っている」\n「今の仕事を続けるべき？」\n「向いている働き方を知りたい」\n「人間関係を見たい」\n「人生全体の転機を見たい」\n\n近いものをそのまま送るか、今の状況を一言添えてください。${usageText}${noCount}`;
  }
  if (kind === "small_talk") {
    return `ありがとうございます。占いたいことがあれば、そのまま短く送ってください。\n\n例: 今日の運勢は？ / 復縁をどう見ればいい？ / 転職するなら何を重視すべき？${usageText}${noCount}`;
  }
  if (kind === "off_topic") {
    return `ここでは、星読み・登録情報・使い方に関する内容を扱っています。\n\n医療、法律、投資など専門判断が必要なことは専門家へ相談してください。占いたいテーマがあれば、恋愛や仕事、人生の流れのように送ってください。${usageText}${noCount}`;
  }
  return `使い方や不具合については、Webの登録情報ページや問い合わせページから確認できます。\n${appUrl("/account")}\n${appUrl("/contact")}${usageText}${noCount}`;
}

function buildNonBillableLineLimitReply(rateLimit: NonBillableRateLimitResult) {
  const wait = formatRetryAfter(rateLimit.retryAfterSeconds);
  return `確認メッセージが短時間に続いているため、一時的に受付を止めています。\n\n占い相談の回数は消費していません。${wait ? `${wait}ほど時間をおいて、` : "少し時間をおいて、"}もう一度送ってください。`;
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

function resolveLineQuotaMode(quota: Awaited<ReturnType<typeof getQuotaState>>) {
  if (quota.usesFreeBonus) return "free_bonus";
  if (quota.baseRemaining <= 0 && quota.addOnCredits > 0) return "add_on";
  return "base";
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
    return `今、鑑定の依頼が集中しています。相談回数は消費していません。${retry}`;
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
