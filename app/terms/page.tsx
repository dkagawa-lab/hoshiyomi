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
            鑑定文は、ホロスコープ計算、利用者が入力した相談内容、保存された相談文脈、当社のシステムを組み合わせて作成されます。人間の占い師がすべての相談を個別に執筆・監修するものではありません。
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
            生年月日、出生時刻、出生地、相談内容は、鑑定結果を作成し、継続的な相談体験を提供するために使用します。
            保存範囲、削除方法、外部サービスの利用、外国にある第三者への提供、Cookieや端末識別子の利用については、プライバシーポリシーに定めます。
          </p>
        </article>

        <article className="terms-block">
          <h2>5. 鑑定結果について</h2>
          <p>
            鑑定文は、占星術の計算と当社のシステムにより自動的に作成されます。鑑定結果には、解釈の揺れや不正確な表現が含まれる場合があります。重要な判断を行う際は、鑑定結果だけで決めず、ご自身の状況や信頼できる人、専門家の意見も合わせてご確認ください。
          </p>
        </article>

        <article className="terms-block">
          <h2>6. 課金機能について</h2>
          <p>
            通常プラン、プライベートプランなどを提供する場合、初回割引を含む料金、相談回数、利用できる鑑定タイプ、更新、解約、返金条件は購入画面に明示します。決済前に内容をご確認ください。
            月額プランは解約されるまで自動更新されます。決済条件、解約方法、返金条件、追加相談枠の扱いは、決済・サブスクリプション条件に定めます。
          </p>
        </article>

        <article className="terms-block">
          <h2>7. アカウント、退会、データ削除</h2>
          <p>
            利用者は、登録情報ページまたはお問い合わせフォームから、登録情報、保存された出生情報、鑑定履歴、決済状態の確認を行えます。
            退会、アカウント削除、保存データの削除を希望する場合は、お問い合わせフォームから申請してください。未払い料金、法令上必要な保存、決済・不正利用調査に必要な情報は、必要な範囲で保存する場合があります。
          </p>
        </article>

        <article className="terms-block">
          <h2>8. 未成年の利用</h2>
          <p>
            未成年の方が有料プランや追加相談枠を利用する場合は、親権者など法定代理人の同意を得てください。未成年者による同意のない購入が確認された場合、利用制限や契約取消しの確認を行うことがあります。
          </p>
        </article>

        <article className="terms-block">
          <h2>9. アカウント停止・利用制限</h2>
          <p>
            不正アクセス、紹介特典や相談回数の不正取得、決済情報の不正利用、第三者へのなりすまし、過度な自動アクセス、法令または本規約に違反する行為が確認された場合、事前の通知なく利用停止、特典の取消し、アカウント停止を行うことがあります。
          </p>
        </article>

        <article className="terms-block">
          <h2>10. 免責・責任制限</h2>
          <p>
            本サービスは、鑑定結果の完全性、正確性、特定の成果、将来の出来事、利用者の判断結果を保証しません。
            通信環境、外部サービス、決済事業者、当社システムの不具合により、一時的に利用できない場合があります。当社の故意または重過失による場合を除き、本サービスに関連して生じた損害について、当社の責任は利用者が直近1か月に支払った利用料金を上限とします。
          </p>
        </article>

        <article className="terms-block">
          <h2>11. 規約変更</h2>
          <p>
            当社は、法令の変更、サービス内容の変更、運営上の必要に応じて本規約を変更することがあります。重要な変更を行う場合は、サービス内表示または登録された連絡先への通知により告知し、告知時に定める効力発生日から適用します。
          </p>
        </article>

        <article className="terms-block">
          <h2>12. 準拠法・裁判管轄</h2>
          <p>
            本規約は日本法に準拠します。本サービスに関して紛争が生じた場合、運営者所在地を管轄する日本国内の裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </article>

        <article className="terms-block">
          <h2>13. 事業者情報・お問い合わせ</h2>
          <p>
            本サービスの運営者はHOSHIYOMI運営事務局です。販売事業者名、所在地、運営責任者、販売価格、支払方法、解約方法は、特定商取引法に基づく表記に記載します。
            不具合、鑑定内容への違和感、欲しい相談テーマ、決済や解約に関する確認は、お問い合わせフォームまたは support@hoshiyomi4u.com までご連絡ください。
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
