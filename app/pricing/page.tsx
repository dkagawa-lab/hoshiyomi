import { GlobalNav } from "@/components/GlobalNav";
import { PricingPanel } from "@/components/PricingPanel";
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="shell pricing-page">
      <GlobalNav active="consultation" />
      <section className="panel pricing-hero">
        <div className="eyebrow">Reading Plans</div>
        <h1>相談を重ねるほど、あなたの運命に寄り添える</h1>
        <p>
          恋愛、仕事、相性、将来の迷いを、同じ星の文脈のまま深く見ていけます。今のあなたに合う相談回数、回答の深さ、占い師タイプをお選びください。
        </p>
        <div className="actions compact-actions">
          <Link className="button primary" href="/m">
            今すぐ占う
          </Link>
          <Link className="button" href="/consultation">
            相談画面へ
          </Link>
        </div>
      </section>
      <PricingPanel />
      <section className="pricing-legal-links" aria-label="決済前に確認する情報">
        <Link className="text-link" href="/legal/payment-terms">
          決済・サブスクリプション条件
        </Link>
        <Link className="text-link" href="/legal/commercial-disclosure">
          特定商取引法に基づく表記
        </Link>
        <Link className="text-link" href="/contact">
          決済について問い合わせる
        </Link>
      </section>
    </main>
  );
}
