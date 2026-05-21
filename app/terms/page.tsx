import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";

export default function TermsPage() {
  return (
    <main className="shell detail-shell">
      <GlobalNav mark="☉" />

      <section className="detail-hero">
        <div className="eyebrow">Terms & Notes</div>
        <h1>利用規約・鑑定前のご注意</h1>
        <p className="lead">
          HOSHIYOMIは、星を通して自分を見つめるための鑑定サービスです。安心してご利用いただくために、以下をご確認ください。
        </p>
      </section>

      <section className="detail-section">
        <article className="terms-block">
          <h2>1. サービスの位置づけ</h2>
          <p>
            本サービスは、占星術の象徴解釈をもとに、自己理解、内省、対話のきっかけを提供するものです。
            鑑定結果は、人生の選択を強制したり、特定の未来を保証したりするものではありません。
          </p>
        </article>

        <article className="terms-block">
          <h2>2. 専門的判断について</h2>
          <p>
            医療・法律・投資・税務・心理治療その他の専門的な判断が必要な事項については、本サービスの鑑定結果に依拠せず、必ず資格を持つ専門家へご相談ください。
          </p>
        </article>

        <article className="terms-block">
          <h2>3. 禁止される利用</h2>
          <p>
            他者を傷つける目的、違法行為、差別的・攻撃的な内容、第三者の権利を侵害する内容、または深刻な危機状態への対応を本サービスに委ねる利用はお控えください。
          </p>
        </article>

        <article className="terms-block">
          <h2>4. 入力情報の扱い</h2>
          <p>
            生年月日、出生時刻、出生地、相談内容は、鑑定結果を生成し、継続的な相談体験を提供するために使用します。
            本番運用時には、保存範囲、削除方法、第三者提供の有無をプライバシーポリシーで明示します。
          </p>
        </article>

        <article className="terms-block">
          <h2>5. 鑑定結果について</h2>
          <p>
            鑑定結果には、解釈の揺れや不正確な表現が含まれる場合があります。重要な判断を行う際は、鑑定結果だけで決めず、ご自身の状況や信頼できる人、専門家の意見も合わせてご確認ください。
          </p>
        </article>

        <article className="terms-block">
          <h2>6. 課金機能について</h2>
          <p>
            通常プラン、プライベートプランなどを提供する場合、初回割引を含む料金、相談回数、利用できる鑑定タイプ、更新、解約、返金条件は購入画面に明示します。決済前に内容をご確認ください。
          </p>
        </article>

        <article className="terms-block">
          <h2>7. お問い合わせ・ご要望</h2>
          <p>
            不具合、鑑定内容への違和感、欲しい相談テーマ、決済や解約に関する確認は、お問い合わせフォームからご連絡ください。いただいた内容は、返信、調査、サービス改善のために確認します。
          </p>
        </article>

        <div className="legal-link-panel">
          <Link href="/privacy">
            <strong>プライバシーポリシー</strong>
            <span>出生情報、相談内容、問い合わせ内容の扱いを確認できます。</span>
          </Link>
          <Link href="/legal/payment-terms">
            <strong>決済・サブスクリプション条件</strong>
            <span>料金、更新、解約、返金、追加相談枠について確認できます。</span>
          </Link>
          <Link href="/legal/commercial-disclosure">
            <strong>特定商取引法に基づく表記</strong>
            <span>販売事業者、支払方法、提供時期、返金条件などの表示です。</span>
          </Link>
          <Link href="/contact">
            <strong>お問い合わせ・ご要望</strong>
            <span>困ったことや改善してほしいことを送れます。</span>
          </Link>
        </div>

        <div className="actions">
          <Link className="button primary" href="/register">
            確認して登録へ進む
          </Link>
          <Link className="button" href="/">
            トップへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
