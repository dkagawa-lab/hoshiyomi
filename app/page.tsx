import Link from "next/link";
import { BirthChartApp } from "@/components/BirthChartApp";
import { GlobalNav } from "@/components/GlobalNav";
import { PublicReviewList } from "@/components/PublicReviewList";
import { reviewFixtures } from "@/lib/reviewFixtures";

export default function Home() {
  return (
    <main className="shell">
      <GlobalNav mark="☉" />

      <section className="hero">
        <div className="copy">
          <div className="eyebrow">Your Private Astrologer</div>
          <h1>HOSHIYOMI</h1>
          <p className="lead hero-copy-line">
            <span>よくある占いは、決まった内容を、</span>
            <span>決まった言い回しで、一方的に伝えられるだけ。</span>
            <span>けれど本当に知りたいのは、</span>
            <span>「私の場合はどうなのか」ということ。</span>
          </p>
          <p className="lead hero-copy-line">
            <span>あなたの運命を深く知るには、</span>
            <span>生まれ持った星を理解し、</span>
            <span>今この瞬間の星の流れと重ね、</span>
            <span>本当に聞きたいことまで受け止める、</span>
            <span>専任の占い師のような星読みが必要です。</span>
          </p>
          <p className="lead hero-copy-line">
            <span>HOSHIYOMIは、あなたの出生図と</span>
            <span>現在の星の位置をもとに、</span>
            <span>恋愛、仕事、相性、将来、不安、願いまで</span>
            <span>続けて相談できるパーソナル星読みです。</span>
          </p>
          <div className="actions hero-actions">
            <Link className="button primary" href="/m">
              まず無料で星を読む
            </Link>
            <a className="button" href="#reading-flow">
              相談までの流れを見る
            </a>
            <Link className="text-link hero-login-link" href="/login">
              登録済みの方はログイン
            </Link>
          </div>
          <div className="hero-reason">
            <span>なぜ、当たると感じるのか</span>
            <p className="hero-copy-line">
              <span>ホロスコープは「12星座だけ」で</span>
              <span>見る占いではありません。</span>
              <span>太陽、月、惑星、ハウス、</span>
              <span>天体同士の角度を重ね、</span>
              <span>その人が何に反応し、どこで迷い、</span>
              <span>どんな時に力を出しやすいかを読みます。</span>
            </p>
            <p className="hero-copy-line">
              <span>「当たる」という感覚は、</span>
              <span>まだ言葉にできていなかった</span>
              <span>自分の癖や願いが、</span>
              <span>星の配置を通して見えてくることから生まれます。</span>
            </p>
          </div>
          <div className="journey-strip" id="reading-flow" aria-label="HOSHIYOMIの使い方">
            <div>
              <span>01</span>
              <strong>星を読む</strong>
              <p>生年月日と出生地から、まずあなたの出生図を作ります。</p>
            </div>
            <div>
              <span>02</span>
              <strong>本質を見る</strong>
              <p>星の配置から、あなたの性質と今見えるテーマを確認します。</p>
            </div>
            <div>
              <span>03</span>
              <strong>相談する</strong>
              <p>恋愛、仕事、相性、将来など、知りたいことを続けて聞けます。</p>
            </div>
          </div>
        </div>
        <section className="sky-feature hero-sky-feature" aria-label="オリオン座の星野写真">
          <img src="/images/orion-star-field.jpg" alt="オリオン座の星野写真" />
          <div className="sky-caption">
            <div className="eyebrow">Real Sky, Personal Reading</div>
            <h2>占いの入口にあるのは、まず実際の星空です</h2>
            <p>
              HOSHIYOMIでは、作り物の幻想ではなく、出生時刻と場所から計算した天体位置を読み解きます。星の配置を地図として見つめることで、
              自分の性質や選び方を別の角度から言葉にしていきます。
            </p>
            <span>Image: Orion Constellation Star Field / NASA, ESA, STScI</span>
          </div>
        </section>
        <div className="hero-app" id="app">
          <BirthChartApp compact />
        </div>
      </section>

      <section className="explain-section" id="about">
        <div className="section-heading">
          <div className="eyebrow">What Is A Horoscope?</div>
          <h2>ホロスコープとは、あなたが生まれた瞬間の星空を写した地図です</h2>
          <p>
            太陽、月、水星から冥王星までの天体が、12星座のどこに、どんな角度で位置していたか。同じ誕生日でも、生まれた時刻や場所が違えば、
            まったく別の地図が描かれます。
          </p>
        </div>

        <div className="explain-grid">
          <article className="explain-card">
            <span className="card-number">01</span>
            <h3>仕組み</h3>
            <p>
              太陽星座が「表に見せる自分」を、月星座が「素の自分や感情」を、上昇星座が「他人から見た印象」を司るように、
              天体、星座、ハウスが重なり、ひとりの人物像を立ち上げます。
            </p>
            <Link className="text-link" href="/about/mechanism">
              もっと見る
            </Link>
          </article>

          <article className="explain-card">
            <span className="card-number">02</span>
            <h3>歴史</h3>
            <p>
              占星術の起源は約4000年前のメソポタミアにさかのぼります。星を読むことは、暦、農耕、国家判断、そして人生の岐路と結びつきながら、
              長い時間をかけて受け継がれてきました。
            </p>
            <Link className="text-link" href="/about/history">
              もっと見る
            </Link>
          </article>

          <article className="explain-card">
            <span className="card-number">03</span>
            <h3>なぜ当たると感じるのか</h3>
            <p>
              当たる、というよりも「自分の輪郭がはっきりしてくる」。星が描く言葉に出会うことで、普段は言葉にならない感情や願いが、
              ふと形を持って浮かび上がります。
            </p>
            <Link className="text-link" href="/about/why-it-resonates">
              もっと見る
            </Link>
          </article>
        </div>

        <div className="glossary-bridge">
          <div>
            <div className="eyebrow">Horoscope Guide</div>
            <h3>さらに詳しくホロスコープを理解する</h3>
            <p>
              ASC、ハウス、アスペクト、トランジットなど、鑑定文に出てくる言葉を知っておくと、自分の星が何を示しているのかがより深く読めるようになります。
            </p>
          </div>
          <Link className="button" href="/glossary">
            完全ガイド・用語集を見る
          </Link>
        </div>

        <div className="method-panel">
          <div>
            <div className="eyebrow">How HOSHIYOMI Reads</div>
            <h2>複雑な星の相互作用を、あなた専用の言葉に変えます</h2>
          </div>
          <div className="method-steps">
            <div>
              <strong>星を読む</strong>
              <span>太陽、月、主要惑星、ASC、MC、ハウス、アスペクトを算出します。</span>
            </div>
            <div>
              <strong>本質を知る</strong>
              <span>恋愛、仕事、内面、成長テーマごとに配置の意味をまとめます。</span>
            </div>
            <div>
              <strong>必要なら記録する</strong>
              <span>星の文脈を保存すると、次回以降も同じ流れで相談できます。</span>
            </div>
            <div>
              <strong>相談する</strong>
              <span>「彼との距離感は？」「転職するなら何を見ればいい？」のような悩みに、出生図の根拠つきで答えます。</span>
            </div>
            <div className="method-cta">
              <Link className="button primary" href="/m">
                まず星を読む
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section" aria-labelledby="testimonial-title">
        <div className="testimonial-heading">
          <div>
            <div className="eyebrow">Reviews</div>
            <h2 id="testimonial-title">星を読んだ人の声</h2>
            <p>
              恋愛、仕事、相性、人生の転機まで。鑑定後に残るのは、ただの答えではなく、自分を見直すための言葉です。
            </p>
          </div>
        </div>
        <PublicReviewList fallback={reviewFixtures} />
      </section>

      <footer className="footer">
        <Link className="text-link" href="/glossary">
          完全ガイド・用語集
        </Link>
        <Link className="text-link" href="/terms">
          利用規約・鑑定前のご注意
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
      </footer>
    </main>
  );
}
