import { Suspense } from "react";
import { GlobalNav } from "@/components/GlobalNav";
import { AuthCallbackClient } from "@/components/AuthCallbackClient";

export default function AuthCallbackPage() {
  return (
    <main className="shell">
      <GlobalNav active="account" mark="✦" />
      <section className="panel form-panel auth-entry-page">
        <div className="eyebrow">Membership</div>
        <h1>認証を完了しています</h1>
        <p>確認が完了したら、元の画面へ自動で戻ります。</p>
        <Suspense fallback={<p className="form-status">認証情報を確認しています。</p>}>
          <AuthCallbackClient />
        </Suspense>
      </section>
    </main>
  );
}
