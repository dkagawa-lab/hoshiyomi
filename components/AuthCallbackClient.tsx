"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthFlowMode,
  authClientUserId,
  buildRegistrationCompleteUrl,
  completeClientRegistration,
  getSupabaseAuthClient,
  readPendingReferralCode,
  readStoredBirth,
  resolveReturnTo
} from "@/lib/authRegistrationClient";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = resolveAuthFlow(searchParams.get("flow"));
  const [message, setMessage] = useState(flow === "login" ? "ログイン情報を確認しています。" : "登録情報を確認しています。");

  useEffect(() => {
    let cancelled = false;

    async function finishRegistration() {
      const supabase = getSupabaseAuthClient();
      const returnTo = resolveReturnTo(searchParams.get("returnTo"));
      const fallbackPath = flow === "login" ? "/login" : "/register";
      const referralCode = searchParams.get("ref") || readPendingReferralCode();
      if (!supabase) {
        setMessage(flow === "login" ? "ログイン設定がまだ完了していません。ログイン画面に戻ります。" : "登録設定がまだ完了していません。登録画面に戻ります。");
        setTimeout(() => router.replace(`${fallbackPath}?returnTo=${encodeURIComponent(returnTo)}`), 900);
        return;
      }

      const code = searchParams.get("code");
      const exchanged = code ? await supabase.auth.exchangeCodeForSession(code) : null;
      const sessionResult = exchanged?.data.session ? exchanged : await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionResult.error || !sessionResult.data.session?.user) {
        setMessage(flow === "login" ? "ログイン状態を確認できませんでした。もう一度ログイン画面からお試しください。" : "登録状態を確認できませんでした。もう一度登録画面からお試しください。");
        setTimeout(() => router.replace(`${fallbackPath}?returnTo=${encodeURIComponent(returnTo)}`), 1400);
        return;
      }

      setMessage(flow === "login" ? "保存されている星の情報を読み込んでいます。" : "あなたの星と登録情報を結びつけています。");
      await completeClientRegistration({
        birth: readStoredBirth(),
        clientUserId: authClientUserId(sessionResult.data.session.user.id),
        referralCode: flow === "login" ? "" : referralCode
      });
      if (!cancelled) router.replace(buildRegistrationCompleteUrl(returnTo, "google", flow));
    }

    finishRegistration();

    return () => {
      cancelled = true;
    };
  }, [flow, router, searchParams]);

  return <p className="form-status">{message}</p>;
}

function resolveAuthFlow(value: string | null): AuthFlowMode {
  return value === "login" ? "login" : "signup";
}
