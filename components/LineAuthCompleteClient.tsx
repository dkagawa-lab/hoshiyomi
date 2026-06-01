"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthFlowMode,
  buildRegistrationCompleteUrl,
  completeClientRegistration,
  readPendingReferralCode,
  readStoredBirth,
  resolveReturnTo
} from "@/lib/authRegistrationClient";

export function LineAuthCompleteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = resolveAuthFlow(searchParams.get("flow"));
  const [message, setMessage] = useState(flow === "login" ? "LINEログインを反映しています。" : "LINE登録・友だち追加を反映しています。");

  useEffect(() => {
    let cancelled = false;

    async function finishRegistration() {
      const returnTo = resolveReturnTo(searchParams.get("returnTo"));
      const referralCode = searchParams.get("ref") || readPendingReferralCode();
      const lineClientUserId = await readLineSessionClientUserId();
      if (!lineClientUserId) {
        const fallbackPath = flow === "login" ? "/login" : "/register";
        setMessage(flow === "login" ? "LINEログインの情報を確認できませんでした。ログイン画面に戻ります。" : "LINE登録・友だち追加の情報を確認できませんでした。登録画面に戻ります。");
        setTimeout(() => router.replace(`${fallbackPath}?returnTo=${encodeURIComponent(returnTo)}`), 1200);
        return;
      }
      await completeClientRegistration({
        authMethod: "line",
        birth: readStoredBirth(),
        clientUserId: lineClientUserId,
        lineClientUserId,
        referralCode
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

async function readLineSessionClientUserId() {
  try {
    const res = await fetch("/api/auth/line/session", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { clientUserId?: unknown };
    return typeof data.clientUserId === "string" && data.clientUserId.startsWith("line:") ? data.clientUserId : "";
  } catch {
    return "";
  }
}

function resolveAuthFlow(value: string | null): AuthFlowMode {
  return value === "login" ? "login" : "signup";
}
