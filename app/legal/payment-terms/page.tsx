import Link from "next/link";
import { addOnPack, servicePlans } from "@/lib/plans";

const paidPlans = servicePlans.filter((plan) => plan.key !== "free");

export default function PaymentTermsPage() {
  return (
    <main className="shell detail-shell">

      <section className="detail-hero">
        <div className="eyebrow">Payment Terms</div>
        <h1>決済・サブスクリプション条件</h1>
        <p className="lead">有料プラン、追加相談枠、更新、解約、返金に関する条件です。Stripe本番接続前に、実際の料金・提供条件と一致しているか確認してください。</p>
      </section>

      <section className="detail-section legal-doc">
        <article className="terms-block">
          <h2>1. 有料プラン</h2>
          <div className="legal-table">
            {paidPlans.map((plan) => (
              <div className="legal-table-row" key={plan.key}>
                <strong>{plan.label}</strong>
                <span>{plan.priceLabel}{plan.renewalPriceLabel ? ` / ${plan.renewalPriceLabel}` : ""}</span>
                <p>{plan.answerDisplay}。{plan.regulations.join("。")}。</p>
              </div>
            ))}
            <div className="legal-table-row">
              <strong>{addOnPack.label}</strong>
              <span>{addOnPack.priceLabel}</span>
              <p>{addOnPack.description}</p>
            </div>
          </div>
        </article>

        <article className="terms-block">
          <h2>2. 決済方法</h2>
          <p>
            有料プランおよび追加相談枠の決済は、Stripe Checkoutを通じて処理します。利用可能な支払い方法は、Stripeの画面に表示される方法に従います。本サービスではカード番号などの完全な決済情報を保持しません。
          </p>
        </article>

        <article className="terms-block">
          <h2>3. 自動更新</h2>
          <p>
            月額プランは、解約されるまで毎月自動更新されます。通常プランの初回割引を利用した場合、2ヶ月目以降は表示された通常月額で更新されます。
          </p>
        </article>

        <article className="terms-block">
          <h2>4. 解約</h2>
          <p>
            解約は、アカウント画面の支払い管理、またはお問い合わせから受け付けます。解約後も、既に支払い済みの利用期間中はプラン特典を利用できる場合があります。
          </p>
        </article>

        <article className="terms-block">
          <h2>5. 返金・キャンセル</h2>
          <p>
            デジタル鑑定サービスの性質上、提供開始後の返金は原則として行いません。ただし、二重決済、システム障害、誤課金など当社が必要と判断した場合は、個別に確認します。
          </p>
        </article>

        <article className="terms-block">
          <h2>6. 相談回数と追加枠</h2>
          <p>
            各プランの相談回数は、プラン画面に表示された回数に従います。追加100回パックは、月の相談回数を使い切った後も相談を続けるための追加枠です。
            追加枠には有効期限を設けず、翌月以降も残数がある限り利用できます。ただし、退会、アカウント削除、不正利用による停止、サービス終了の場合、未使用分は失効することがあります。
          </p>
        </article>

        <article className="terms-block">
          <h2>7. 価格や提供内容の変更</h2>
          <p>
            料金、相談回数、選べる占い師タイプ、回答量などの提供条件を変更する場合があります。重要な変更は、サービス内または登録された連絡先へ通知します。
          </p>
        </article>

        <div className="legal-page-links">
          <Link className="button primary" href="/pricing">
            プランを見る
          </Link>
          <Link className="button" href="/contact">
            決済について問い合わせる
          </Link>
        </div>
      </section>
    </main>
  );
}
