import { Suspense } from "react";
import { GlobalNav } from "@/components/GlobalNav";
import { LineAuthCompleteClient } from "@/components/LineAuthCompleteClient";

export default function LineAuthCompletePage() {
  return (
    <main className="shell">
      <GlobalNav active="account" mark="✦" />
      <section className="panel form-panel" style={{ maxWidth: 720 }}>
        <div className="eyebrow">LINE Membership</div>
        <h1 style={{ fontSize: "3.1rem" }}>LINE登録を完了しています</h1>
        <p>登録が完了したら、元の画面へ自動で戻ります。</p>
        <Suspense fallback={<p className="form-status">LINE登録を反映しています。</p>}>
          <LineAuthCompleteClient />
        </Suspense>
      </section>
    </main>
  );
}
