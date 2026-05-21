import Link from "next/link";
import { Suspense } from "react";
import { GlobalNav } from "@/components/GlobalNav";
import { PasswordSetupClient } from "@/components/PasswordSetupClient";

export default function PasswordPage() {
  return (
    <main className="shell">
      <GlobalNav active="account" mark="✦" />
      <section className="panel form-panel auth-password-page">
        <div className="eyebrow">Password</div>
        <h1>パスワード設定</h1>
        <p>メール内のリンク確認後、HOSHIYOMIで使うパスワードを設定できます。</p>
        <Suspense fallback={<p className="form-status">メールリンクを確認しています。</p>}>
          <PasswordSetupClient />
        </Suspense>
        <Link className="text-link" href="/register">
          登録画面へ戻る
        </Link>
      </section>
    </main>
  );
}
