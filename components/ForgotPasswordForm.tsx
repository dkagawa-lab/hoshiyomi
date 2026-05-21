"use client";

import { FormEvent, useState } from "react";
import { buildPasswordRedirectUrl, getSupabaseAuthClient } from "@/lib/authRegistrationClient";

type ForgotStatus = {
  kind: "error" | "idle" | "loading" | "success";
  message: string;
};

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ForgotStatus>({ kind: "idle", message: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setStatus({ kind: "error", message: "メールアドレスを入力してください。" });
      return;
    }
    const supabase = getSupabaseAuthClient();
    if (!supabase) {
      setStatus({ kind: "error", message: "パスワード再設定にはSupabase Authの公開キー設定が必要です。" });
      return;
    }

    setStatus({ kind: "loading", message: "再設定用メールを送信しています。" });
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: buildPasswordRedirectUrl("/account", "", "recovery")
    });
    if (error) {
      setStatus({ kind: "error", message: "メール送信に失敗しました。アドレスを確認してもう一度お試しください。" });
      return;
    }
    setStatus({ kind: "success", message: "パスワード再設定用のメールを送りました。メール内のリンクから新しいパスワードを設定してください。" });
  }

  return (
    <form className="forgot-password-form" onSubmit={handleSubmit}>
      <label htmlFor="forgot-email">登録したメールアドレス</label>
      <div>
        <input
          autoComplete="email"
          id="forgot-email"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <button className="button primary" disabled={status.kind === "loading"} type="submit">
          再設定メールを送る
        </button>
      </div>
      {status.message ? <p className={`form-status ${status.kind === "error" ? "error" : status.kind === "success" ? "success" : ""}`}>{status.message}</p> : null}
    </form>
  );
}
