import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";

export default function PrivacyPage() {
  return (
    <main className="shell detail-shell">
      <GlobalNav active="support" mark="☽" />

      <section className="detail-hero">
        <div className="eyebrow">Privacy Policy</div>
        <h1>プライバシーポリシー</h1>
        <p className="lead">HOSHIYOMIで扱う出生情報、相談内容、決済に関する情報の取り扱い方針です。</p>
      </section>

      <section className="detail-section legal-doc">
        <article className="terms-block">
          <p>
            本サービスの個人情報取扱事業者は、HOSHIYOMI運営事務局です。販売事業者名、所在地、運営責任者は、特定商取引法に基づく表記に記載します。
            個人情報の開示、訂正、利用停止、削除、第三者提供に関するお問い合わせは、お問い合わせフォームまたは support@hoshiyomi4u.com までご連絡ください。
          </p>
        </article>

        <article className="terms-block">
          <h2>1. 取得する情報</h2>
          <p>
            本サービスでは、氏名またはニックネーム、生年月日、出生時刻、出生地、緯度経度、性別、恋愛対象、相談内容、鑑定履歴、占い師タイプ、登録状態、ログイン方法、利用プラン、相談回数、紹介コード、評価・口コミ、問い合わせ内容を取得します。
            また、本人確認、利用状況の保持、不正利用防止、障害調査のため、Cookie、localStorage等に保存される端末識別子、IPアドレス、ユーザーエージェント、アクセス日時、リクエストログを取得することがあります。
          </p>
        </article>
        <article className="terms-block">
          <h2>2. 利用目的</h2>
          <p>
            取得した情報は、ホロスコープ計算、鑑定文の作成、相談履歴の保存、継続相談時の文脈参照、会員機能、ログイン状態の管理、課金プランと相談回数の管理、紹介・評価特典の付与、お問い合わせ対応、不具合調査、不正利用や利用規約違反への対応、サービス改善のために利用します。
          </p>
        </article>
        <article className="terms-block">
          <h2>3. 外部サービスの利用</h2>
          <p>
            鑑定文の作成、決済処理、データ保存、アクセス解析などのために、外部サービスを利用します。入力された情報の一部は、鑑定文の作成・処理のため、米国に所在する外部事業者へ送信します。決済情報は決済事業者が取り扱い、本サービスではカード番号などの完全な決済情報を保存しません。
          </p>
        </article>
        <article className="terms-block">
          <h2>4. 外国にある第三者への提供</h2>
          <p>
            鑑定文の作成にあたり、入力情報の一部を米国に所在する外部事業者へ送信します。送信先の国における個人情報の保護に関する制度や、当該事業者が講じる安全管理措置に関する情報は、お問い合わせページからご請求いただけます。
          </p>
        </article>
        <article className="terms-block">
          <h2>5. 第三者提供</h2>
          <p>
            法令に基づく場合、本人の同意がある場合、決済・認証・データ保存・鑑定文作成などサービス提供に必要な委託先へ共有する場合、利用規約違反や不正利用への対応に必要な場合を除き、個人情報を第三者へ提供しません。
            委託先には、目的達成に必要な範囲でのみ情報を共有し、契約や設定を通じて適切な管理に努めます。
          </p>
        </article>
        <article className="terms-block">
          <h2>6. 保存期間と削除</h2>
          <p>
            会員情報、出生情報、鑑定履歴、問い合わせ内容、決済に関する管理情報は、サービス提供、問い合わせ対応、法令上必要な保存、紛争防止のために必要な期間保存します。
            保有個人データの開示、訂正、追加、削除、利用停止、第三者提供の停止を希望する場合は、お問い合わせフォームまたは support@hoshiyomi4u.com までご連絡ください。本人確認のうえ、法令に従って対応します。
          </p>
        </article>
        <article className="terms-block">
          <h2>7. 安全管理</h2>
          <p>
            不正アクセス、紛失、漏えい、改ざんを防ぐため、アクセス制限、認証情報の管理、外部サービスの権限管理など、合理的な安全管理措置を講じます。
          </p>
        </article>
        <article className="terms-block">
          <h2>8. 改定</h2>
          <p>本ポリシーは、法令やサービス内容の変更に応じて改定することがあります。重要な変更がある場合は、サービス内で告知します。</p>
        </article>

        <div className="legal-page-links">
          <Link className="button" href="/contact">
            問い合わせる
          </Link>
          <Link className="button" href="/terms">
            利用規約を見る
          </Link>
        </div>
      </section>
    </main>
  );
}
