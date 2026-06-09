import Link from "next/link";

const historyItems = [
  {
    title: "古代メソポタミア",
    text: "占星術の起源は、いまから約4000年前のメソポタミア文明にさかのぼります。夜ごとに空を見上げた古代の人々は、惑星の動きと地上の出来事のあいだに響き合いを見出しました。"
  },
  {
    title: "バビロニアから古代ギリシャへ",
    text: "その知恵はやがてバビロニアで体系化され、古代ギリシャではプトレマイオスが『テトラビブロス』にまとめました。生まれた瞬間の天体配置を一枚の図として捉えるホロスコープ占星術が整えられていきます。"
  },
  {
    title: "中世からルネサンスへ",
    text: "イスラム圏で翻訳、研究、発展した天文学と占星術は、やがてヨーロッパへ再流入しました。ルネサンス期にはケプラーやガリレオの時代にも星を読む知が息づき、空を読むことは長く知性の最前線にありました。"
  },
  {
    title: "日本の星読みと現代の鑑定",
    text: "日本にも宿曜道や陰陽道といった独自の星読みの伝統がありました。HOSHIYOMIは、その長い系譜を現代の暮らしに合わせて受け取り直すための星読みです。"
  }
];

export default function HistoryPage() {
  return (
    <main className="shell detail-shell">

      <section className="detail-hero">
        <div className="eyebrow">History</div>
        <h1>占星術とホロスコープの歴史</h1>
        <p className="lead">
          占星術の起源は、いまから約4000年前のメソポタミア文明にさかのぼります。夜ごとに空を見上げた人々は、星の動きと地上のリズムを結びつけてきました。
        </p>
      </section>

      <section className="detail-section">
        <p>
          太陽は季節を、月は暦を、惑星は規則的でありながら不思議な動きを示します。星を読むことは、暦、農耕、国家判断、人生の岐路と結びつきながら、
          長い時間をかけて受け継がれてきました。
        </p>
        <div className="timeline">
          {historyItems.map((item) => (
            <article className="timeline-item" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <div className="actions">
          <Link className="button primary" href="/m">
            出生図を作る
          </Link>
          <Link className="button" href="/#about">
            戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
