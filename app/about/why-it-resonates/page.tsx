import Link from "next/link";
import { GlobalNav } from "@/components/GlobalNav";

export default function WhyItResonatesPage() {
  return (
    <main className="shell detail-shell">
      <GlobalNav mark="✦" />

      <section className="detail-hero">
        <div className="eyebrow">Why It Resonates</div>
        <h1>なぜ「当たる」と感じるのか</h1>
        <p className="lead">
          「驚くほど当たっていた」。そう感じられる理由のひとつは、占星術が単なる予言ではなく、自分を映す鏡として機能するからだと考えています。
        </p>
      </section>

      <section className="detail-section">
        <div className="reason-list">
          <div>
            <strong>言葉にしづらい感覚を整理できる</strong>
            <span>普段は言葉にならない感情、自分でも気づいていなかった傾向、心の奥にしまわれた願い。星が描く言葉に出会うことで、それらがふと輪郭をもって浮かび上がります。</span>
          </div>
          <div>
            <strong>自分の癖を外側から眺められる</strong>
            <span>出生図は評価表ではなく鏡に近いものです。得意な反応、苦手な場面、繰り返しやすい選択を、少し距離を置いて見られるようになります。</span>
          </div>
          <div>
            <strong>情報量が12通りの占いとは違う</strong>
            <span>天体、12星座、12ハウス、惑星同士の角度。この精緻な組み合わせは、よくある「12通りの占い」とはまったく違う密度を持っています。</span>
          </div>
          <div>
            <strong>決めつけではなく、選択肢を増やせる</strong>
            <span>よい占いは「あなたはこうです」で終わりません。「だから、こういう選び方もできる」と、現実の行動へ橋をかけます。</span>
          </div>
        </div>
        <p>
          当たる、というよりも「自分の輪郭が、はっきりしてくる」。それが、星を読むということなのかもしれません。
          HOSHIYOMIでは、星の配置を断定ではなく、自己理解と選択のための地図として扱います。
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
