"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resolveReturnTo } from "@/lib/authRegistrationClient";
import { readPendingCheckoutIntent } from "@/lib/checkoutIntent";
import { ensureClientUserId } from "@/lib/clientIdentity";
import { getLineFriendUrl } from "@/lib/lineLinks";

const signupMethodLabels: Record<string, string> = {
  google: "Google登録",
  line: "LINE登録・友だち追加",
  mail: "メール登録"
};

const loginMethodLabels: Record<string, string> = {
  google: "Googleログイン",
  line: "LINEログイン",
  mail: "メールログイン"
};

export function RegistrationCompleteActions() {
  const searchParams = useSearchParams();
  const [lineConnectHref, setLineConnectHref] = useState("");
  const [hasPendingCheckout, setHasPendingCheckout] = useState(false);
  const returnTo = resolveReturnTo(searchParams.get("returnTo"));
  const method = searchParams.get("method") || "mail";
  const flow = searchParams.get("flow") === "login" ? "login" : "signup";
  const methodLabel = flow === "login" ? loginMethodLabels[method] || "ログイン" : signupMethodLabels[method] || "会員登録";
  const primary = resolvePrimaryAction(returnTo, hasPendingCheckout);
  const lineFriendUrl = getLineFriendUrl();
  const isLineMethod = method === "line";
  const showConsultationAction = returnTo !== "/consultation";

  useEffect(() => {
    const params = new URLSearchParams({
      clientUserId: ensureClientUserId(),
      mode: "signup",
      returnTo: "/account"
    });
    setLineConnectHref(`/api/auth/line/login?${params.toString()}`);
    setHasPendingCheckout(Boolean(readPendingCheckoutIntent()));
  }, []);

  return (
    <div className="registration-complete-card">
      <div className="completion-mark" aria-hidden="true">
        ✓
      </div>
      <div className="eyebrow">{methodLabel}</div>
      <h1>{flow === "login" ? "ログインしました" : "登録が完了しました"}</h1>
      <p>
        {flow === "login"
          ? "保存されている星の情報を読み込みました。続きの相談や鑑定履歴は、同じ星の文脈で確認できます。"
          : "あなたの星の情報を保存できるようになりました。相談を重ねるほど、同じ星の文脈を引き継いで読み解けます。"}
      </p>
      <div className="completion-actions">
        <Link className="button primary" href={primary.href}>
          {primary.label}
        </Link>
        {showConsultationAction ? (
          <Link className="button" href="/consultation">
            この星で相談する
          </Link>
        ) : null}
        {isLineMethod && lineFriendUrl ? (
          <a className="button auth-provider-button line" href={lineFriendUrl} rel="noreferrer" target="_blank">
            LINEで相談を開く
          </a>
        ) : null}
        <Link className="button" href="/account">
          登録情報を見る
        </Link>
      </div>
      <div className="registration-line-guide">
        <strong>{isLineMethod ? "LINEから、そのまま相談できます。" : "LINEでも相談したい場合は、LINEで登録・友だち追加できます。"}</strong>
        <p>
          {isLineMethod
            ? "LINE登録の流れの中で公式アカウントの友だち追加画面が表示されます。登録済みの星と鑑定履歴を引き継いだまま、LINEのメッセージで質問できます。"
            : "メール・Googleで登録した場合も、LINE登録・友だち追加を済ませると、あなたの星の記憶をLINEに引き継げます。"}
        </p>
        {!isLineMethod && lineConnectHref ? (
          <div className="registration-line-actions">
            <a className="button primary auth-provider-button line" href={lineConnectHref}>
              LINEで登録・友だち追加
            </a>
            <span>完了後は、Webで登録した星の情報を使ってLINEから相談できます。</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function resolvePrimaryAction(returnTo: string, hasPendingCheckout: boolean) {
  if (returnTo === "/reading") return { href: "/reading", label: "続きを見る" };
  if (returnTo === "/consultation") return { href: "/consultation", label: "相談へ戻る" };
  if (returnTo === "/dashboard") return { href: "/dashboard", label: "星の確認へ" };
  if (returnTo === "/pricing") return { href: "/pricing", label: hasPendingCheckout ? "決済へ進む" : "プランを見る" };
  return { href: "/account", label: "登録情報へ進む" };
}
