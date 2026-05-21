"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  authClientUserId,
  buildRegistrationCompleteUrl,
  completeClientRegistration,
  getSupabaseAuthClient,
  readPendingReferralCode,
  readStoredBirth,
  resolveReturnTo
} from "@/lib/authRegistrationClient";

type PasswordStatus = {
  kind: "error" | "idle" | "loading" | "success";
  message: string;
};

export function PasswordSetupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "recovery" ? "recovery" : "signup";
  const returnTo = resolveReturnTo(searchParams.get("returnTo"));
  const referralCode = searchParams.get("ref") || readPendingReferralCode();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<PasswordStatus>({ kind: "loading", message: "メールリンクを確認しています。" });

  useEffect(() => {
    let cancelled = false;

    async function prepareSession() {
      const supabase = getSupabaseAuthClient();
      if (!supabase) {
        setStatus({ kind: "error", message: "パスワード設定にはSupabase Authの公開キー設定が必要です。" });
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const exchanged = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchanged.error) {
          setStatus({ kind: "error", message: "メールリンクの確認に失敗しました。もう一度メールを送信してください。" });
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error || !data.session?.user) {
        setStatus({ kind: "error", message: "パスワード設定用のセッションを確認できませんでした。メール内のリンクをもう一度開いてください。" });
        return;
      }

      setReady(true);
      setStatus({
        kind: "idle",
        message: mode === "recovery" ? "新しいパスワードを設定してください。" : "これから使うパスワードを設定してください。"
      });
    }

    prepareSession();

    return () => {
      cancelled = true;
    };
  }, [mode, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setStatus({ kind: "error", message: "パスワードは8文字以上で設定してください。" });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ kind: "error", message: "確認用パスワードが一致していません。" });
      return;
    }

    const supabase = getSupabaseAuthClient();
    if (!supabase) {
      setStatus({ kind: "error", message: "パスワード設定にはSupabase Authの公開キー設定が必要です。" });
      return;
    }

    setStatus({ kind: "loading", message: "パスワードを保存しています。" });
    const { data: sessionData } = await supabase.auth.getSession();
    const { error } = await supabase.auth.updateUser({ password });
    if (error || !sessionData.session?.user) {
      setStatus({ kind: "error", message: "パスワードを保存できませんでした。メールリンクを開き直してもう一度お試しください。" });
      return;
    }

    await completeClientRegistration({
      birth: readStoredBirth(),
      clientUserId: authClientUserId(sessionData.session.user.id),
      referralCode
    });
    setStatus({ kind: "success", message: "パスワードを設定しました。登録完了画面へ移動します。" });
    router.replace(buildRegistrationCompleteUrl(returnTo, "mail"));
  }

  return (
    <form className="auth-password-set-form" onSubmit={handleSubmit}>
      <p className={`form-status ${status.kind === "error" ? "error" : status.kind === "success" ? "success" : ""}`}>{status.message}</p>
      <label htmlFor="new-password">新しいパスワード</label>
      <input
        autoComplete="new-password"
        disabled={!ready || status.kind === "loading"}
        id="new-password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="8文字以上"
        type="password"
        value={password}
      />
      <label htmlFor="confirm-password">確認用パスワード</label>
      <input
        autoComplete="new-password"
        disabled={!ready || status.kind === "loading"}
        id="confirm-password"
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="もう一度入力"
        type="password"
        value={confirmPassword}
      />
      <button className="button primary" disabled={!ready || status.kind === "loading"} type="submit">
        パスワードを設定する
      </button>
    </form>
  );
}
