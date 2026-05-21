import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";
import { addOnPack, servicePlans } from "@/lib/plans";

export default function CommercialDisclosurePage() {
  const standard = servicePlans.find((plan) => plan.key === "standard")!;
  const luxury = servicePlans.find((plan) => plan.key === "luxury")!;

  return (
    <main className="shell detail-shell">
      <GlobalNav active="support" mark="☉" />

      <section className="detail-hero">
        <div className="eyebrow">Commercial Disclosure</div>
        <h1>特定商取引法に基づく表記</h1>
        <p className="lead">通信販売に必要な表示項目です。正式公開前に、販売事業者名、所在地、連絡先、販売責任者を実情報へ差し替えてください。</p>
      </section>

      <section className="detail-section legal-doc">
        <div className="legal-disclosure-table">
          <DisclosureRow label="販売事業者" value="公開前に正式な事業者名を入力してください" />
          <DisclosureRow label="運営責任者" value="公開前に正式な責任者名を入力してください" />
          <DisclosureRow label="所在地" value="公開前に正式な所在地を入力してください。個人事業の場合の表示方法は専門家に確認してください。" />
          <DisclosureRow label="お問い合わせ先" value="お問い合わせフォームよりご連絡ください。公開前にメールアドレスを追記してください。" />
          <DisclosureRow label="販売価格" value={`${standard.label}: ${standard.priceLabel}、${standard.renewalPriceLabel}。${luxury.label}: ${luxury.priceLabel}。${addOnPack.label}: ${addOnPack.priceLabel}。`} />
          <DisclosureRow label="商品代金以外の必要料金" value="インターネット接続料金、通信料金、決済事業者が定める手数料が発生する場合があります。" />
          <DisclosureRow label="支払方法" value="Stripe Checkoutで利用可能なクレジットカードその他の決済方法。" />
          <DisclosureRow label="支払時期" value="購入時または各月の更新時に決済されます。月額プランは解約されるまで自動更新されます。" />
          <DisclosureRow label="役務の提供時期" value="決済完了後、対象プランまたは追加相談枠が反映され次第、利用できます。" />
          <DisclosureRow label="解約方法" value="アカウント画面またはお問い合わせフォームから受け付けます。Stripeカスタマーポータル導入後は、専用画面から解約できます。" />
          <DisclosureRow label="返品・キャンセル" value="デジタルサービスの性質上、提供開始後の返金は原則として行いません。二重決済、誤課金、システム障害の場合は個別に確認します。" />
          <DisclosureRow label="動作環境" value="最新版の主要ブラウザを推奨します。通信環境や端末により、一部機能が利用できない場合があります。" />
          <DisclosureRow label="表現および商品に関する注意" value="本サービスは占星術に基づく鑑定・自己理解のためのサービスであり、特定の未来や結果を保証するものではありません。" />
        </div>

        <div className="legal-page-links">
          <Link className="button" href="/legal/payment-terms">
            決済条件を見る
          </Link>
          <Link className="button" href="/contact">
            問い合わせる
          </Link>
        </div>
      </section>
    </main>
  );
}

function DisclosureRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="legal-disclosure-row">
      <strong>{label}</strong>
      <p>{value}</p>
    </div>
  );
}
