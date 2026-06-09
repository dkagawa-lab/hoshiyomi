import Link from "next/link";
import { addOnPack, servicePlans } from "@/lib/plans";

export default function CommercialDisclosurePage() {
  const standard = servicePlans.find((plan) => plan.key === "standard")!;
  const luxury = servicePlans.find((plan) => plan.key === "luxury")!;

  return (
    <main className="shell detail-shell">

      <section className="detail-hero">
        <div className="eyebrow">Commercial Disclosure</div>
        <h1>特定商取引法に基づく表記</h1>
        <p className="lead">有料プラン、追加相談枠、支払方法、解約、返金に関する表示です。</p>
      </section>

      <section className="detail-section legal-doc">
        <div className="legal-disclosure-table">
          <DisclosureRow label="販売事業者" value="HOSHIYOMI運営事務局" />
          <DisclosureRow label="運営責任者" value="HOSHIYOMI運営責任者" />
          <DisclosureRow label="所在地" value="所在地および電話番号は、法令に基づき請求があった場合、遅滞なく開示します。" />
          <DisclosureRow label="お問い合わせ先" value="お問い合わせフォーム、または support@hoshiyomi4u.com までご連絡ください。" />
          <DisclosureRow label="販売価格" value={`${standard.label}: ${standard.priceLabel}、${standard.renewalPriceLabel}。${luxury.label}: ${luxury.priceLabel}。${addOnPack.label}: ${addOnPack.priceLabel}。`} />
          <DisclosureRow label="商品代金以外の必要料金" value="インターネット接続料金、通信料金、決済事業者が定める手数料が発生する場合があります。" />
          <DisclosureRow label="支払方法" value="Stripe Checkoutで利用可能なクレジットカードその他の決済方法。" />
          <DisclosureRow label="支払時期" value="購入時または各月の更新時に決済されます。月額プランは解約されるまで自動更新されます。" />
          <DisclosureRow label="役務の提供時期" value="決済完了後、対象プランまたは追加相談枠が反映され次第、利用できます。" />
          <DisclosureRow label="解約方法" value="アカウント画面の支払い管理、またはお問い合わせフォームから受け付けます。" />
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
