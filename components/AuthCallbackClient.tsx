"use client";

import { useEffect, useState } from "react";
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

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("登録情報を確認しています。");

  useEffect(() => {
    let cancelled = false;

    async function finishRegistration() {
      const supabase = getSupabaseAuthClient();
      const returnTo = resolveReturnTo(searchParams.get("returnTo"));
      const referralCode = searchParams.get("ref") || readPendingReferralCode();
      if (!supabase) {
        setMessage("登録設定がまだ完了していません。登録画面に戻ります。");
        setTimeout(() => router.replace(`/register?returnTo=${encodeURIComponent(returnTo)}`), 900);
        return;
      }

      const code = searchParams.get("code");
      const exchanged = code ? await supabase.auth.exchangeCodeForSession(code) : null;
      const sessionResult = exchanged?.data.session ? exchanged : await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionResult.error || !sessionResult.data.session?.user) {
        setMessage("登録状態を確認できませんでした。もう一度登録画面からお試しください。");
        setTimeout(() => router.replace(`/register?returnTo=${encodeURIComponent(returnTo)}`), 1400);
        return;
      }

      setMessage("あなたの星と登録情報を結びつけています。");
      await completeClientRegistration({
        birth: readStoredBirth(),
        clientUserId: authClientUserId(sessionResult.data.session.user.id),
        referralCode
      });
      if (!cancelled) router.replace(buildRegistrationCompleteUrl(returnTo, "google"));
    }

    finishRegistration();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return <p className="form-status">{message}</p>;
}
