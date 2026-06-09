"use client";

import { FormEvent, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import "@/app/consultation-view.css";
import { coerceAnswerText, normalizeAnswerText } from "@/lib/answerText";
import { PlanKey } from "@/lib/plans";
import { QuestionIntentKey } from "@/lib/questionIntents";
import { romanticInterestOptions, RomanticInterestKey } from "@/lib/profileOptions";
import { ReaderStyle, ReaderStyleKey, readerStyles } from "@/lib/readerStyles";

export type ConsultationMessage = {
  role: "user" | "assistant";
  content: string;
  readerStyle?: ReaderStyleKey;
};

export type ReaderStyleGroup = {
  key: string;
  label: string;
  items: ReaderStyle[];
};

export type ConsultationViewProps = {
  checkoutNotice?: string;
  error?: string;
  followUpQuestions: string[];
  hasChart: boolean;
  lineEntry?: {
    connectHref: string;
    friendUrl: string;
    lineLinked: boolean;
  };
  loading: boolean;
  loadingText: string;
  messages: ConsultationMessage[];
  pendingLoveQuestion: boolean;
  pricingHref: string;
  question: string;
  readerStyleExpanded: boolean;
  readerStyleGroups: ReaderStyleGroup[];
  readerStyleNotice: string;
  readerStyleUpgradePlan: Exclude<PlanKey, "free"> | null;
  activeReaderStyleKey: ReaderStyleKey;
  requiredPlanLabelFor: (key: ReaderStyleKey) => string;
  isReaderStyleLocked: (key: ReaderStyleKey) => boolean;
  starterQuestions: { intent: QuestionIntentKey; text: string }[];
  startReadingHref: string;
  streamingAnswer: string;
  usage: {
    addOnCredits: number;
    freeBonusRemaining: number;
    isMember: boolean;
    periodLabel: string;
    plan: PlanKey;
    planLabel: string;
    remaining: number;
    used: number;
    unlimited: boolean;
  };
  onChooseRomanticInterest: (key: RomanticInterestKey) => void;
  onClearQuestion: () => void;
  onFollowUp: (text: string) => void;
  onOpenPaywall: () => void;
  onQuestionChange: (text: string) => void;
  onSelectReaderStyle: (key: ReaderStyleKey) => void;
  onSelectStarter: (text: string, intent: QuestionIntentKey) => void;
  onSend: (text: string, intent?: QuestionIntentKey) => void;
  onToggleReaderStyleExpanded: () => void;
};

export function ConsultationView({
  activeReaderStyleKey,
  checkoutNotice,
  error,
  followUpQuestions,
  hasChart,
  isReaderStyleLocked,
  lineEntry,
  loading,
  loadingText,
  messages,
  onChooseRomanticInterest,
  onClearQuestion,
  onFollowUp,
  onOpenPaywall,
  onQuestionChange,
  onSelectReaderStyle,
  onSelectStarter,
  onSend,
  onToggleReaderStyleExpanded,
  pendingLoveQuestion,
  pricingHref,
  question,
  readerStyleExpanded,
  readerStyleGroups,
  readerStyleNotice,
  readerStyleUpgradePlan,
  requiredPlanLabelFor,
  starterQuestions,
  startReadingHref,
  streamingAnswer,
  usage
}: ConsultationViewProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeReader = useMemo(() => resolveReader(activeReaderStyleKey), [activeReaderStyleKey]);
  const quotaReached = hasChart && !usage.unlimited && usage.remaining <= 0;
  const showIntro = messages.length === 0;
  const trimmedQuestion = question.trim();
  const canSend = hasChart && Boolean(trimmedQuestion) && !loading && !quotaReached;
  const quotaText = usage.unlimited ? "無制限" : `残り${Math.max(0, usage.remaining)}回`;

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [messages, loading, streamingAnswer, pendingLoveQuestion]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    onSend(trimmedQuestion);
  }

  return (
    <section className="consultation-view panel" aria-label="相談画面">
      <div className="consultation-view-header">
        {hasChart ? (
          <button
            aria-controls="consultation-reader-sheet"
            aria-expanded={readerStyleExpanded}
            className="consultation-reader-chip"
            onClick={onToggleReaderStyleExpanded}
            type="button"
          >
            <img alt="" src={activeReader.imageSrc} />
            <span>
              <small>占い師</small>
              <strong>{activeReader.readerName}</strong>
            </span>
          </button>
        ) : (
          <span className="consultation-header-brand">星読み相談</span>
        )}
        <Link className="consultation-quota-chip" href={pricingHref} aria-label="相談の残り回数とプラン">
          {quotaText}
        </Link>
      </div>

      {showIntro && hasChart && lineEntry && usage.isMember ? <ConsultationLineBanner lineEntry={lineEntry} /> : null}
      {checkoutNotice ? <p className="consultation-notice success">{checkoutNotice}</p> : null}
      {error ? (
        <p className="consultation-notice error" role="alert">
          {error}
        </p>
      ) : null}

      {hasChart && readerStyleExpanded ? (
        <ReaderStyleSheet
          activeReaderStyleKey={activeReaderStyleKey}
          groups={readerStyleGroups}
          isLocked={isReaderStyleLocked}
          onOpenPaywall={onOpenPaywall}
          onSelect={onSelectReaderStyle}
          requiredPlanLabelFor={requiredPlanLabelFor}
          upgradePlan={readerStyleUpgradePlan}
          usageUnlimited={usage.unlimited}
          notice={readerStyleNotice}
        />
      ) : null}

      {quotaReached ? (
        <div className="consultation-limit-banner" role="status">
          <span>ここから先を読む準備が必要です</span>
          <p>今日の相談枠を使い切っています。必要になったタイミングで、追加枠やプランを選ぶとこのまま続けられます。</p>
          <button className="button primary" onClick={onOpenPaywall} type="button">
            追加枠・プランを見る
          </button>
        </div>
      ) : null}

      <div className="consultation-scroll" ref={scrollRef}>
        {!hasChart ? <NoChartState startReadingHref={startReadingHref} /> : null}
        {hasChart && !messages.length && !loading ? <EmptyConsultationState /> : null}

        {messages.map((message, index) => (
          <ConsultationMessageBubble activeReaderStyleKey={activeReaderStyleKey} key={`${message.role}-${index}`} message={message} onFollowUp={onFollowUp} />
        ))}

        {pendingLoveQuestion ? (
          <div className="love-preference-panel consultation-love-panel">
            <span>恋愛相談の前に確認します</span>
            <strong>あなたが恋愛対象として見ることが多いのはどちらですか？</strong>
            <p>ここを選ぶと、その前提で鑑定を続けます。まだ決めきれない場合や、恋愛対象がない場合も選べます。</p>
            <div className="love-preference-options">
              {romanticInterestOptions
                .filter((option) => option.key !== "unspecified")
                .map((option) => (
                  <button className="love-preference-option" key={option.key} onClick={() => onChooseRomanticInterest(option.key)} type="button">
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="consultation-message assistant consultation-thinking" aria-live="polite">
            <ReaderIdentity readerStyleKey={activeReaderStyleKey} />
            <p>{loadingText}</p>
            <div className="consultation-shimmer" aria-hidden="true" />
            {streamingAnswer ? <div className="consultation-answer-body">{streamingAnswer}</div> : null}
          </div>
        ) : null}
      </div>

      {hasChart ? (
        <div className="consultation-compose-area">
          <div className="consultation-starters" aria-label="相談テーマを選ぶ">
            {starterQuestions.map((sample) => (
              <button
                aria-pressed={question === sample.text}
                className={question === sample.text ? "active" : ""}
                key={sample.text}
                onClick={() => onSelectStarter(sample.text, sample.intent)}
                type="button"
              >
                {sample.text}
              </button>
            ))}
          </div>

          <form className="consultation-form" onSubmit={submit}>
            <div className="chat-form-heading">
              <span>{question ? "この質問について相談しますか？" : "自由に相談を書く"}</span>
              <small>{question ? "内容を確認してから開始できます" : "候補にない悩みも、そのまま送れます"}</small>
            </div>
            {question ? (
              <div className="selected-question-card">
                <span>選択中の相談</span>
                <p>{question}</p>
                <button className="text-button" onClick={onClearQuestion} type="button">
                  内容を変更する
                </button>
              </div>
            ) : null}
            <div className="consultation-input-row">
              <textarea
                aria-label="相談内容"
                disabled={!hasChart || loading || quotaReached}
                onChange={(event) => onQuestionChange(event.target.value)}
                placeholder="候補にないことでも大丈夫です。例: あの人との今後は？今の仕事を続けるべき？今年動くなら何を意識すればいい？"
                value={question}
              />
              <button className="button primary" disabled={!canSend} type="submit">
                {question ? "この内容で相談する" : "相談する"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function ReaderStyleSheet({
  activeReaderStyleKey,
  groups,
  isLocked,
  notice,
  onOpenPaywall,
  onSelect,
  requiredPlanLabelFor,
  upgradePlan,
  usageUnlimited
}: {
  activeReaderStyleKey: ReaderStyleKey;
  groups: ReaderStyleGroup[];
  isLocked: (key: ReaderStyleKey) => boolean;
  notice: string;
  onOpenPaywall: () => void;
  onSelect: (key: ReaderStyleKey) => void;
  requiredPlanLabelFor: (key: ReaderStyleKey) => string;
  upgradePlan: Exclude<PlanKey, "free"> | null;
  usageUnlimited: boolean;
}) {
  return (
    <div className="consultation-reader-sheet" id="consultation-reader-sheet">
      {groups.map((group) => (
        <div className={`consultation-reader-group ${group.key}`} key={group.key}>
          <span>{group.label}</span>
          <div className="consultation-reader-grid">
            {group.items.map((style) => {
              const locked = isLocked(style.key);
              const active = activeReaderStyleKey === style.key;
              return (
                <button
                  aria-pressed={active}
                  className={`consultation-reader-card ${active ? "active" : ""} ${locked ? "locked" : ""} ${style.requiredPlan === "luxury" ? "private" : ""}`}
                  key={style.key}
                  onClick={() => onSelect(style.key)}
                  type="button"
                >
                  <img alt="" src={style.imageSrc} />
                  <span>
                    <strong>{style.label}</strong>
                    <em>{style.readerName}</em>
                    <small>{style.persona}</small>
                  </span>
                  <b>{locked ? `🔒 ${requiredPlanLabelFor(style.key)}` : active ? "選択中" : usageUnlimited && style.requiredPlan !== "free" ? "開発環境で選択可" : "選択する"}</b>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {notice ? (
        <div className="consultation-reader-notice">
          <p>{notice}</p>
          {upgradePlan ? (
            <button className="button primary" onClick={onOpenPaywall} type="button">
              プランを見る
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ConsultationLineBanner({ lineEntry }: { lineEntry: NonNullable<ConsultationViewProps["lineEntry"]> }) {
  return (
    <div className={`consultation-line-banner ${lineEntry.lineLinked ? "linked" : ""}`}>
      <span>{lineEntry.lineLinked ? "LINE連携済み" : "LINEでも相談できます"}</span>
      <p>{lineEntry.lineLinked ? "Webの星と履歴を引き継いで、LINEからも相談できます。" : "LINEで登録・友だち追加すると、ここでの記憶をLINEに引き継げます。"}</p>
      {lineEntry.lineLinked && lineEntry.friendUrl ? (
        <a href={lineEntry.friendUrl} rel="noreferrer" target="_blank">
          LINEを開く
        </a>
      ) : lineEntry.lineLinked ? null : (
        <a href={lineEntry.connectHref}>LINEで登録・友だち追加</a>
      )}
    </div>
  );
}

function NoChartState({ startReadingHref }: { startReadingHref: string }) {
  return (
    <div className="consultation-empty-state">
      <span>Birth Chart</span>
      <h3>まず、あなたの星を読みます</h3>
      <p>出生情報を入力すると、ここで同じ星の文脈を引き継いで相談できます。</p>
      <Link className="button primary" href={startReadingHref}>
        出生情報を入力する
      </Link>
    </div>
  );
}

function EmptyConsultationState() {
  return (
    <div className="consultation-empty-state">
      <h3>いま知りたいことを占いましょう</h3>
      <p>下の候補から選んでも、そのまま自由に書いても大丈夫です。</p>
    </div>
  );
}

function ConsultationMessageBubble({ activeReaderStyleKey, message, onFollowUp }: { activeReaderStyleKey: ReaderStyleKey; message: ConsultationMessage; onFollowUp: (question: string) => void }) {
  if (message.role === "user") {
    return <div className="consultation-message user">{coerceAnswerText(message.content)}</div>;
  }
  const readerStyleKey = message.readerStyle ?? activeReaderStyleKey;
  const { body, followUps } = extractAssistantFollowUps(normalizeAnswerText(message.content));

  return (
    <div className="consultation-message assistant">
      <ReaderIdentity readerStyleKey={readerStyleKey} />
      <div className="consultation-answer-body">{body}</div>
      {followUps.length ? (
        <div className="consultation-answer-follow-ups">
          <span>続けて掘り下げるなら</span>
          <div>
            {followUps.map((followUp) => (
              <button key={followUp} onClick={() => onFollowUp(followUp)} type="button">
                {followUp}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReaderIdentity({ readerStyleKey }: { readerStyleKey: ReaderStyleKey }) {
  const reader = resolveReader(readerStyleKey);
  return (
    <div className={`consultation-reader-identity ${reader.requiredPlan === "luxury" ? "private" : ""}`}>
      <img alt="" src={reader.imageSrc} />
      <span>
        <small>{reader.label}</small>
        <strong>{reader.readerName}</strong>
      </span>
    </div>
  );
}

function resolveReader(key: ReaderStyleKey) {
  return readerStyles.find((style) => style.key === key) ?? readerStyles[0];
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
  return { body: bodyLines.join("\n").trim(), followUps };
}

function findFollowUpMarkerIndex(lines: string[]) {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (isFollowUpHeading(lines[index])) return index;
  }
  return -1;
}

function isFollowUpHeading(line: string) {
  return /続けて|掘り下げ|次に聞く|次の相談/.test(line.trim());
}

function cleanFollowUpQuestion(value: string) {
  return value.replace(/^[「『]/, "").replace(/[」』。.!！?？]+$/, "").trim();
}
