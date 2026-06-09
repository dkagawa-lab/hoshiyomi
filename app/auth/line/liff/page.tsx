import { Suspense } from "react";
import { LineLiffLoginClient } from "@/components/LineLiffLoginClient";

export default function LineLiffPage() {
  return (
    <main className="shell">
      <section className="panel form-panel auth-line-complete-page">
        <div className="eyebrow">LINE App Auth</div>
        <h1>LINEアプリで認証しています</h1>
        <Suspense fallback={<p className="form-status">LINE認証を準備しています。</p>}>
          <LineLiffLoginClient />
        </Suspense>
      </section>
    </main>
  );
}
