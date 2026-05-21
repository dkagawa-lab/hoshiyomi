"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  authClientCookieName,
  completeClientRegistration,
  readCookieValue,
  readPendingReferralCode,
  readStoredBirth,
  resolveReturnTo
} from "@/lib/authRegistrationClient";

export function LineAuthCompleteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("LINE登録を反映しています。");

  useEffect(() => {
    let cancelled = false;

    async function finishRegistration() {
      const returnTo = resolveReturnTo(searchParams.get("returnTo"));
      const referralCode = searchParams.get("ref") || readPendingReferralCode();
      const clientUserId = readCookieValue(authClientCookieName);
      if (!clientUserId) {
        setMessage("LINE登録の情報を確認できませんでした。登録画面に戻ります。");
        setTimeout(() => router.replace(`/register?returnTo=${encodeURIComponent(returnTo)}`), 1200);
        return;
      }
      await completeClientRegistration({ birth: readStoredBirth(), clientUserId, referralCode });
      if (!cancelled) router.replace(returnTo);
    }

    finishRegistration();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return <p className="form-status">{message}</p>;
}
