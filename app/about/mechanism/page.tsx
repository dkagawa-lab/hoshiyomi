import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";

const mechanismItems = [
  {
    title: "天体",
    text: "太陽、月、水星、金星、火星、木星、土星、天王星、海王星などを見ます。太陽は表に見せる自分や人生の方向性、月は素の自分や感情、水星は思考と伝達、金星は愛し方、火星は行動力のように、それぞれが異なる心理テーマを象徴します。"
  },
  {
    title: "12星座",
    text: "星座は天体がどのような質で働くかを示します。同じ月でも、牡羊座なら反応が速く率直、牡牛座なら安定と心地よさを求める、双子座なら言葉や情報で気持ちを整理する、というように読み分けます。"
  },
  {
    title: "12ハウス",
    text: "ハウスは天体が人生のどの領域で表れやすいかを示します。1ハウスは自己像、2ハウスは所有や価値観、7ハウスは対人関係、10ハウスは社会的役割やキャリアのように、現実の場面へ意味を落とし込むための枠組みです。"
  },
  {
    title: "アスペクト",
    text: "惑星同士の角度です。0度、60度、90度、120度、180度などの関係を見て、性質同士が協力しやすいのか、緊張を生みやすいのかを読みます。才能や葛藤の出方を見る重要な手がかりです。"
  }
];

export default function MechanismPage() {
  return (
    <main className="shell detail-shell">
      <GlobalNav mark="☉" />

      <section className="detail-hero">
        <div className="eyebrow">Mechanism</div>
        <h1>ホロスコープの仕組み</h1>
        <p className="lead">
          ホロスコープとは、あなたが生まれた瞬間の空を、そのまま一枚の地図に写しとったものです。
        </p>
      </section>

      <section className="detail-section">
        <p>
          太陽、月、水星から冥王星までの天体が、12星座のどこに、どんな角度で位置していたか。同じ誕生日でも、生まれた時刻や場所が違えば、まったく別の地図が描かれます。
          さらに出生地と出生時刻から、その場所の地平線と子午線を求めることで、上昇星座であるアセンダント、MC、12ハウスが決まります。
        </p>
        <div className="detail-grid">
          {mechanismItems.map((item) => (
            <article className="detail-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <p>
          HOSHIYOMIは、この複雑な相互作用を整理し、熟練の占星術師が時間をかけて読み解くような深さを、誰でも手軽に受け取れる形に変えていきます。
          ひとつの配置だけで断定するのではなく、複数の配置を重ねて、その人らしいパターンを立体的に見ていきます。
        </p>
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
