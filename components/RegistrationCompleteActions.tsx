"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveReturnTo } from "@/lib/authRegistrationClient";

const signupMethodLabels: Record<string, string> = {
  google: "Google登録",
  line: "LINE登録",
  mail: "メール登録"
};

const loginMethodLabels: Record<string, string> = {
  google: "Googleログイン",
  line: "LINEログイン",
  mail: "メールログイン"
};

export function RegistrationCompleteActions() {
  const searchParams = useSearchParams();
  const returnTo = resolveReturnTo(searchParams.get("returnTo"));
  const method = searchParams.get("method") || "mail";
  const flow = searchParams.get("flow") === "login" ? "login" : "signup";
  const methodLabel = flow === "login" ? loginMethodLabels[method] || "ログイン" : signupMethodLabels[method] || "会員登録";
  const primary = resolvePrimaryAction(returnTo);

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
        <Link className="button" href="/consultation">
          この星で相談する
        </Link>
        <Link className="button" href="/account">
          登録情報を見る
        </Link>
      </div>
    </div>
  );
}

function resolvePrimaryAction(returnTo: string) {
  if (returnTo === "/reading") return { href: "/reading", label: "続きを見る" };
  if (returnTo === "/consultation") return { href: "/consultation", label: "相談へ戻る" };
  if (returnTo === "/dashboard") return { href: "/dashboard", label: "星の確認へ" };
  if (returnTo === "/pricing") return { href: "/pricing", label: "プランを見る" };
  return { href: "/account", label: "登録情報へ進む" };
}
