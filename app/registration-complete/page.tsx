import { Suspense } from "react";
import { GlobalNav } from "@/components/GlobalNav";
import { RegistrationCompleteActions } from "@/components/RegistrationCompleteActions";

export default function RegistrationCompletePage() {
  return (
    <main className="shell">
      <GlobalNav active="account" mark="✦" />
      <section className="panel form-panel completion-page">
        <Suspense fallback={<p className="form-status">登録完了画面を表示しています。</p>}>
          <RegistrationCompleteActions />
        </Suspense>
      </section>
    </main>
  );
}
