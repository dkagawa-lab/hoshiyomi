import type { Metadata } from "next";
import Link from "next/link";
import { PublicReviewList } from "@/components/PublicReviewList";
import { reviewFixtures } from "@/lib/reviewFixtures";
import "../lp.css";

export const metadata: Metadata = {
  title: "“本当の自分”を、出生図で言葉に｜HOSHIYOMI",
  description:
    "生まれた日時と場所から作る、あなただけのホロスコープ。性質・強み・繰り返すパターンを言葉にして、続けて相談できます。まずは無料で星を読む。",
  robots: { index: false, follow: false }
};

const startHref = "/m?from=lp-self";

export default function SelfLandingPage() {
  return (
    <main className="shell lp">
      <section className="lp-hero">
        <div className="eyebrow">Your Private Star Reading</div>
        <h1 className="lp-title">
          “本当の自分”を、<em>出生図</em>で言葉に
        </h1>
        <p className="lp-sub">
          当たる、というより「自分の輪郭がはっきりする」。
          あなたの生まれた<strong>時刻と場所</strong>まで読む本物のホロスコープが、
          まだ言葉にできていない性質・強み・願いを映し出します。
        </p>
        <div className="lp-cta-row">
          <Link className="button primary" href={startHref}>
            まず無料で星を読む
          </Link>
          <Link className="text-link" href="/login">
            登録済みの方はログイン
          </Link>
        </div>
        <div className="lp-trust" aria-label="安心ポイント">
          <span>登録不要ですぐ試せる</span>
          <span>初回10回まで無料</span>
          <span>いつでも解約OK</span>
        </div>
      </section>

      <section className="lp-section">
        <div className="eyebrow">Your Worry</div>
        <h2 className="lp-section-title">こんなモヤモヤ、言葉にできずにいませんか</h2>
        <ul className="lp-empathy-list">
          <li>自分が本当は何を求めているのか、自分でもわからない</li>
          <li>強みを聞かれても、うまく答えられない</li>
          <li>恋愛や仕事で、同じパターンを繰り返している気がする</li>
          <li>性格診断は何度もやったけれど、その先につながらない</li>
        </ul>
      </section>

      <section className="lp-section">
        <div className="eyebrow">Why It Resonates</div>
        <h2 className="lp-section-title">12星座占いとは、見ている深さが違います</h2>
        <div className="explain-grid">
          <article className="explain-card">
            <span className="card-number">01</span>
            <h3>あなただけの星の地図</h3>
            <p>
              同じ誕生日でも、生まれた時刻と場所が違えば配置は別物。
              太陽だけでなく、月・水星・金星など10天体の重なりから、外に見せる顔と素の自分を分けて読みます。
            </p>
          </article>
          <article className="explain-card">
            <span className="card-number">02</span>
            <h3>性質を「使い方」まで</h3>
            <p>
              診断結果で終わらせません。考え方の癖、安心の条件、力を出しやすい場面まで、
              日々の選択に使える言葉に翻訳します。
            </p>
          </article>
          <article className="explain-card">
            <span className="card-number">03</span>
            <h3>今の流れと重ねる</h3>
            <p>
              生まれ持った星に、今この瞬間の星の動きを重ねて読むから、
              「いま何を意識すると整うか」が見えてきます。
            </p>
          </article>
        </div>
      </section>

      <section className="lp-section">
        <div className="eyebrow">How It Works</div>
        <h2 className="lp-section-title">3ステップで、あなたの星読みが始まります</h2>
        <div className="journey-strip" aria-label="使い方">
          <div>
            <span>01</span>
            <strong>星を読む</strong>
            <p>生年月日と出生地を入力すると、あなたの出生図を作成します。</p>
          </div>
          <div>
            <span>02</span>
            <strong>本質を見る</strong>
            <p>性質の核、考え方の癖、伸びる方向、乗り越えるテーマを確認します。</p>
          </div>
          <div>
            <span>03</span>
            <strong>続けて相談する</strong>
            <p>「私の強みは？」「なぜ同じ悩みを繰り返す？」と、そのまま深掘りできます。</p>
          </div>
        </div>
        <div className="lp-cta-row" style={{ marginTop: 22 }}>
          <Link className="button primary" href={startHref}>
            無料で星を読む
          </Link>
        </div>
      </section>

      <section className="lp-section">
        <div className="eyebrow">Keep Asking</div>
        <h2 className="lp-section-title">診断で終わらない。問いを重ねるほど深くなります</h2>
        <p className="lp-sub">
          結果を読んで終わりではありません。気になった一文から「それはどういうこと？」と聞き返せます。
          相談の文脈は記憶されるので、WebでもLINEでも、あなたの星の話を続きから話せます。
        </p>
      </section>

      <section className="lp-section">
        <div className="eyebrow">Pricing</div>
        <h2 className="lp-section-title">無料で試して、納得してから続けられます</h2>
        <div className="lp-price">
          <div className="lp-price-ladder">
            <div>
              <span>まず無料お試し</span>
              <strong>¥0</strong>
            </div>
            <div>
              <span>登録すると初回10回まで相談</span>
              <strong>無料</strong>
            </div>
            <div>
              <span>もっと深く読む通常プラン（初月）</span>
              <strong>¥480</strong>
            </div>
          </div>
          <p className="lp-price-note">
            通常プランは初月480円でお試しいただけます。2ヶ月目以降は月980円で自動更新となり、
            アカウント画面またはお問い合わせからいつでも解約できます。
            鑑定は占星術にもとづく自己理解のためのもので、特定の未来や結果を保証するものではありません。
          </p>
        </div>
        <div className="lp-cta-row" style={{ marginTop: 22 }}>
          <Link className="button primary" href={startHref}>
            まずは無料で始める
          </Link>
        </div>
      </section>

      <section className="lp-section testimonial-section" aria-labelledby="lp-reviews">
        <div className="eyebrow">Reviews</div>
        <h2 className="lp-section-title" id="lp-reviews">星を読んだ人の声</h2>
        <PublicReviewList fallback={reviewFixtures} />
      </section>

      <section className="lp-section">
        <div className="eyebrow">FAQ</div>
        <h2 className="lp-section-title">よくある質問</h2>
        <div className="lp-faq">
          <details>
            <summary>本当に無料で試せますか？</summary>
            <p>はい。登録なしで出生図と最初の鑑定を読めます。登録すると初回10回まで無料で相談できます。</p>
          </details>
          <details>
            <summary>出生時刻がわからなくても占えますか？</summary>
            <p>占えます。時刻が不明な場合はASC（上昇星座）とハウスを省略しますが、太陽・月・主要な天体から性質の核は読めます。</p>
          </details>
          <details>
            <summary>性格診断と何が違うのですか？</summary>
            <p>
              質問への回答ではなく、生まれた瞬間の星の配置から読む点が異なります。さらに結果で終わらず、
              気になるところを続けて質問しながら、自分の言葉になるまで深掘りできます。
            </p>
          </details>
          <details>
            <summary>解約は簡単ですか？</summary>
            <p>アカウント画面の支払い管理、またはお問い合わせからいつでも受け付けます。初月480円のあと、2ヶ月目以降は月980円で自動更新されます。</p>
          </details>
          <details>
            <summary>必ず当たりますか？</summary>
            <p>占いは未来や結果を保証するものではなく、自分を見つめ、選び方を整理するためのものです。重要な判断はご自身や専門家の意見もあわせてご確認ください。</p>
          </details>
        </div>
      </section>

      <section className="lp-final">
        <h2>あなたの星は、もう空にあります。あとは読むだけ。</h2>
        <div className="lp-cta-row">
          <Link className="button primary" href={startHref}>
            無料で星を読む
          </Link>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-links">
          <Link className="text-link" href="/terms">
            利用規約
          </Link>
          <Link className="text-link" href="/privacy">
            プライバシーポリシー
          </Link>
          <Link className="text-link" href="/legal/payment-terms">
            決済条件
          </Link>
          <Link className="text-link" href="/legal/commercial-disclosure">
            特商法表記
          </Link>
          <Link className="text-link" href="/contact">
            お問い合わせ
          </Link>
        </div>
        <small>
          本サービスは占星術にもとづく鑑定・自己理解のためのサービスであり、特定の未来や結果を保証するものではありません。
          医療・法律・投資などの専門的判断は資格を持つ専門家へご相談ください。
        </small>
      </footer>
    </main>
  );
}
