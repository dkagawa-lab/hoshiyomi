"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureClientUserId } from "@/lib/clientIdentity";
import {
  authClientUserId,
  buildAuthRedirectUrl,
  buildPasswordRedirectUrl,
  buildRegistrationCompleteUrl,
  completeClientRegistration,
  getSupabaseAuthClient,
  isSupabaseAuthConfigured,
  readStoredBirth,
  registerButtonLabel,
  rememberPendingReferralCode,
  resolveReturnTo
} from "@/lib/authRegistrationClient";

type AuthStatus = {
  kind: "idle" | "success" | "error" | "loading";
  message: string;
};

export function RegisterActions() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [returnTo, setReturnTo] = useState("/account");
  const [status, setStatus] = useState<AuthStatus>({ kind: "idle", message: "" });
  const supabaseConfigured = isSupabaseAuthConfigured();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref") || "";
    const authError = params.get("authError") || "";
    setReferralCode(code);
    setReturnTo(resolveReturnTo(params.get("returnTo")));
    if (code) rememberPendingReferralCode(code);
    if (authError === "line_not_configured") {
      setStatus({
        kind: "error",
        message: "LINE登録は、LINE Developersのチャネル設定後に有効になります。先にメールまたはGoogleで登録できます。"
      });
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseAuthClient();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) return;
      const clientUserId = authClientUserId(data.session.user.id);
      await completeClientRegistration({ birth: readStoredBirth(), clientUserId, referralCode });
    });
  }, [referralCode]);

  const lineHref = useMemo(() => {
    const params = new URLSearchParams({ returnTo });
    if (referralCode.trim()) params.set("ref", referralCode.trim());
    return `/api/auth/line/login?${params.toString()}`;
  }, [referralCode, returnTo]);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setStatus({ kind: "error", message: "メールアドレスを入力してください。" });
      return;
    }
    const supabase = getSupabaseAuthClient();
    if (!supabase) {
      setStatus({ kind: "error", message: "メール登録を使うには、Supabase Authの公開キー設定が必要です。" });
      return;
    }
    rememberPendingReferralCode(referralCode);
    setStatus({ kind: "loading", message: "パスワード設定用のメールを送信しています。" });
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: buildPasswordRedirectUrl(returnTo, referralCode, "signup"),
        shouldCreateUser: true
      }
    });
    if (error) {
      setStatus({ kind: "error", message: "メール送信に失敗しました。アドレスを確認してもう一度お試しください。" });
      return;
    }
    setStatus({ kind: "success", message: "メールを送りました。メール内のリンクを開き、パスワードを設定すると登録が完了します。" });
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setStatus({ kind: "error", message: "メールアドレスとパスワードを入力してください。" });
      return;
    }
    const supabase = getSupabaseAuthClient();
    if (!supabase) {
      setStatus({ kind: "error", message: "メールログインを使うには、Supabase Authの公開キー設定が必要です。" });
      return;
    }
    setStatus({ kind: "loading", message: "登録情報を確認しています。" });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword
    });
    if (error || !data.user) {
      setStatus({ kind: "error", message: "メールアドレスまたはパスワードが違います。" });
      return;
    }
    await completeClientRegistration({ birth: readStoredBirth(), clientUserId: authClientUserId(data.user.id), referralCode });
    router.push(buildRegistrationCompleteUrl(returnTo, "mail"));
  }

  async function handleGoogleSignIn() {
    const supabase = getSupabaseAuthClient();
    if (!supabase) {
      setStatus({ kind: "error", message: "Google登録を使うには、Supabase Authの公開キー設定が必要です。" });
      return;
    }
    rememberPendingReferralCode(referralCode);
    setStatus({ kind: "loading", message: "Googleの登録画面へ移動します。" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildAuthRedirectUrl(returnTo, referralCode)
      }
    });
    if (error) {
      setStatus({ kind: "error", message: "Google登録を開始できませんでした。設定を確認してください。" });
    }
  }

  async function registerDemoMember() {
    const clientUserId = ensureClientUserId();
    setStatus({ kind: "loading", message: "開発用の登録として保存しています。" });
    await completeClientRegistration({ birth: readStoredBirth(), clientUserId, referralCode });
    router.push(buildRegistrationCompleteUrl(returnTo, "mail"));
  }

  return (
    <div className="auth-register">
      <div className="auth-method-grid">
        <form className="auth-email-form" onSubmit={handleEmailSubmit}>
          <label htmlFor="register-email">メールアドレスで登録</label>
          <div>
            <input
              autoComplete="email"
              id="register-email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
            <button className="button primary" disabled={status.kind === "loading"} type="submit">
              メールで登録する
            </button>
          </div>
        </form>

        <form className="auth-password-form" onSubmit={handlePasswordSignIn}>
          <div className="auth-section-heading">
            <strong>登録済みの方</strong>
            <Link href="/forgot-password">パスワードを忘れた方</Link>
          </div>
          <div className="auth-password-fields">
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="メールアドレス"
              type="email"
              value={loginEmail}
            />
            <input
              autoComplete="current-password"
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="パスワード"
              type="password"
              value={loginPassword}
            />
            <button className="button" disabled={status.kind === "loading"} type="submit">
              メールでログインする
            </button>
          </div>
        </form>

        <button className="button auth-provider-button" disabled={status.kind === "loading"} onClick={handleGoogleSignIn} type="button">
          Googleで登録する
        </button>

        <a className="button auth-provider-button line" href={lineHref} onClick={() => rememberPendingReferralCode(referralCode)}>
          LINEで登録する
        </a>
      </div>

      {!supabaseConfigured ? (
        <div className="auth-dev-fallback">
          <p>本番のメール・Google登録にはSupabase Authの設定が必要です。開発中だけ、下のボタンで現在の端末に保存して確認できます。</p>
          <button className="button subtle" disabled={status.kind === "loading"} onClick={registerDemoMember} type="button">
            {registerButtonLabel(returnTo)}
          </button>
        </div>
      ) : null}

      {status.message ? <p className={`form-status ${status.kind === "error" ? "error" : status.kind === "success" ? "success" : ""}`}>{status.message}</p> : null}
    </div>
  );
}
