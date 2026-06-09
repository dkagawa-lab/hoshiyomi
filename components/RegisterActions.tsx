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
  readAuthMethod,
  readStoredBirth,
  registerButtonLabel,
  rememberPendingReferralCode,
  resolveReturnTo
} from "@/lib/authRegistrationClient";

type AuthStatus = {
  kind: "idle" | "success" | "error" | "loading";
  message: string;
};

type RegisterActionsProps = {
  mode?: "register" | "login";
};

export function RegisterActions({ mode = "register" }: RegisterActionsProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [currentClientUserId, setCurrentClientUserId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [returnTo, setReturnTo] = useState("/account");
  const [status, setStatus] = useState<AuthStatus>({ kind: "idle", message: "" });
  const [legalConsent, setLegalConsent] = useState(mode === "login");
  const supabaseConfigured = isSupabaseAuthConfigured();
  const isLoginMode = mode === "login";
  const authFlow = isLoginMode ? "login" : "signup";
  const canStartAuth = isLoginMode || legalConsent;
  const lineLiffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID?.trim() || "";

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
        message: isLoginMode
          ? "LINEログインは、LINE Developersのチャネル設定後に有効になります。先にメールまたはGoogleでログインできます。"
          : "LINE登録・友だち追加は、LINE Developersのチャネル設定後に有効になります。先にメールまたはGoogleで登録できます。"
      });
    } else if (authError === "line_failed") {
      setStatus({
        kind: "error",
        message: isLoginMode
          ? "LINEログインを完了できませんでした。もう一度LINEでログインするか、メール・Googleでログインしてください。"
          : "LINE登録・友だち追加を完了できませんでした。もう一度LINEで進むか、メール・Googleで登録してください。"
      });
    }
    setCurrentClientUserId(ensureClientUserId());
  }, [isLoginMode]);

  useEffect(() => {
    const supabase = getSupabaseAuthClient();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) return;
      const clientUserId = authClientUserId(data.session.user.id);
      const provider = typeof data.session.user.app_metadata?.provider === "string" ? data.session.user.app_metadata.provider : "";
      const authMethod = provider === "google" ? "google" : readAuthMethod() || "mail";
      setCurrentClientUserId(clientUserId);
      await completeClientRegistration({ authMethod, birth: readStoredBirth(), clientUserId, referralCode });
    });
  }, [referralCode]);

  const lineHref = useMemo(() => {
    const params = new URLSearchParams({ returnTo, mode: authFlow });
    if (currentClientUserId) params.set("clientUserId", currentClientUserId);
    if (referralCode.trim()) params.set("ref", referralCode.trim());
    return lineLiffId ? `https://liff.line.me/${encodeURIComponent(lineLiffId)}?${params.toString()}` : `/api/auth/line/login?${params.toString()}`;
  }, [authFlow, currentClientUserId, lineLiffId, referralCode, returnTo]);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ensureLegalConsent()) return;
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
    setStatus({ kind: "loading", message: "ログイン情報を確認しています。" });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword
    });
    if (error || !data.user) {
      setStatus({ kind: "error", message: "メールアドレスまたはパスワードが違います。" });
      return;
    }
    await completeClientRegistration({ authMethod: "mail", birth: readStoredBirth(), clientUserId: authClientUserId(data.user.id), referralCode });
    router.push(buildRegistrationCompleteUrl(returnTo, "mail", authFlow));
  }

  async function handleGoogleSignIn() {
    if (!ensureLegalConsent()) return;
    const supabase = getSupabaseAuthClient();
    if (!supabase) {
      setStatus({ kind: "error", message: isLoginMode ? "Googleログインを使うには、Supabase Authの公開キー設定が必要です。" : "Google登録を使うには、Supabase Authの公開キー設定が必要です。" });
      return;
    }
    rememberPendingReferralCode(referralCode);
    setStatus({ kind: "loading", message: isLoginMode ? "Googleログインへ移動します。" : "Googleの登録画面へ移動します。" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildAuthRedirectUrl(returnTo, referralCode, authFlow)
      }
    });
    if (error) {
      setStatus({ kind: "error", message: isLoginMode ? "Googleログインを開始できませんでした。設定を確認してください。" : "Google登録を開始できませんでした。設定を確認してください。" });
    }
  }

  async function registerDemoMember() {
    if (!ensureLegalConsent()) return;
    const clientUserId = ensureClientUserId();
    setStatus({ kind: "loading", message: "開発用の登録として保存しています。" });
    await completeClientRegistration({ authMethod: "local", birth: readStoredBirth(), clientUserId, referralCode });
    router.push(buildRegistrationCompleteUrl(returnTo, "mail", "signup"));
  }

  function ensureLegalConsent() {
    if (isLoginMode || legalConsent) return true;
    setStatus({ kind: "error", message: "新規登録には、利用規約・プライバシーポリシー・決済条件への同意が必要です。" });
    return false;
  }

  return (
    <div className={`auth-register ${isLoginMode ? "auth-login" : ""}`}>
      {!isLoginMode ? (
        <label className="contact-consent auth-consent">
          <input checked={legalConsent} onChange={(event) => setLegalConsent(event.target.checked)} type="checkbox" />
          <span>
            <Link className="text-link" href="/terms">利用規約</Link>、
            <Link className="text-link" href="/privacy">プライバシーポリシー</Link>、
            <Link className="text-link" href="/legal/payment-terms">決済・サブスクリプション条件</Link>
            に同意します。鑑定文作成のため、出生情報や相談内容が外部サービスへ送信される場合があることを確認しました。
          </span>
        </label>
      ) : null}

      <div className="auth-method-grid">
        <div className="auth-referral-panel">
          <label htmlFor="auth-referral-code">紹介コード</label>
          <div>
            <input
              autoComplete="off"
              id="auth-referral-code"
              onChange={(event) => {
                setReferralCode(event.target.value);
                rememberPendingReferralCode(event.target.value);
              }}
              placeholder="紹介リンクから来た場合は自動入力されます"
              value={referralCode}
            />
          </div>
          <p>紹介コードがある場合は、登録またはログイン完了後に相談枠が付与されます。</p>
        </div>

        {isLoginMode ? (
          <form className="auth-password-form" onSubmit={handlePasswordSignIn}>
            <div className="auth-section-heading">
              <strong>メールアドレスでログイン</strong>
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
              <button className="button primary" disabled={status.kind === "loading"} type="submit">
                ログインする
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-email-form" onSubmit={handleEmailSubmit}>
            <label htmlFor="register-email">メールアドレスで新規登録</label>
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
              <button className="button primary" disabled={status.kind === "loading" || !canStartAuth} type="submit">
                登録メールを受け取る
              </button>
            </div>
          </form>
        )}

        <button className="button auth-provider-button" disabled={status.kind === "loading" || !canStartAuth} onClick={handleGoogleSignIn} type="button">
          {isLoginMode ? "Googleでログイン" : "Googleで新規登録"}
        </button>

        <a
          aria-disabled={!canStartAuth || status.kind === "loading"}
          className={`button auth-provider-button line ${!canStartAuth || status.kind === "loading" ? "disabled" : ""}`}
          href={canStartAuth && status.kind !== "loading" ? lineHref : "#"}
          onClick={(event) => {
            if (!ensureLegalConsent() || status.kind === "loading") {
              event.preventDefault();
              return;
            }
            rememberPendingReferralCode(referralCode);
          }}
        >
          {lineLiffId ? (isLoginMode ? "LINEアプリでログイン" : "LINEアプリで登録・友だち追加") : isLoginMode ? "LINEでログイン" : "LINEで登録・友だち追加"}
        </a>
      </div>

      <div className="auth-switch-panel">
        {isLoginMode ? (
          <>
            <strong>初めて使う方</strong>
            <span>初めての方は、新規登録から始めてください。</span>
            <Link className="text-link" href={`/register?returnTo=${encodeURIComponent(returnTo)}${referralCode.trim() ? `&ref=${encodeURIComponent(referralCode.trim())}` : ""}`}>
              新規登録へ進む
            </Link>
          </>
        ) : (
          <>
            <strong>すでに登録済みの方</strong>
            <span>登録済みのメール、Google、LINEで</span>
            <span>ログインできます。</span>
            <Link className="text-link" href={`/login?returnTo=${encodeURIComponent(returnTo)}${referralCode.trim() ? `&ref=${encodeURIComponent(referralCode.trim())}` : ""}`}>
              ログインへ進む
            </Link>
          </>
        )}
      </div>

      {!supabaseConfigured && !isLoginMode ? (
        <div className="auth-dev-fallback">
          <p>本番のメール・Google登録にはSupabase Authの設定が必要です。開発中だけ、下のボタンで現在の端末に保存して確認できます。</p>
          <button className="button subtle" disabled={status.kind === "loading" || !canStartAuth} onClick={registerDemoMember} type="button">
            {registerButtonLabel(returnTo)}
          </button>
        </div>
      ) : null}

      {status.message ? <p className={`form-status ${status.kind === "error" ? "error" : status.kind === "success" ? "success" : ""}`}>{status.message}</p> : null}
    </div>
  );
}
