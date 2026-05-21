import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";
import { RegisterActions } from "@/components/RegisterActions";

export default function RegisterPage() {
  return (
    <main className="shell">
      <GlobalNav active="account" mark="✦" />
      <section className="panel form-panel auth-entry-page">
        <div className="eyebrow">Membership</div>
        <h1>新規登録</h1>
        <p className="auth-lead">
          <span>メール・Google・LINEで新規登録すると、</span>
          <span>出生図と鑑定履歴を保存できます。</span>
          <span>最初の10回まで無料で相談でき、</span>
          <span>その後も無料プランでは1日3回、</span>
          <span>同じ星の文脈で相談できます。</span>
        </p>
        <div className="notice-box">
          <h2>登録前のご確認</h2>
          <p className="notice-copy">
            <span>HOSHIYOMIは、星を通して</span>
            <span>自分を見つめるための鑑定サービスです。</span>
            <span>医療・法律・投資など、専門的な判断が</span>
            <span>必要なことは、必ず専門家へご相談ください。</span>
          </p>
          <p className="notice-copy">
            <span>鑑定結果は未来を保証するものではなく、</span>
            <span>自己理解と選択のヒントとして</span>
            <span>お受け取りください。</span>
            <span>続行すると、利用規約と鑑定前の注意に</span>
            <span>同意したものとして扱います。</span>
          </p>
          <Link className="text-link" href="/terms">
            利用規約・鑑定前のご注意を読む
          </Link>
        </div>
        <RegisterActions mode="register" />
        <div className="register-sub-actions">
          <Link className="text-link" href="/login">
            登録済みの方はログインへ
          </Link>
          <Link className="text-link" href="/account">
            登録情報・鑑定履歴を見る
          </Link>
          <Link className="text-link" href="/dashboard">
            星の確認へ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
