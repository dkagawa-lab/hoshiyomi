import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";
import { RegisterActions } from "@/components/RegisterActions";

export default function RegisterPage() {
  return (
    <main className="shell">
      <GlobalNav active="account" mark="✦" />
      <section className="panel form-panel" style={{ maxWidth: 720 }}>
        <div className="eyebrow">Membership</div>
        <h1 style={{ fontSize: "3.4rem" }}>あなたの星を記録する</h1>
        <p>
          メール・Google・LINEのいずれかで登録すると、出生図と鑑定履歴を保存し、最初の10回まで無料で相談できます。その後も無料プランでは1日3回、同じ星の文脈で相談できます。
        </p>
        <div className="notice-box">
          <h2>登録前のご確認</h2>
          <p>
            Hoshiyomiは、星を通して自分を見つめるための鑑定サービスです。医療・法律・投資など、専門的な判断が必要なことは、必ず専門家へご相談ください。
          </p>
          <p>
            鑑定結果は未来を保証するものではなく、自己理解と選択のヒントとしてお受け取りください。続行すると、利用規約と鑑定前の注意に同意したものとして扱います。
          </p>
          <Link className="text-link" href="/terms">
            利用規約・鑑定前のご注意を読む
          </Link>
        </div>
        <RegisterActions />
        <div className="register-sub-actions">
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
