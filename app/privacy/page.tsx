import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";

export default function PrivacyPage() {
  return (
    <main className="shell detail-shell">
      <GlobalNav active="support" mark="☽" />

      <section className="detail-hero">
        <div className="eyebrow">Privacy Policy</div>
        <h1>プライバシーポリシー</h1>
        <p className="lead">HOSHIYOMIで扱う出生情報、相談内容、決済に関する情報の取り扱い方針です。公開前に事業者情報と連絡先を差し替えてください。</p>
      </section>

      <section className="detail-section legal-doc">
        <article className="terms-block">
          <h2>1. 取得する情報</h2>
          <p>
            本サービスでは、氏名またはニックネーム、生年月日、出生時刻、出生地、性別、恋愛対象、相談内容、鑑定履歴、登録状態、利用プラン、問い合わせ内容、端末やブラウザに関する情報を取得することがあります。
          </p>
        </article>
        <article className="terms-block">
          <h2>2. 利用目的</h2>
          <p>
            取得した情報は、ホロスコープ計算、鑑定文の生成、相談履歴の保存、会員機能、課金プランの管理、お問い合わせ対応、不具合調査、サービス改善、利用規約違反への対応のために利用します。
          </p>
        </article>
        <article className="terms-block">
          <h2>3. 外部サービスの利用</h2>
          <p>
            鑑定文の生成、決済処理、データ保存、アクセス解析などのために、外部サービスを利用する場合があります。決済情報は決済事業者が取り扱い、本サービスではカード番号などの完全な決済情報を保存しません。
          </p>
        </article>
        <article className="terms-block">
          <h2>4. 第三者提供</h2>
          <p>
            法令に基づく場合、本人の同意がある場合、サービス提供に必要な委託先へ共有する場合を除き、個人情報を第三者へ提供しません。
          </p>
        </article>
        <article className="terms-block">
          <h2>5. 保存期間と削除</h2>
          <p>
            会員情報、鑑定履歴、問い合わせ内容は、サービス提供に必要な期間保存します。削除や開示を希望する場合は、お問い合わせページからご連絡ください。
          </p>
        </article>
        <article className="terms-block">
          <h2>6. 安全管理</h2>
          <p>
            不正アクセス、紛失、漏えい、改ざんを防ぐため、アクセス制限、認証情報の管理、外部サービスの権限管理など、合理的な安全管理措置を講じます。
          </p>
        </article>
        <article className="terms-block">
          <h2>7. 改定</h2>
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
