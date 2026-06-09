"use client";

/**
 * ConsultationView — 相談（チャット）画面の表示専用コンポーネント
 *
 * ロジックは一切持たない。BirthChartApp が保持する値を props で受け取り、
 * ハンドラを呼び出すだけのプレゼンテーション層。
 * BirthChartApp.tsx の `consultationOnly` モードのチャット部分を置き換える想定。
 *
 * 既存のデータ契約に準拠（新しいデータ要件は追加していない）:
 *   - Message            … components/BirthChartApp.tsx の Message と同型
 *   - ReaderStyle(Key)   … lib/readerStyles.ts
 *   - PlanKey            … lib/plans.ts
 *   - QuestionIntentKey  … lib/questionIntents.ts
 *   - RomanticInterestKey / romanticInterestOptions … lib/profileOptions.ts
 *
 * スタイルは素のCSS（consultation-view.css）。Tailwind 不使用。
 */

import { FormEvent, useEffect, useRef } from "react";
import { ReaderStyle, ReaderStyleKey, readerStyles } from "@/lib/readerStyles";
import { PlanKey } from "@/lib/plans";
import { QuestionIntentKey } from "@/lib/questionIntents";
import { RomanticInterestKey, romanticInterestOptions } from "@/lib/profileOptions";
import { coerceAnswerText, normalizeAnswerText } from "@/lib/answerText";
import "@/app/consultation-view.css";

/* ----------------------------------------------------------------------- */
/* Types                                                                    */
/* ----------------------------------------------------------------------- */

export type ConsultationMessage = {
  role: "user" | "assistant";
  content: string;
  readerStyle?: ReaderStyleKey;
};

export type ConsultationUsage = {
  plan: PlanKey;
  /** planStatusLabel(plan, isMember) の結果 */
  planLabel: string;
  /** planQuotaRemaining(...) の主指標 */
  remaining: number;
  used: number;
  freeBonusRemaining: number;
  addOnCredits: number;
  isMember: boolean;
  /** quotaDisabled（開発環境＝無制限） */
  unlimited: boolean;
  /** 「今日」/「今月」 */
  periodLabel?: string;
};

export type ReaderStyleGroup = {
  key: string;
  label: string;
  items: ReaderStyle[];
};

export type ConsultationViewProps = {
  /* --- chart presence / empty state --- */
  hasChart: boolean;

  /* --- usage（残回数） --- */
  usage: ConsultationUsage;

  /* --- conversation --- */
  messages: ConsultationMessage[];
  loading: boolean;
  /** 現在のローディングコピー（loadingSequence[loadingStep] 等） */
  loadingText: string;
  /** 途中表示テキスト */
  streamingAnswer: string;
  /** フォローアップ候補（直近回答由来） */
  followUpQuestions: string[];

  /* --- reader styles --- */
  readerStyleGroups: ReaderStyleGroup[];
  activeReaderStyleKey: ReaderStyleKey;
  readerStyleExpanded: boolean;
  isReaderStyleLocked: (key: ReaderStyleKey) => boolean;
  requiredPlanLabelFor: (key: ReaderStyleKey) => string;
  readerStyleNotice: string;
  readerStyleUpgradePlan: Exclude<PlanKey, "free"> | null;

  /* --- question / themes --- */
  starterQuestions: { intent: QuestionIntentKey; text: string }[];
  question: string;

  /* --- 恋愛相談の前提（オンデマンド確認のみ。常時の性別/恋愛対象セレクタは廃止） --- */
  pendingLoveQuestion: boolean;

  /* --- notices --- */
  checkoutNotice?: string;
  /** 任意。渡された場合のみ独立バナーを表示（未指定なら従来どおり assistant バブルに流す運用） */
  error?: string;

  /* --- discovery / retention（既存データのみ・任意） --- */
  /** ヘッダーのプラン名のリンク先。既定 "/pricing" */
  pricingHref?: string;
  /** 会員向けのスリムなLINE導線。usage.isMember のときだけ表示。未指定なら非表示 */
  lineEntry?: { lineLinked: boolean; connectHref: string; friendUrl: string };

  /* --- handlers --- */
  onSend: (text: string, intent?: QuestionIntentKey) => void;
  onQuestionChange: (text: string) => void;
  onClearQuestion: () => void;
  onSelectStarter: (text: string, intent?: QuestionIntentKey) => void;
  onFollowUp: (text: string) => void;
  onSelectReaderStyle: (key: ReaderStyleKey) => void;
  onToggleReaderStyleExpanded: () => void;
  onChooseRomanticInterest: (key: RomanticInterestKey) => void;
  onOpenPaywall: () => void;
  /** 空状態CTA（出生情報入力へ）。未指定なら href="/m" のリンク */
  onStartReading?: () => void;
  startReadingHref?: string;
};

/* ----------------------------------------------------------------------- */
/* Icons (inline SVG)                                                       */
/* ----------------------------------------------------------------------- */

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.5 19.5 4.5 13 20l-2.6-6.2L4 11.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8.5v5M12 16.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/* Helpers (display-only, no business logic)                                */
/* ----------------------------------------------------------------------- */

function resolveReaderStyle(value: ReaderStyleKey | undefined): ReaderStyle {
  return readerStyles.find((style) => style.key === value) ?? readerStyles[0];
}

/** 本文末尾の「続けて掘り下げるなら / ・項目」を分離（表示専用） */
function extractAssistantFollowUps(content: string): { body: string; followUps: string[] } {
  const lines = content.split("\n");
  let markerIndex = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (line.includes("続けて掘り下げるなら") || line.includes("次に聞くなら") || line.includes("次に聞くと深")) {
      markerIndex = i;
      break;
    }
  }
  if (markerIndex < 0) return { body: content, followUps: [] };
  const followUps = lines
    .slice(markerIndex + 1)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("・"))
    .map((l) => l.replace(/^・+/, "").replace(/^[「『]/, "").replace(/[」』。.\s]+$/g, "").trim())
    .filter((l) => l.length >= 4)
    .slice(0, 4);
  if (!followUps.length) return { body: content, followUps: [] };
  const bodyLines = lines.slice(0, markerIndex);
  while (bodyLines.length && /続けて掘り下げるなら|次に聞くなら|次に聞くと深/.test(bodyLines[bodyLines.length - 1])) {
    bodyLines.pop();
  }
  return { body: bodyLines.join("\n").trim(), followUps: Array.from(new Set(followUps)) };
}

/* ----------------------------------------------------------------------- */
/* Sub-components                                                           */
/* ----------------------------------------------------------------------- */

function QuotaHeader({ usage, activeReader, onToggleReader, pricingHref }: {
  usage: ConsultationUsage;
  activeReader: ReaderStyle;
  onToggleReader: () => void;
  pricingHref: string;
}) {
  const sub: string[] = [];
  if (usage.isMember && usage.freeBonusRemaining > 0) sub.push(`登録特典 ${usage.freeBonusRemaining}`);
  if (usage.addOnCredits > 0) sub.push(`追加 ${usage.addOnCredits}`);

  return (
    <header className="cv-quota">
      <div className="cv-quota-main">
        <span className="cv-eyebrow">Private Reading</span>
        {usage.unlimited ? (
          <div className="cv-quota-figure is-unlimited" aria-label="相談回数は無制限">
            <strong>無制限</strong>
          </div>
        ) : (
          <div className="cv-quota-figure" aria-label={`残り${usage.remaining}回`}>
            <strong>{usage.remaining}</strong>
            <span className="cv-quota-unit">回 残り</span>
          </div>
        )}
        <p className="cv-quota-sub">
          <a className="cv-quota-plan" href={pricingHref} aria-label={`現在のプラン: ${usage.planLabel}。プランを見る`}>{usage.planLabel}</a>
          {!usage.unlimited && usage.periodLabel ? <span>{usage.periodLabel}</span> : null}
          {sub.map((part) => {
            const [label, value] = part.split(" ");
            return (
              <span key={part}>
                {label} <b>{value}</b>
              </span>
            );
          })}
        </p>
      </div>
      <button className="cv-reader-chip" type="button" onClick={onToggleReader} aria-expanded={false} aria-label={`占い師タイプ: ${activeReader.readerName}。変更する`}>
        <img className="cv-reader-avatar" src={activeReader.imageSrc} alt="" />
        <span className="cv-reader-chip-name">{activeReader.readerName}</span>
        <span className="cv-reader-chip-cue">変更</span>
      </button>
    </header>
  );
}

function ReaderSheet(props: ConsultationViewProps) {
  return (
    <div className="cv-reader-sheet" id="cv-reader-options">
      <div className="cv-reader-sheet-head">
        <div>
          <span className="cv-eyebrow">Reader</span>
          <p>あなたに合わせて語り口を選べます。ロックは上位プランで開きます。</p>
        </div>
        <button className="cv-btn" type="button" onClick={props.onToggleReaderStyleExpanded}>
          閉じる
        </button>
      </div>

      {props.readerStyleGroups.map((group) => (
        <div className="cv-reader-group" key={group.key}>
          <span className="cv-reader-group-label">{group.label}</span>
          <div className="cv-reader-options">
            {group.items.map((style) => {
              const locked = props.isReaderStyleLocked(style.key);
              const active = props.activeReaderStyleKey === style.key;
              return (
                <button
                  key={style.key}
                  type="button"
                  className={[
                    "cv-reader-option",
                    style.requiredPlan === "luxury" ? "is-luxury" : "",
                    active ? "is-active" : "",
                    locked ? "is-locked" : ""
                  ].join(" ").trim()}
                  aria-pressed={active}
                  onClick={() => props.onSelectReaderStyle(style.key)}
                >
                  <img src={style.imageSrc} alt="" />
                  <span className="cv-reader-option-copy">
                    <strong>{style.label}</strong>
                    <em>{style.readerName}</em>
                    <small>{style.persona}</small>
                  </span>
                  <span className="cv-reader-flag">
                    {locked ? (
                      <span className="cv-reader-flag-lock">
                        <IconLock />
                        {props.requiredPlanLabelFor(style.key)}
                      </span>
                    ) : active ? (
                      "選択中"
                    ) : (
                      "選択可"
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {props.readerStyleNotice ? (
        <div className="cv-reader-notice">
          <p>{props.readerStyleNotice}</p>
          {props.readerStyleUpgradePlan ? (
            <button className="cv-btn is-primary" type="button" onClick={props.onOpenPaywall}>
              プランを見る
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LineEntry({ entry }: { entry: { lineLinked: boolean; connectHref: string; friendUrl: string } }) {
  const href = entry.lineLinked ? entry.friendUrl : entry.connectHref;
  return (
    <a className="cv-line-entry" href={href}>
      <span className="cv-line-entry-text">
        {entry.lineLinked ? "LINEのメッセージでも、この続きを相談できます" : "LINEと連携すると、この記憶をLINEに引き継げます"}
      </span>
      <span className="cv-line-entry-cue">{entry.lineLinked ? "開く" : "連携"}</span>
    </a>
  );
}

function ReaderHead({ readerStyle }: { readerStyle: ReaderStyleKey }) {
  const style = resolveReaderStyle(readerStyle);
  const title = style.key === "normal" ? "標準鑑定で読みました" : `${style.readerName}が読みました`;
  return (
    <div className="cv-reader-head">
      <img src={style.imageSrc} alt="" />
      <div className="cv-reader-head-text">
        <span>{style.label}タイプの鑑定</span>
        <strong>{title}</strong>
        <p>{style.description}</p>
      </div>
    </div>
  );
}

function MessageBubble({ message, onFollowUp }: { message: ConsultationMessage; onFollowUp: (q: string) => void }) {
  if (message.role === "user") {
    return <div className="cv-msg-user">{coerceAnswerText(message.content)}</div>;
  }
  const { body, followUps } = extractAssistantFollowUps(normalizeAnswerText(message.content));
  const style = resolveReaderStyle(message.readerStyle);
  return (
    <article className={`cv-msg-reader ${style.requiredPlan === "luxury" ? "is-luxury" : ""}`}>
      {message.readerStyle ? <ReaderHead readerStyle={message.readerStyle} /> : null}
      <div className="cv-reader-letter">{body}</div>
      {followUps.length ? (
        <div className="cv-answer-followup">
          <span>続けて掘り下げるなら</span>
          <div className="cv-answer-followup-list">
            {followUps.map((f) => (
              <button className="cv-followup-btn" type="button" key={f} onClick={() => onFollowUp(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function LovePreferencePanel({ onChoose }: { onChoose: (key: RomanticInterestKey) => void }) {
  return (
    <div className="cv-love love-preference-panel">
      <span>恋愛相談の前に</span>
      <strong>あなたが恋愛対象として見ることが多いのはどちらですか？</strong>
      <p>選ぶと、その前提で鑑定を続けます。まだ決めきれない場合や、恋愛対象がない場合も選べます。</p>
      <div className="cv-love-options">
        {romanticInterestOptions
          .filter((option) => option.key !== "unspecified")
          .map((option) => (
            <button className="cv-love-option" type="button" key={option.key} onClick={() => onChoose(option.key)}>
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Main                                                                     */
/* ----------------------------------------------------------------------- */

export function ConsultationView(props: ConsultationViewProps) {
  const {
    hasChart,
    usage,
    messages,
    loading,
    loadingText,
    streamingAnswer,
    starterQuestions,
    question,
    readerStyleExpanded,
    activeReaderStyleKey,
    pendingLoveQuestion,
    checkoutNotice,
    error,
    pricingHref = "/pricing",
    lineEntry,
    startReadingHref = "/m"
  } = props;

  const threadRef = useRef<HTMLDivElement | null>(null);
  const activeReader = resolveReaderStyle(activeReaderStyleKey);
  const limitReached = !usage.unlimited && usage.remaining <= 0;

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, streamingAnswer, pendingLoveQuestion]);

  /* ---- empty state: チャート未作成 ---- */
  if (!hasChart) {
    return (
      <section className="consultation-view" data-screen-label="相談(空)">
        <div className="cv-empty">
          <div className="cv-empty-mark" aria-hidden="true">✦</div>
          <h2>
            まず、あなたの星を読みます
          </h2>
          <p>相談を始めるには、生年月日と出生地からホロスコープを作成します。星の配置を読み取ってから、専任の占い師として未来を見ていきます。</p>
          {props.onStartReading ? (
            <button className="cv-btn is-primary" type="button" onClick={props.onStartReading}>
              出生情報を入力する
            </button>
          ) : (
            <a className="cv-btn is-primary" href={startReadingHref}>
              出生情報を入力する
            </a>
          )}
        </div>
      </section>
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !question.trim()) return;
    props.onSend(question);
  }

  const showHint = !messages.length && !loading;

  return (
    <section className="consultation-view" data-screen-label="相談">
      <QuotaHeader usage={usage} activeReader={activeReader} onToggleReader={props.onToggleReaderStyleExpanded} pricingHref={pricingHref} />
      {usage.isMember && lineEntry ? <LineEntry entry={lineEntry} /> : null}

      {readerStyleExpanded ? <ReaderSheet {...props} /> : null}

      <div className="cv-thread" ref={threadRef}>
        {checkoutNotice ? <p className="cv-notice">{checkoutNotice}</p> : null}

        {showHint ? (
          <p className="cv-thread-hint">
            <span className="cv-star" aria-hidden="true">✦</span>
            下のテーマから選んでも、そのまま自由に書いても大丈夫です。送信すると、ここに鑑定が届きます。
          </p>
        ) : null}

        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} onFollowUp={props.onFollowUp} />
        ))}

        {loading ? (
          <div className="cv-thinking" aria-live="polite">
            <ReaderHead readerStyle={activeReaderStyleKey} />
            <p className="cv-thinking-copy">{loadingText}</p>
            <div className="cv-thinking-bar" aria-hidden="true" />
            {streamingAnswer ? <p className="cv-thinking-stream">{streamingAnswer}</p> : null}
          </div>
        ) : null}

        {error ? (
          <div className="cv-error" role="alert">
            <IconAlert />
            <span>{error}</span>
          </div>
        ) : null}
      </div>

      {pendingLoveQuestion ? <LovePreferencePanel onChoose={props.onChooseRomanticInterest} /> : null}

      <form className="cv-composer" onSubmit={submit}>
        {limitReached ? (
          <div className="cv-limit">
            <div className="cv-limit-head">
              <span>Continue Reading</span>
              <strong>今日の相談枠を、いまぶんは読み切りました</strong>
            </div>
            <p>焦らなくて大丈夫です。明日になればまた相談できます。今すぐ続きを読みたいときだけ、追加枠か上位プランを選べます。</p>
            <div className="cv-limit-actions">
              <button className="cv-btn is-primary cv-btn-block" type="button" onClick={props.onOpenPaywall}>
                追加枠・プランを見る
              </button>
            </div>
          </div>
        ) : null}

        <div className="cv-themes-shell">
          <div className="cv-themes" role="group" aria-label="相談テーマ">
            {starterQuestions.map((sample) => (
              <button
                key={sample.text}
                type="button"
                className={`cv-theme-chip ${question === sample.text ? "is-active" : ""}`}
                onClick={() => props.onSelectStarter(sample.text, sample.intent)}
              >
                {sample.text}
              </button>
            ))}
          </div>
          <span className="cv-themes-cue" aria-hidden="true">›</span>
        </div>

        {question ? (
          <div className="cv-selected">
            <span>選択中の相談</span>
            <p>{question}</p>
            <button type="button" onClick={props.onClearQuestion}>
              内容を変更する
            </button>
          </div>
        ) : null}

        <div className="cv-input-row">
          <textarea
            value={question}
            onChange={(e) => props.onQuestionChange(e.target.value)}
            placeholder="候補にないことでも大丈夫です。例: あの人との今後は？ 今の仕事を続けるべき？"
            aria-label="相談内容を入力"
            rows={1}
            disabled={limitReached}
          />
          <button className="cv-send" type="submit" disabled={loading || limitReached || !question.trim()} aria-label="相談を送信">
            <IconSend />
          </button>
        </div>
      </form>
    </section>
  );
}

export default ConsultationView;
