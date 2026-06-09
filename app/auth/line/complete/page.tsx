import { Suspense } from "react";
import { LineAuthCompleteClient } from "@/components/LineAuthCompleteClient";

export default function LineAuthCompletePage() {
  return (
    <main className="shell">
      <section className="panel form-panel auth-entry-page">
        <div className="eyebrow">LINE Membership</div>
        <h1>LINE認証を完了しています</h1>
        <p>確認が完了したら、元の画面へ自動で戻ります。</p>
        <Suspense fallback={<p className="form-status">LINE認証を反映しています。</p>}>
          <LineAuthCompleteClient />
        </Suspense>
      </section>
    </main>
  );
}
