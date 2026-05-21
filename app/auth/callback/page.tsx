import { Suspense } from "react";
import { GlobalNav } from "@/components/GlobalNav";
import { AuthCallbackClient } from "@/components/AuthCallbackClient";

export default function AuthCallbackPage() {
  return (
    <main className="shell">
      <GlobalNav active="account" mark="✦" />
      <section className="panel form-panel" style={{ maxWidth: 720 }}>
        <div className="eyebrow">Membership</div>
        <h1 style={{ fontSize: "3.1rem" }}>登録を完了しています</h1>
        <p>登録が完了したら、元の画面へ自動で戻ります。</p>
        <Suspense fallback={<p className="form-status">登録情報を確認しています。</p>}>
          <AuthCallbackClient />
        </Suspense>
      </section>
    </main>
  );
}
