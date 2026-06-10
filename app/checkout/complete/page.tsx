import { Suspense } from "react";
import { CheckoutCompleteActions } from "@/components/CheckoutCompleteActions";
import { ConversionPing } from "@/components/ConversionPing";

export default function CheckoutCompletePage() {
  return (
    <main className="shell">
      <ConversionPing lineConversionType="Purchase" metaEvent="Purchase" metaParams={{ currency: "JPY", value: 480 }} />
      <section className="panel form-panel completion-page">
        <Suspense fallback={<p className="form-status">決済完了画面を表示しています。</p>}>
          <CheckoutCompleteActions />
        </Suspense>
      </section>
    </main>
  );
}
