import Link from "next/link";
import { BirthChartApp } from "@/components/BirthChartApp";
import { GlobalNav } from "@/components/GlobalNav";

const testimonials = [
  {
    name: "東京都世田谷区 / 34歳 / 広告代理店勤務",
    theme: "恋愛・復縁",
    rating: "5.0",
    text: "別れた相手に連絡するか、夜中に何度も画面を開いては閉じていました。鑑定では、月と金星の位置から「寂しさ」と「本当に戻りたい理由」を分けて見てくれて、胸の中が急に静かになりました。結局すぐ連絡せず、少し時間を置いて短い言葉で送ると決められたのが大きかったです。"
  },
  {
    name: "神奈川県横浜市 / 29歳 / Webデザイナー",
    theme: "仕事・転職",
    rating: "4.8",
    text: "転職したいのに、怖くて求人を見るだけで終わっていました。太陽、水星、火星の並びから「今の職場が合わない」だけではなく、「どんな働き方なら才能が出るか」まで言われて、占いというより自分の取扱説明書を読んだ感覚でした。翌日、上司に担当領域の相談をする勇気が出ました。"
  },
  {
    name: "長野県松本市 / 42歳 / カフェ経営",
    theme: "人生の転機",
    rating: "4.7",
    text: "店を続けるか、街を離れるかで半年以上悩んでいました。木星と土星、今のトランジットを重ねて、短期では守るもの、中期では変えるもの、長期では手放していいものを分けてくれたのが刺さりました。派手な予言ではないのに、霧が晴れていくように次の一手が見えました。"
  },
  {
    name: "高知県四万十町 / 37歳 / 介護職",
    theme: "相性診断",
    rating: "4.9",
    text: "近くに相談できる占い師も少なく、相手のことを誰にも話せずにいました。相手の気持ちを勝手に決めつけるのではなく、私が我慢しすぎる癖や、関係が苦しくなる距離感を星から読んでくれたのが救いでした。読み終わった後、相手ではなく自分の心を初めて主語にできました。"
  }
];

export default function Home() {
  return (
    <main className="shell">
      <GlobalNav mark="☉" />

      <section className="hero">
        <div className="copy">
          <div className="eyebrow">Your Private Astrologer</div>
          <h1>HOSHIYOMI</h1>
          <p className="lead">
            よくある占いは、決まった内容を、決まった言い回しで、一方的に伝えられるだけ。けれど本当に知りたいのは、「私の場合はどうなのか」ということ。
          </p>
          <p className="lead">
            あなたの運命を深く知るには、生まれ持った星を理解し、今この瞬間の星の流れと重ね、そして本当に聞きたいことまで受け止めてくれる専任の占い師が必要です。
          </p>
          <p className="lead">
            HOSHIYOMIは、あなたの出生図と現在の星の位置をもとに、恋愛、仕事、相性、将来、不安、願いまで続けて相談できるパーソナル星読みです。
          </p>
          <div className="hero-reason">
            <span>なぜ、当たると感じるのか</span>
            <p>
              ホロスコープは「12星座だけ」で見る占いではありません。太陽、月、惑星、ハウス、天体同士の角度を重ねることで、
              その人が何に反応し、どこで迷い、どんな時に本来の力を出しやすいかを細かく読みます。
            </p>
            <p>
              「当たる」という感覚は、まだ言葉にできていなかった自分の癖や願いが、星の配置を通してはっきり見えてくることから生まれます。
            </p>
          </div>
          <div className="actions">
            <Link className="button primary" href="/m">
              いますぐ無料で星を読む
            </Link>
            <a className="button" href="#about">
              ホロスコープとは
            </a>
            <Link className="button" href="/register">
              無料会員登録
            </Link>
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
              <strong>天体位置を計算</strong>
              <span>太陽、月、主要惑星、ASC、MC、ハウス、アスペクトを算出します。</span>
            </div>
            <div>
              <strong>象徴を整理</strong>
              <span>恋愛、仕事、内面、成長テーマごとに配置の意味をまとめます。</span>
            </div>
            <div>
              <strong>続きを相談</strong>
              <span>「彼との距離感は？」「転職するなら何を見ればいい？」のような悩みに、出生図の根拠つきで答えます。</span>
            </div>
            <div className="method-cta">
              <Link className="button primary" href="/m">
                今すぐ占う
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
          </div>
          <div className="rating-summary" aria-label="平均評価 4.8 / 5.0">
            <span className="stars">★★★★★</span>
            <strong>4.8</strong>
            <small>/ 5.0</small>
          </div>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={`${testimonial.name}-${testimonial.theme}`}>
              <div className="testimonial-meta">
                <span>{testimonial.theme}</span>
                <strong>{testimonial.rating}</strong>
              </div>
              <p>{testimonial.text}</p>
              <div className="testimonial-name">{testimonial.name}</div>
            </article>
          ))}
        </div>
        <p className="review-note">リリース前の掲載イメージです。正式公開時には実際のレビューに差し替えます。</p>
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
