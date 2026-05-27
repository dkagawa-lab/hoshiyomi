"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureClientUserId } from "@/lib/clientIdentity";
import {
  AuthFlowMode,
  authClientCookieName,
  buildRegistrationCompleteUrl,
  completeClientRegistration,
  readCookieValue,
  readPendingReferralCode,
  readStoredBirth,
  resolveReturnTo
} from "@/lib/authRegistrationClient";

export function LineAuthCompleteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = resolveAuthFlow(searchParams.get("flow"));
  const [message, setMessage] = useState(flow === "login" ? "LINEログインを反映しています。" : "LINE登録を反映しています。");

  useEffect(() => {
    let cancelled = false;

    async function finishRegistration() {
      const returnTo = resolveReturnTo(searchParams.get("returnTo"));
      const referralCode = searchParams.get("ref") || readPendingReferralCode();
      const lineOrCanonicalClientUserId = readCookieValue(authClientCookieName);
      if (!lineOrCanonicalClientUserId) {
        const fallbackPath = flow === "login" ? "/login" : "/register";
        setMessage(flow === "login" ? "LINEログインの情報を確認できませんでした。ログイン画面に戻ります。" : "LINE登録の情報を確認できませんでした。登録画面に戻ります。");
        setTimeout(() => router.replace(`${fallbackPath}?returnTo=${encodeURIComponent(returnTo)}`), 1200);
        return;
      }
      const currentClientUserId = ensureClientUserId();
      const shouldKeepWebClient = lineOrCanonicalClientUserId.startsWith("line:") && currentClientUserId && currentClientUserId !== lineOrCanonicalClientUserId;
      await completeClientRegistration({
        authMethod: "line",
        birth: readStoredBirth(),
        clientUserId: shouldKeepWebClient ? currentClientUserId : lineOrCanonicalClientUserId,
        lineClientUserId: lineOrCanonicalClientUserId.startsWith("line:") ? lineOrCanonicalClientUserId : undefined,
        referralCode: flow === "login" ? "" : referralCode
      });
      if (!cancelled) router.replace(buildRegistrationCompleteUrl(returnTo, "line", flow));
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
