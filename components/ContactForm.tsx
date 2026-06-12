"use client";

import { FormEvent, useMemo, useState } from "react";
import { readPlanFromStorage, resolvePlan } from "@/lib/plans";
import { Locale } from "@/lib/i18n";

const categoryOptions = [
  { value: "reading", label: "鑑定内容について" },
  { value: "bug", label: "不具合の報告" },
  { value: "request", label: "ご要望・機能追加" },
  { value: "billing", label: "決済・解約について" },
  { value: "account", label: "登録情報について" },
  { value: "other", label: "その他" }
];

export function ContactForm({ language = "ja" }: { language?: Locale }) {
  const english = language === "en";
  const [category, setCategory] = useState("request");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const planLabel = useMemo(() => resolvePlan(typeof window === "undefined" ? "free" : readPlanFromStorage()).label, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agree) {
      setStatus({ tone: "error", text: english ? "Please agree that we may review your message for reply, investigation, and service improvement." : "送信前に、返信と調査のために入力内容を確認することへ同意してください。" });
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          email,
          message,
          name,
          pageUrl: window.location.href,
          plan: planLabel
        })
      });
      const result = (await response.json()) as { error?: string; stored?: boolean };
      if (!response.ok) throw new Error(result.error || (english ? "Could not send the message. Please try again later." : "送信できませんでした。時間をおいてもう一度お試しください。"));
      setMessage("");
      setStatus({
        tone: "success",
        text: result.stored === false
          ? english
            ? "Received for local testing. In production, messages are stored in Supabase."
            : "ローカル確認用として受け付けました。本番公開時はSupabaseに保存されます。"
          : english
            ? "Sent. We will review the message and reply if needed."
            : "送信しました。内容を確認し、必要に応じて返信します。"
      });
    } catch (error) {
      setStatus({ tone: "error", text: error instanceof Error ? error.message : english ? "Could not send the message. Please try again later." : "送信できませんでした。時間をおいてもう一度お試しください。" });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-grid">
        <label className="field">
          <span>{english ? "Category" : "種類"}</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categoryOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {english ? categoryLabelEn(item.value) : item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{english ? "Current plan" : "現在のプラン"}</span>
          <input readOnly value={planLabel} />
        </label>
        <label className="field">
          <span>{english ? "Name" : "お名前"}</span>
          <input autoComplete="name" maxLength={80} placeholder={english ? "Your name" : "例: 星野 花"} required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="field">
          <span>{english ? "Reply email" : "返信先メールアドレス"}</span>
          <input autoComplete="email" inputMode="email" maxLength={160} placeholder="example@example.com" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="field full">
          <span>{english ? "Message" : "内容"}</span>
          <textarea
            maxLength={2000}
            placeholder={english ? "Tell us what happened, what you want improved, requested reading themes, or billing/cancellation questions. For billing, include the email used at checkout if possible." : "困っていること、改善してほしいこと、欲しい鑑定テーマなどを入力してください。課金や解約については、決済時のメールアドレスも書いていただくと確認しやすくなります。"}
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
      </div>

      <label className="contact-consent">
        <input checked={agree} type="checkbox" onChange={(event) => setAgree(event.target.checked)} />
        <span>{english ? "I agree that HOSHIYOMI may review my message and usage status for reply, investigation, and service improvement." : "返信・調査・サービス改善のために、入力内容と利用状況を確認することに同意します。"}</span>
      </label>

      {status ? <p className={`form-status ${status.tone}`}>{status.text}</p> : null}

      <button className="button primary" disabled={sending} type="submit">
        {sending ? (english ? "Sending" : "送信しています") : english ? "Send message" : "問い合わせを送信する"}
      </button>
    </form>
  );
}

function categoryLabelEn(value: string) {
  const labels: Record<string, string> = {
    account: "Account",
    billing: "Billing / cancellation",
    bug: "Bug report",
    other: "Other",
    reading: "Reading content",
    request: "Request / feature idea"
  };
  return labels[value] ?? value;
}
