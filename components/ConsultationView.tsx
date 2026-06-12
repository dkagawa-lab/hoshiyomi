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

import { FormEvent, useEffect, useRef, useState } from "react";
import { ReaderStyle, ReaderStyleKey, readerStyles } from "@/lib/readerStyles";
import { PlanKey } from "@/lib/plans";
import { QuestionIntentKey } from "@/lib/questionIntents";
import { RomanticInterestKey, romanticInterestOptions } from "@/lib/profileOptions";
import { coerceAnswerText, normalizeAnswerText } from "@/lib/answerText";
import { Locale } from "@/lib/i18n";
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
  language?: Locale;
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
    if (line.includes("続けて掘り下げるなら") || line.includes("次に聞くなら") || line.includes("次に聞くと深") || line.toLowerCase().includes("to go deeper") || line.toLowerCase().includes("next question")) {
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
  while (bodyLines.length && /続けて掘り下げるなら|次に聞くなら|次に聞くと深|to go deeper|next question/i.test(bodyLines[bodyLines.length - 1])) {
    bodyLines.pop();
  }
  return { body: bodyLines.join("\n").trim(), followUps: Array.from(new Set(followUps)) };
}

/* ----------------------------------------------------------------------- */
/* Sub-components                                                           */
/* ----------------------------------------------------------------------- */

function QuotaHeader({ usage, activeReader, onToggleReader, pricingHref, language }: {
  usage: ConsultationUsage;
  activeReader: ReaderStyle;
  onToggleReader: () => void;
  pricingHref: string;
  language?: Locale;
}) {
  const english = language === "en";
  const sub: string[] = [];
  if (usage.isMember && usage.freeBonusRemaining > 0) sub.push(`${english ? "Bonus" : "登録特典"} ${usage.freeBonusRemaining}`);
  if (usage.addOnCredits > 0) sub.push(`${english ? "Add-on" : "追加"} ${usage.addOnCredits}`);

  return (
    <header className="cv-quota">
      <div className="cv-quota-main">
        <span className="cv-eyebrow">Private Reading</span>
        {usage.unlimited ? (
          <div className="cv-quota-figure is-unlimited" aria-label={english ? "Unlimited questions" : "相談回数は無制限"}>
            <strong>{english ? "Unlimited" : "無制限"}</strong>
          </div>
        ) : (
          <div className="cv-quota-figure" aria-label={english ? `${usage.remaining} questions remaining` : `残り${usage.remaining}回`}>
            <strong>{usage.remaining}</strong>
            <span className="cv-quota-unit">{english ? "left" : "回 残り"}</span>
          </div>
        )}
        <p className="cv-quota-sub">
          <a className="cv-quota-plan" href={pricingHref} aria-label={english ? `Current plan: ${usage.planLabel}. View plans` : `現在のプラン: ${usage.planLabel}。プランを見る`}>{usage.planLabel}</a>
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
      <button className="cv-reader-chip" type="button" onClick={onToggleReader} aria-expanded={false} aria-label={english ? `Reader style: ${readerNameEn(activeReader.key)}. Change` : `占い師タイプ: ${activeReader.readerName}。変更する`}>
        <img className="cv-reader-avatar" src={activeReader.imageSrc} alt="" />
        <span className="cv-reader-chip-name">{english ? readerNameEn(activeReader.key) : activeReader.readerName}</span>
        <span className="cv-reader-chip-cue">{english ? "Change" : "変更"}</span>
      </button>
    </header>
  );
}

function ReaderSheet(props: ConsultationViewProps) {
  const english = props.language === "en";
  return (
    <div className="cv-reader-sheet" id="cv-reader-options">
      <div className="cv-reader-sheet-head">
        <div>
          <span className="cv-eyebrow">Reader</span>
          <p>{english ? "Choose the voice that feels right for you. Locked styles open with higher plans." : "あなたに合わせて語り口を選べます。ロックは上位プランで開きます。"}</p>
        </div>
        <button className="cv-btn" type="button" onClick={props.onToggleReaderStyleExpanded}>
          {english ? "Close" : "閉じる"}
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
                    <strong>{english ? readerLabelEn(style.key) : style.label}</strong>
                    <em>{english ? readerNameEn(style.key) : style.readerName}</em>
                    <small>{english ? readerPersonaEn(style.key) : style.persona}</small>
                  </span>
                  <span className="cv-reader-flag">
                    {locked ? (
                      <span className="cv-reader-flag-lock">
                        <IconLock />
                        {props.requiredPlanLabelFor(style.key)}
                      </span>
                    ) : active ? (
                      english ? "Selected" : "選択中"
                    ) : (
                      english ? "Available" : "選択可"
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
              {english ? "View plans" : "プランを見る"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LineEntry({ entry, language }: { entry: { lineLinked: boolean; connectHref: string; friendUrl: string }; language?: Locale }) {
  const english = language === "en";
  const href = entry.lineLinked ? entry.friendUrl : entry.connectHref;
  return (
    <a className="cv-line-entry" href={href}>
      <span className="cv-line-entry-text">
        {entry.lineLinked
          ? english
            ? "You can continue this reading in LINE messages too"
            : "LINEのメッセージでも、この続きを相談できます"
          : english
            ? "Connect LINE to carry this memory into chat"
            : "LINEと連携すると、この記憶をLINEに引き継げます"}
      </span>
      <span className="cv-line-entry-cue">{entry.lineLinked ? (english ? "Open" : "開く") : english ? "Connect" : "連携"}</span>
    </a>
  );
}

function ReaderHead({ readerStyle, language }: { readerStyle: ReaderStyleKey; language?: Locale }) {
  const english = language === "en";
  const style = resolveReaderStyle(readerStyle);
  const title = english ? (style.key === "normal" ? "Read with the standard voice" : `${readerNameEn(style.key)} read this`) : style.key === "normal" ? "標準鑑定で読みました" : `${style.readerName}が読みました`;
  return (
    <div className="cv-reader-head">
      <img src={style.imageSrc} alt="" />
      <div className="cv-reader-head-text">
        <span>{english ? `${readerLabelEn(style.key)} style` : `${style.label}タイプの鑑定`}</span>
        <strong>{title}</strong>
        <p>{english ? readerDescriptionEn(style.key) : style.description}</p>
      </div>
    </div>
  );
}

function MessageBubble({ message, onFollowUp, language }: { message: ConsultationMessage; onFollowUp: (q: string) => void; language?: Locale }) {
  const english = language === "en";
  if (message.role === "user") {
    return <div className="cv-msg-user">{coerceAnswerText(message.content)}</div>;
  }
  const { body, followUps } = extractAssistantFollowUps(normalizeAnswerText(message.content));
  const style = resolveReaderStyle(message.readerStyle);
  return (
    <article className={`cv-msg-reader ${style.requiredPlan === "luxury" ? "is-luxury" : ""}`}>
      {message.readerStyle ? <ReaderHead readerStyle={message.readerStyle} language={language} /> : null}
      <div className="cv-reader-letter">{body}</div>
      {followUps.length ? (
        <div className="cv-answer-followup">
          <span>{english ? "To go deeper" : "続けて掘り下げるなら"}</span>
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

function LovePreferencePanel({ onChoose, language }: { onChoose: (key: RomanticInterestKey) => void; language?: Locale }) {
  const english = language === "en";
  return (
    <div className="cv-love love-preference-panel">
      <span>{english ? "Before a love reading" : "恋愛相談の前に"}</span>
      <strong>{english ? "Who are you usually romantically drawn to?" : "あなたが恋愛対象として見ることが多いのはどちらですか？"}</strong>
      <p>{english ? "Choose the closest option. You can also choose unsure, unknown, or no romantic target." : "選ぶと、その前提で鑑定を続けます。まだ決めきれない場合や、恋愛対象がない場合も選べます。"}</p>
      <div className="cv-love-options">
        {romanticInterestOptions
          .filter((option) => option.key !== "unspecified")
          .map((option) => (
            <button className="cv-love-option" type="button" key={option.key} onClick={() => onChoose(option.key)}>
              <strong>{english ? romanticInterestLabelEn(option.key) : option.label}</strong>
              <span>{english ? romanticInterestDescriptionEn(option.key) : option.description}</span>
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
  const english = props.language === "en";

  const threadRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLFormElement | null>(null);
  const activeReader = resolveReaderStyle(activeReaderStyleKey);
  const limitReached = !usage.unlimited && usage.remaining <= 0;
  const hasReadingContent = messages.length > 0 || loading || Boolean(streamingAnswer) || pendingLoveQuestion;
  const [keyboardActive, setKeyboardActive] = useState(false);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    window.requestAnimationFrame(() => {
      if (el.scrollHeight > el.clientHeight + 4) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        return;
      }
      const latest = el.lastElementChild instanceof HTMLElement ? el.lastElementChild : el;
      latest.scrollIntoView({ block: "end", behavior: "smooth" });
    });
  }, [messages, loading, streamingAnswer, pendingLoveQuestion]);

  useEffect(() => {
    const root = document.documentElement;
    let focusTimer: number | undefined;

    const updateKeyboardInset = () => {
      const viewport = window.visualViewport;
      const activeElement = document.activeElement;
      const editing =
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLSelectElement;
      const rawInset = viewport ? window.innerHeight - viewport.height - viewport.offsetTop : 0;
      const inset = editing ? Math.max(0, Math.round(rawInset)) : 0;
      const active = editing && inset > 80;
      root.style.setProperty("--cv-keyboard-inset", `${active ? inset : 0}px`);
      if (active) root.dataset.cvKeyboard = "open";
      else delete root.dataset.cvKeyboard;
      setKeyboardActive(active);
    };

    const scheduleUpdate = () => {
      if (focusTimer) window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(updateKeyboardInset, 60);
    };

    updateKeyboardInset();
    window.visualViewport?.addEventListener("resize", updateKeyboardInset);
    window.visualViewport?.addEventListener("scroll", updateKeyboardInset);
    window.addEventListener("orientationchange", scheduleUpdate);
    window.addEventListener("focusin", scheduleUpdate);
    window.addEventListener("focusout", scheduleUpdate);

    return () => {
      if (focusTimer) window.clearTimeout(focusTimer);
      window.visualViewport?.removeEventListener("resize", updateKeyboardInset);
      window.visualViewport?.removeEventListener("scroll", updateKeyboardInset);
      window.removeEventListener("orientationchange", scheduleUpdate);
      window.removeEventListener("focusin", scheduleUpdate);
      window.removeEventListener("focusout", scheduleUpdate);
      root.style.removeProperty("--cv-keyboard-inset");
      delete root.dataset.cvKeyboard;
    };
  }, []);

  /* ---- empty state: チャート未作成 ---- */
  if (!hasChart) {
    return (
      <section className="consultation-view" data-screen-label={english ? "Consultation empty" : "相談(空)"}>
        <div className="cv-empty">
          <div className="cv-empty-mark" aria-hidden="true">✦</div>
          <h2>
            {english ? "First, let’s read your stars" : "まず、あなたの星を読みます"}
          </h2>
          <p>
            {english
              ? "To begin a consultation, create a horoscope from your birth date and birthplace. Once your chart is mapped, your questions can be read in that context."
              : "相談を始めるには、生年月日と出生地からホロスコープを作成します。星の配置を読み取ったうえで、あなたの相談に合わせてこれからの流れを見ていきます。"}
          </p>
          {props.onStartReading ? (
            <button className="cv-btn is-primary" type="button" onClick={props.onStartReading}>
              {english ? "Enter birth data" : "出生情報を入力する"}
            </button>
          ) : (
            <a className="cv-btn is-primary" href={startReadingHref}>
              {english ? "Enter birth data" : "出生情報を入力する"}
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
    <section className={`consultation-view ${hasReadingContent ? "is-reading" : ""} ${keyboardActive ? "is-keyboard-active" : ""}`} data-screen-label={english ? "Consultation" : "相談"}>
      <QuotaHeader usage={usage} activeReader={activeReader} onToggleReader={props.onToggleReaderStyleExpanded} pricingHref={pricingHref} language={props.language} />
      {usage.isMember && lineEntry ? <LineEntry entry={lineEntry} language={props.language} /> : null}

      {readerStyleExpanded ? <ReaderSheet {...props} /> : null}

      <div className="cv-thread" ref={threadRef}>
        {checkoutNotice ? <p className="cv-notice">{checkoutNotice}</p> : null}

        {showHint ? (
          <p className="cv-thread-hint">
            <span className="cv-star" aria-hidden="true">✦</span>
            {english
              ? "Choose a theme below, or write anything in your own words. Your reading will appear here after you send it."
              : "下のテーマから選んでも、そのまま自由に書いても大丈夫です。送信すると、ここに鑑定結果が届きます。"}
          </p>
        ) : null}

        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} onFollowUp={props.onFollowUp} language={props.language} />
        ))}

        {loading ? (
          <div className="cv-thinking" aria-live="polite">
            <ReaderHead readerStyle={activeReaderStyleKey} language={props.language} />
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

      {pendingLoveQuestion ? <LovePreferencePanel onChoose={props.onChooseRomanticInterest} language={props.language} /> : null}

      <form className="cv-composer" ref={composerRef} onSubmit={submit}>
        {limitReached ? (
          <div className="cv-limit">
            <div className="cv-limit-head">
              <span>Continue Reading</span>
              <strong>{english ? "You have used today’s reading credits" : "今日の相談枠を使い切りました"}</strong>
            </div>
            <p>
              {english
                ? "You can still ask about credits, plans, registration, or LINE connection without using a reading credit. To continue readings now, choose an add-on or higher plan."
                : "残り回数、料金、登録、LINE連携などの確認は、このまま送っても相談回数を消費しません。鑑定を続けたい場合は、追加枠または上位プランを選べます。"}
            </p>
            <div className="cv-limit-actions">
              <button className="cv-btn is-primary cv-btn-block" type="button" onClick={props.onOpenPaywall}>
                {english ? "View add-ons and plans" : "追加枠・プランを見る"}
              </button>
            </div>
          </div>
        ) : null}

        {!hasReadingContent ? (
          <div className="cv-themes-shell">
            <div className="cv-themes" role="group" aria-label={english ? "Consultation themes" : "相談テーマ"}>
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
        ) : null}

        {question ? (
          <div className="cv-selected">
            <div className="cv-selected-head">
              <span>{english ? "Selected question" : "選択中の相談"}</span>
              <button className="cv-selected-close" type="button" onClick={props.onClearQuestion} aria-label={english ? "Clear selected question" : "選択中の相談を解除"}>
                ×
              </button>
            </div>
            <p>{question}</p>
          </div>
        ) : null}

        {!question ? (
          <p className="cv-input-help">
            {english
              ? "You can also write freely. Ask about someone on your mind, work, a choice you are unsure about, today’s flow, or anything you want read through your chart."
              : "候補にないことでも大丈夫です。今気になっている相手、仕事のこと、迷っていること、今日の流れなど、そのまま書いてください。"}
          </p>
        ) : null}

        <div className="cv-input-row">
          <textarea
            value={question}
            onChange={(e) => props.onQuestionChange(e.target.value)}
            onFocus={() => {
              window.setTimeout(() => composerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 120);
            }}
            placeholder={english ? "Write what you want to ask" : "聞きたいことを自由に入力"}
            aria-label={english ? "Enter your question" : "相談内容を入力"}
            rows={1}
            disabled={loading}
          />
          <button className="cv-send" type="submit" disabled={loading || !question.trim()} aria-label={english ? "Send question" : "相談を送信"}>
            <IconSend />
          </button>
        </div>
      </form>
    </section>
  );
}

function readerLabelEn(key: ReaderStyleKey) {
  const labels: Record<ReaderStyleKey, string> = {
    normal: "Standard",
    mild: "Gentle",
    companion: "Compassionate",
    direct: "Direct",
    harsh: "Sharp"
  };
  return labels[key];
}

function readerNameEn(key: ReaderStyleKey) {
  const labels: Record<ReaderStyleKey, string> = {
    normal: "Standard Reading",
    mild: "Madoka Shiratsuki",
    companion: "Shizuku Amamiya",
    direct: "Rei Kurose",
    harsh: "Rika Sakaki"
  };
  return labels[key];
}

function readerPersonaEn(key: ReaderStyleKey) {
  const labels: Record<ReaderStyleKey, string> = {
    normal: "A balanced reader who organizes your birth chart and current sky without pushing the tone too far.",
    mild: "A gentle reader who softens the order of the message so the heart can receive it.",
    companion: "A warm, deeply empathetic reader who stays close to the feeling beneath the question.",
    direct: "A clear reader who names the real conditions and what should be checked next.",
    harsh: "A sharp reader who cuts through wishful thinking without turning it into fear."
  };
  return labels[key];
}

function readerDescriptionEn(key: ReaderStyleKey) {
  const labels: Record<ReaderStyleKey, string> = {
    normal: "A grounded reading that organizes the chart, the timing, and your choices.",
    mild: "A calm reading that offers options without heightening anxiety.",
    companion: "A compassionate reading that holds the feeling first, then guides the next step.",
    direct: "A practical reading that clarifies what needs to be decided or verified.",
    harsh: "A sharper reading that points out what may be avoided, while keeping the advice usable."
  };
  return labels[key];
}

function romanticInterestLabelEn(key: RomanticInterestKey) {
  const labels: Record<RomanticInterestKey, string> = {
    both: "Both men and women",
    men: "Men",
    no_answer: "Prefer not to say",
    none: "No romantic target",
    not_sure: "Still unsure",
    target_unknown: "I do not know their gender",
    unspecified: "Not specified",
    women: "Women"
  };
  return labels[key];
}

function romanticInterestDescriptionEn(key: RomanticInterestKey) {
  const labels: Record<RomanticInterestKey, string> = {
    both: "You may be drawn to both men and women.",
    men: "You are often romantically drawn to men.",
    no_answer: "Read without assuming the other person’s gender.",
    none: "Do not assume romance as the main premise.",
    not_sure: "Your own feelings or attraction may still be shifting.",
    target_unknown: "Read the relationship without deciding their gender.",
    unspecified: "Confirm this before a love reading.",
    women: "You are often romantically drawn to women."
  };
  return labels[key];
}

export default ConsultationView;
