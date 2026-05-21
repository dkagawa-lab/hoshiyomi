import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { GlobalNav } from "@/components/GlobalNav";

export default function ContactPage() {
  return (
    <main className="shell detail-shell">
      <GlobalNav active="support" mark="✦" />

      <section className="detail-hero">
        <div className="eyebrow">Contact</div>
        <h1>お問い合わせ・ご要望</h1>
        <p className="lead">
          鑑定内容の違和感、不具合、欲しい相談テーマ、決済や解約についてはこちらから送れます。いただいた声は、占い師タイプや鑑定体験の改善にも使います。
        </p>
      </section>

      <section className="contact-layout">
        <div className="panel contact-main">
          <div>
            <div className="eyebrow">Message</div>
            <h2>内容を送る</h2>
          </div>
          <ContactForm />
        </div>

        <aside className="contact-side">
          <article className="terms-block">
            <h2>返信について</h2>
            <p>通常は内容を確認したうえで返信します。混雑時や要望のみの場合、個別返信ではなく今後の改善に反映することがあります。</p>
          </article>
          <article className="terms-block">
            <h2>決済・解約の確認</h2>
            <p>課金に関するお問い合わせでは、決済時のメールアドレス、対象プラン、発生日時があると確認がスムーズです。カード番号などの決済情報は入力しないでください。</p>
            <Link className="text-link" href="/legal/payment-terms">
              決済・サブスクリプション条件を見る
            </Link>
          </article>
          <article className="terms-block">
            <h2>公開前に確認する表記</h2>
            <p>本番公開前に、事業者情報、返金条件、解約方法、個人情報の扱いを実情報に差し替えてください。</p>
            <Link className="text-link" href="/legal/commercial-disclosure">
              特定商取引法に基づく表記を見る
            </Link>
          </article>
        </aside>
      </section>
    </main>
  );
}
