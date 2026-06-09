"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFlowMode, resolveReturnTo } from "@/lib/authRegistrationClient";

type LiffApi = {
  getAccessToken: () => string | null;
  init: (input: { liffId: string }) => Promise<void>;
  isLoggedIn: () => boolean;
  login: (input?: { redirectUri?: string }) => void;
};

declare global {
  interface Window {
    liff?: LiffApi;
  }
}

export function LineLiffLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState("LINEアプリとの接続を確認しています。");
  const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID?.trim() || "";
  const payload = useMemo(() => resolveLiffPayload(searchParams), [searchParams]);

  useEffect(() => {
    if (!scriptReady) return;
    let cancelled = false;

    async function authenticate() {
      if (!liffId) {
        setStatus("LINEアプリ認証の設定が未完了です。通常のLINE登録からお試しください。");
        return;
      }
      const liff = window.liff;
      if (!liff) {
        setStatus("LINEアプリ認証を読み込めませんでした。もう一度お試しください。");
        return;
      }

      try {
        setStatus("LINEアプリで本人確認をしています。");
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          setStatus("LINEアプリの認証画面へ移動します。");
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const accessToken = liff.getAccessToken();
        if (!accessToken) {
          setStatus("LINE認証情報を取得できませんでした。もう一度お試しください。");
          return;
        }

        setStatus("HOSHIYOMIの登録情報にLINEをつないでいます。");
        const res = await fetch("/api/auth/line/liff", {
          body: JSON.stringify({ ...payload, accessToken }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
        if (!res.ok || !data.url) {
          setStatus(data.error || "LINE認証を完了できませんでした。もう一度お試しください。");
          return;
        }
        if (!cancelled) router.replace(data.url);
      } catch (error) {
        setStatus(error instanceof Error ? `LINE認証を完了できませんでした。${error.message}` : "LINE認証を完了できませんでした。もう一度お試しください。");
      }
    }

    authenticate();

    return () => {
      cancelled = true;
    };
  }, [liffId, payload, router, scriptReady]);

  return (
    <>
      <Script onLoad={() => setScriptReady(true)} src="https://static.line-scdn.net/liff/edge/2/sdk.js" strategy="afterInteractive" />
      <p className="form-status">{status}</p>
    </>
  );
}

function resolveLiffPayload(searchParams: ReturnType<typeof useSearchParams>) {
  const merged = new URLSearchParams();
  const stateParams = parseLiffState(searchParams.get("liff.state"));
  stateParams.forEach((value, key) => merged.set(key, value));
  searchParams.forEach((value, key) => {
    if (key !== "liff.state") merged.set(key, value);
  });

  return {
    flow: resolveFlow(merged.get("mode")),
    ref: merged.get("ref") || "",
    returnTo: resolveReturnTo(merged.get("returnTo"))
  };
}

function parseLiffState(value: string | null) {
  if (!value) return new URLSearchParams();
  const withoutHash = value.split("#")[0] || "";
  const queryIndex = withoutHash.indexOf("?");
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : withoutHash.replace(/^\?/, "");
  return new URLSearchParams(query);
}

function resolveFlow(value: string | null): AuthFlowMode {
  return value === "login" ? "login" : "signup";
}
