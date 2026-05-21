"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BirthInput, BodyPosition, calculateChart, calculateTransits, Chart, formatPosition, TransitSnapshot } from "@/lib/astrology";
import { ChartWheel } from "@/components/ChartWheel";
import { ensureFreeBonusRemaining, planQuotaLabel, PlanKey, readFreeBonusRemaining, readPlanFromStorage, readPlanUsage, resolvePlan, usageLimitsDisabled } from "@/lib/plans";

type Topic = {
  key: string;
  label: string;
  question: string;
  focus: string[];
};

const topics: Topic[] = [
  { key: "love", label: "恋愛・出会い", question: "恋愛で私は何を大切にすればいい？", focus: ["moon", "venus", "mars"] },
  { key: "compatibility", label: "相性・パートナー", question: "大切な人とどう向き合えばいい？", focus: ["venus", "moon", "saturn"] },
  { key: "career", label: "仕事・才能", question: "仕事で活かせる才能は？", focus: ["sun", "mercury", "mars"] },
  { key: "money", label: "お金・価値観", question: "お金との付き合い方は？", focus: ["venus", "jupiter", "saturn"] },
  { key: "future", label: "これからの流れ", question: "今後のテーマを知りたい", focus: ["sun", "jupiter", "saturn", "pluto"] },
  { key: "self", label: "本当の自分", question: "私はどんな人？", focus: ["sun", "moon", "mercury"] },
  { key: "family", label: "家族・居場所", question: "安心できる居場所を知りたい", focus: ["moon", "saturn", "venus"] },
  { key: "decision", label: "迷い・決断", question: "今の迷いをどう整理すればいい？", focus: ["mercury", "mars", "saturn"] },
  { key: "healing", label: "心の癒し", question: "心が疲れた時の整え方は？", focus: ["moon", "venus", "neptune"] },
  { key: "growth", label: "人生の成長テーマ", question: "私が乗り越えるテーマは？", focus: ["sun", "saturn", "jupiter", "pluto"] }
];
const defaultTopic = topics.find((topic) => topic.key === "self") ?? topics[0];

export function ReadingFlow() {
  const [birth, setBirth] = useState<BirthInput | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [usedChats, setUsedChats] = useState(0);
  const [plan, setPlan] = useState<PlanKey>("free");
  const [freeBonusRemaining, setFreeBonusRemaining] = useState(0);

  useEffect(() => {
    const saved = readStoredBirth();
    if (saved) writeStoredBirth(saved);
    setBirth(saved);
    const savedMember = readStorageValue("localStorage", "hoshiyomi:member") === "true" || readStorageValue("sessionStorage", "hoshiyomi:member") === "true";
    setUnlocked(savedMember);
    const savedPlan = readPlanFromStorage();
    setPlan(savedPlan);
    setUsedChats(readPlanUsage(savedPlan));
    setFreeBonusRemaining(savedMember ? ensureFreeBonusRemaining() : readFreeBonusRemaining());
  }, []);

  const chart = useMemo(() => (birth ? calculateChart(birth) : null), [birth]);
  const transits = useMemo(() => (chart ? calculateTransits(chart) : null), [chart]);
  const currentPlan = resolvePlan(plan);

  if (!birth || !chart) {
    return (
      <section className="panel reading-empty">
        <h1>出生情報がまだありません</h1>
        <p>まずトップページで生年月日、出生時刻、出生地を入力してホロスコープを作成してください。</p>
        <Link className="button primary" href="/#app">
          入力に戻る
        </Link>
      </section>
    );
  }

  const analysis = buildAnalysis(chart, defaultTopic, transits);
  const personality = buildPersonalityProfile(chart);
  const remainingChats = usageLimitsDisabled() ? "開発環境: 相談回数の制限なし" : planQuotaLabel(currentPlan, usedChats, unlocked, freeBonusRemaining);

  return (
    <div className="reading-flow">
      <section className="reading-intro">
        <div>
          <div className="eyebrow">Your Natal Chart</div>
          <h1>あなたの星を読み取りました。</h1>
          <p className="lead">
            まずは{chart.input.name || "あなた"}の生年月日と出生地をもとに、生まれた瞬間の星から性質の輪郭を見ていきます。ここで終わりではなく、この星の文脈に悩みや願いを重ねるほど、鑑定はあなた自身の言葉に近づいていきます。
          </p>
        </div>
      </section>

      <section className="reading-layout">
        <div className="panel chart-card">
          <ChartWheel chart={chart} />
          <div className="birth-summary">
            <div>
              <span>出生地</span>
              <strong>{chart.input.city}</strong>
              <small>
                緯度 {Number(chart.input.latitude).toFixed(4)} / 経度 {Number(chart.input.longitude).toFixed(4)}
              </small>
            </div>
            <div>
              <span>出生日時</span>
              <strong>
                {chart.input.date} {chart.input.time || "時刻不明"}
              </strong>
              <small>{chart.input.time ? "ASCとハウスにも反映しています" : "時刻が空欄のためASCとハウスは省略しています"}</small>
            </div>
          </div>
          <div className="list">
            {chart.planets.map((planet) => (
              <div className="row" key={planet.key}>
                <strong>{planet.name}</strong>
                <span>
                  {planet.sign.name} {planet.degree.toFixed(1)}度{planet.house ? ` / ${planet.house}H` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="stack">
          <section className="panel star-profile-panel">
            <div className="eyebrow">Essence From Your Chart</div>
            <h2>星の配置から見る、あなたの本質</h2>
            <p>{personality.summary}</p>
            <div className="star-profile-grid">
              {personality.blocks.map((block) => (
                <article className="star-profile-card" key={block.title}>
                  <span>{block.label}</span>
                  <h3>{block.title}</h3>
                  <p>{block.text}</p>
                </article>
              ))}
            </div>
            <Link className="text-link" href="/glossary">
              ASC・ハウス・アスペクトなどを完全ガイド・用語集で見る
            </Link>
          </section>

          <section className="panel analysis-panel">
            <div className="eyebrow">Personal Analysis</div>
            <h2>あなたの本質の星読み</h2>
            {transits ? (
              <div className="transit-summary">
                <div>
                  <span>今日の運勢</span>
                  <strong>{analysis.todayFortune}</strong>
                </div>
                <div>
                  <span>今月のテーマ</span>
                  <strong>{analysis.monthlyTheme}</strong>
                </div>
                <div>
                  <span>今の悩みへの影響</span>
                  <strong>{analysis.concernImpact}</strong>
                </div>
              </div>
            ) : null}
            <div className="analysis-block">
              <h3>今見えていること</h3>
              <p>{analysis.opening}</p>
            </div>
            {transits ? (
              <div className="analysis-block">
                <h3>今日の星と出生図の接点</h3>
                <ul>
                  {transits.aspects.slice(0, 5).map((aspect) => (
                    <li key={`${aspect.transit.key}-${aspect.natal.key}-${aspect.type}`}>
                      今日の{aspect.transit.name}が出生図の{aspect.natal.name}に{aspect.type} / orb {aspect.orb.toFixed(1)}度
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="analysis-block">
              <h3>あなたの星の根拠</h3>
              <ul>
                {analysis.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="analysis-block">
              <h3>今読めるあなたの本質</h3>
              <p>{analysis.firstHalf}</p>
            </div>

            {!unlocked ? (
              <div className="member-gate">
                <h3>この先は会員登録をすることで見ることができます。</h3>
                <p>
                  続きでは、現在の星の流れ、悩みの深い原因、短期・中期・長期の変化、次に取るべき行動まで読み解きます。
                  あなたの星を記録しておくことで、次回からも同じ文脈で続けて相談できます。
                </p>
                <div className="member-gate-actions">
                  <Link className="button primary" href="/register?returnTo=/reading">
                    無料会員登録してこの先を見る
                  </Link>
                  <Link className="button" href="/consultation">
                    会員登録はしないで、この星のあなたについて占い師に相談する
                  </Link>
                  <Link className="button subtle" href="/account">
                    登録情報を確認する
                  </Link>
                </div>
                <Link className="text-link" href="/terms">
                  利用規約・鑑定前のご注意を確認する
                </Link>
              </div>
            ) : (
              <>
                <div className="analysis-block">
                  <h3>深い読み解き</h3>
                  <p>{analysis.secondHalf}</p>
                </div>
                <div className="analysis-block">
                  <h3>次に取るべき行動</h3>
                  <p>{analysis.action}</p>
                </div>
                <Link className="button primary" href="/consultation">
                  この星のあなたについて詳しく相談する（{remainingChats}）
                </Link>
              </>
            )}
          </section>

          <section className="panel topic-panel">
            <div className="eyebrow">Next Question</div>
            <h2>今は、あなたの星を理解しただけにすぎません。</h2>
            <p>
              あなたの星の位置と今の星の位置、そして悩みや願いを重ねることで、ここからさらに具体的に紐解けます。恋愛、仕事、相性、将来の迷いまで、今の言葉で続けて相談できます。
            </p>
            <div className="free-status">
              <div>
                <span>無料で読める範囲</span>
                <strong>人物像の星読み + 本質の追加鑑定</strong>
              </div>
              <div>
                <span>今の相談プラン</span>
                <strong>{remainingChats}</strong>
              </div>
            </div>
            <p className="continuation-copy">
              ここから先は、星の文脈を記憶し、あなた専用の占い師として未来を占います。
            </p>
            <div className="actions compact-actions">
              <Link className="button primary" href="/consultation">
                この星のあなたについて詳しく相談する
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function readStoredBirth() {
  const queryBirth = readBirthFromQuery();
  if (queryBirth) return queryBirth;
  return readStorageJson<BirthInput>("localStorage", "hoshiyomi:birth") ?? readStorageJson<BirthInput>("sessionStorage", "hoshiyomi:birth");
}

function readBirthFromQuery() {
  try {
    const raw = new URLSearchParams(window.location.search).get("birth");
    return raw ? (JSON.parse(raw) as BirthInput) : null;
  } catch {
    return null;
  }
}

function writeStoredBirth(input: BirthInput) {
  const value = JSON.stringify(input);
  writeStorageValue("localStorage", "hoshiyomi:birth", value);
  writeStorageValue("sessionStorage", "hoshiyomi:birth", value);
}

function readStorageJson<T>(storageName: "localStorage" | "sessionStorage", key: string): T | null {
  try {
    const value = readStorageValue(storageName, key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function readStorageValue(storageName: "localStorage" | "sessionStorage", key: string) {
  try {
    return window[storageName].getItem(key);
  } catch {
    return null;
  }
}

function writeStorageValue(storageName: "localStorage" | "sessionStorage", key: string, value: string) {
  try {
    window[storageName].setItem(key, value);
  } catch {
    // Storage can be unavailable in private or embedded browsers. The page can still use the query fallback for the first read.
  }
}

function buildPersonalityProfile(chart: Chart) {
  const sun = chart.planets.find((planet) => planet.key === "sun")!;
  const moon = chart.planets.find((planet) => planet.key === "moon")!;
  const mercury = chart.planets.find((planet) => planet.key === "mercury")!;
  const venus = chart.planets.find((planet) => planet.key === "venus")!;
  const mars = chart.planets.find((planet) => planet.key === "mars")!;
  const jupiter = chart.planets.find((planet) => planet.key === "jupiter")!;
  const saturn = chart.planets.find((planet) => planet.key === "saturn")!;
  const pluto = chart.planets.find((planet) => planet.key === "pluto")!;
  const asc = chart.ascendant;
  const strongestAspect = chart.aspects[0];

  return {
    summary: `太陽は${sun.sign.name}、月は${moon.sign.name}。外へ向かう意志と、内側で安心する感覚が違う質を持っています。${asc ? `さらにASCは${asc.sign.name}なので、周囲には${asc.sign.name}らしい始まり方や第一印象で伝わりやすい人です。` : "出生時刻が空欄のためASCとハウスは省略していますが、太陽・月・主要天体から性質の核は読めます。"}この星の並びは、軽く見える部分と、心の奥でかなり現実的に考える部分が同時にある人に出やすい配置です。`,
    blocks: [
      {
        label: "Core",
        title: "表では動ける。でも内側では慎重に確かめる人",
        text: `太陽${sun.sign.name}は${elementTone(sun.sign.element)}一方で月${moon.sign.name}は${elementTone(moon.sign.element)}人前では反応が速く見えても、心の奥では「本当に大丈夫か」を静かに確認してから安心するタイプです。`
      },
      {
        label: "Mind",
        title: "考え方と言葉の使い方",
        text: `水星${mercury.sign.name}は、思考や言葉の癖を示します。あなたはただ感情で決めるより、言葉にして整理した時に自分の本音が見えやすい人です。迷っている時ほど、頭の中だけで回さず、誰かに話すか文章にすることで答えが近づきます。`
      },
      {
        label: "Love",
        title: "愛し方と、欲しい距離感",
        text: `金星${venus.sign.name}は愛し方や心地よさ、火星${mars.sign.name}は距離の詰め方を示します。好きな人には気持ちがあっても、勢いだけで踏み込むより、相手とのバランスや具体的な反応を見ながら進みたいところがあります。恋愛では「ちゃんと大切にされている実感」がかなり重要です。`
      },
      {
        label: "Growth",
        title: "広がる力と、乗り越える課題",
        text: `木星${jupiter.sign.name}は可能性が広がる方向、土星${saturn.sign.name}は時間をかけて育てる課題です。自然に伸びる部分と、最初は重く感じる部分がはっきり分かれやすい人です。ただ、土星のテーマは逃げずに向き合うほど、後から信頼や専門性に変わります。`
      },
      {
        label: "Deep",
        title: "無意識で繰り返しやすいテーマ",
        text: `冥王星${pluto.sign.name}は、表面的な願いの奥にある深い変容ポイントを示します。あなたは「もう同じままではいたくない」と感じた時、人生の選び方そのものを変える力があります。${strongestAspect ? `特に${strongestAspect.from}と${strongestAspect.to}の${strongestAspect.type}は、才能としても葛藤としても出やすい接点です。` : "強いアスペクトが少ない場合は、日々の小さな選択の積み重ねに本質が出やすくなります。"}`
      }
    ]
  };
}

function elementTone(element: "火" | "地" | "風" | "水") {
  const tones = {
    火: "直感、情熱、勢いを使って前へ進む質があります。",
    地: "現実感、安定、積み重ねを大切にする質があります。",
    風: "言葉、情報、人との対話を通して整理する質があります。",
    水: "感情、共感、記憶や雰囲気を深く受け取る質があります。"
  };
  return tones[element];
}

function buildAnalysis(chart: Chart, topic: Topic, transits: TransitSnapshot | null) {
  const focusPlanets = topic.focus.map((key) => chart.planets.find((planet) => planet.key === key)).filter(Boolean);
  const sun = chart.planets.find((planet) => planet.key === "sun")!;
  const moon = chart.planets.find((planet) => planet.key === "moon")!;
  const pluto = chart.planets.find((planet) => planet.key === "pluto");
  const asc = chart.ascendant;
  const aspect = chart.aspects[0];
  const transitAspect = transits?.aspects[0];
  const transitSun = transits?.chart.planets.find((planet) => planet.key === "sun");
  const transitMoon = transits?.chart.planets.find((planet) => planet.key === "moon");
  const transitJupiter = transits?.chart.planets.find((planet) => planet.key === "jupiter");
  const dateText = formatJapaneseDate(new Date());
  const monthText = formatJapaneseMonth(new Date());
  const positions = focusPlanets.map((planet) => formatPosition(planet!));

  return {
    todayFortune: transitMoon
      ? `${dateText}の月は${transitMoon.sign.name}。感情の動きがいつもより${transitMoon.sign.element}の質を帯び、直感的な反応にヒントが出やすい日です。`
      : `${dateText}の月の位置をもとに、感情の揺れと行動のタイミングを見ています。`,
    monthlyTheme: transitSun
      ? `${monthText}は太陽が${transitSun.sign.name}を進み、${sun.sign.name}の太陽を持つあなたに「自分の言葉で選ぶ」テーマを投げかけています。`
      : `${monthText}は太陽の移動を中心に、表に出す意志と選択のテーマを見ています。`,
    concernImpact: transitAspect
      ? `今日の${transitAspect.transit.name}が出生図の${transitAspect.natal.name}に${transitAspect.type}。${topic.label}では、いつもの反応を少し違う角度から見直す影響が出ています。`
      : `目立つ強いトランジットは少なめです。${topic.label}では、大きな出来事より日々の違和感を丁寧に拾うことが鍵になります。`,
    opening: `${topic.label}について見る時、まず大切なのは太陽の${sun.sign.name}が示す人生の方向性と、月の${moon.sign.name}が示す心の安心条件です。あなたは外側では${sun.sign.element}の質を使って進もうとしながら、内側では${moon.sign.element}の質で気持ちを整えようとします。${transitJupiter ? `さらに今の木星は${transitJupiter.sign.name}にあり、可能性を広げる方向を静かに示しています。` : ""}`,
    evidence: [
      chart.input.time
        ? `出生地: ${chart.input.city}（緯度${Number(chart.input.latitude).toFixed(4)} / 経度${Number(chart.input.longitude).toFixed(4)}）。出生時刻と合わせてASC、MC、ハウス計算に反映しています。`
        : `出生地: ${chart.input.city}（緯度${Number(chart.input.latitude).toFixed(4)} / 経度${Number(chart.input.longitude).toFixed(4)}）。出生時刻が空欄のため、場所情報は記録しつつASCとハウスは省略しています。`,
      ...positions,
      pluto ? `冥王星: ${pluto.sign.name}${pluto.degree.toFixed(1)}度。人生の深い変容、手放し、無意識のこだわりに関係します。` : "冥王星は今回の表示対象外です。",
      asc ? `ASC: ${asc.sign.name}${asc.degree.toFixed(1)}度。人から見られやすい第一印象や、物事の始め方に関係します。` : "出生時刻が不明なため、ASCとハウスは省略しています。",
      aspect ? `最も強いアスペクト: ${aspect.from}と${aspect.to}の${aspect.type}。このテーマでは内側の緊張や才能の出方を読む鍵になります。` : "主要アスペクトは穏やかです。単独の天体配置を丁寧に読む方が向いています。"
    ],
    firstHalf: buildTopicFirstHalf(topic, sun, moon, transitAspect),
    secondHalf: buildTopicDeepDive(topic, focusPlanets as BodyPosition[], pluto),
    action: buildTopicAction(topic, chart)
  };
}

function buildTopicFirstHalf(topic: Topic, sun: BodyPosition, moon: BodyPosition, transitAspect: TransitSnapshot["aspects"][number] | undefined) {
  const transitText = transitAspect
    ? `今は今日の${transitAspect.transit.name}が出生図の${transitAspect.natal.name}に${transitAspect.type}を作り、このテーマが普段より意識に上がりやすい流れです。`
    : "今日の星の流れは強い外圧よりも、内側の反応を丁寧に拾うことに向いています。";

  switch (topic.key) {
    case "love":
      return `恋愛では、月の${moon.sign.name}が示す安心の条件と、太陽の${sun.sign.name}が求める自分らしい選択が噛み合うかが鍵です。好きという気持ちだけで進めるより、連絡頻度、会うペース、言葉の温度に無理がないかを見ると、この恋があなたを満たすものか見えやすくなります。${transitText}`;
    case "compatibility":
      return `相性を見る時は、盛り上がりよりも「一緒にいる時の自分が自然か」を見る方が深く読めます。月の${moon.sign.name}は素の反応、太陽の${sun.sign.name}は人生の進み方を示します。相手に合わせた時に自分の輪郭が薄くなるなら、関係の距離感を調整するサインです。${transitText}`;
    case "career":
      return `仕事では、太陽の${sun.sign.name}が示す成長方向を実際の役割に使えているかが重要です。月の${moon.sign.name}が疲れを感じる環境に長くいると、本来の力まで鈍りやすくなります。続けるか辞めるかの前に、どの能力が使えていて、どこが消耗だけになっているかを分けて見ましょう。${transitText}`;
    case "money":
      return `お金では、安心のために使うお金と、未来を広げるために使うお金を分けることが大切です。月の${moon.sign.name}は不安な時の反応を、太陽の${sun.sign.name}は長期的に育てたい価値を示します。使い方の癖を責めるより、どの支出が自分を整え、どの支出が不安の穴埋めになっているかを見ると流れが変わります。${transitText}`;
    case "decision":
      return `迷いのテーマでは、月の${moon.sign.name}が感情面の安全確認を求め、太陽の${sun.sign.name}が前へ進む理由を求めています。どちらかを無視すると、決めた後に揺り戻しが起きやすい配置です。選択肢を「気持ちが楽になるもの」と「未来の自分が強くなるもの」に分けて見てください。${transitText}`;
    default:
      return `${topic.question}という問いでは、太陽の${sun.sign.name}が示す人生の方向性と、月の${moon.sign.name}が示す心の安心条件のバランスが鍵になります。今のあなたに必要なのは、抽象的な正解よりも、このテーマで何を守り、何を変えたいのかを具体的にすることです。${transitText}`;
  }
}

function buildTopicDeepDive(topic: Topic, focusPlanets: BodyPosition[], pluto: BodyPosition | undefined) {
  const focusText = focusPlanets.map((planet) => `${planet.name}の${planet.sign.name}`).join("、");
  const plutoText = pluto ? `冥王星の${pluto.sign.name}は、表では平気に見せていても、心の奥で「もう同じままではいたくない」と感じる領域を示します。` : "";

  switch (topic.key) {
    case "love":
      return `さらに深く見ると、${focusText}が恋愛の読み解きの軸になります。金星は愛され方、火星は追いかけ方、月は不安になった時の反応です。今の恋で苦しくなる時は、相手の答えを待つ時間そのものより、その間に自分の価値を疑ってしまうことが本当の負担になりやすいでしょう。${plutoText}`;
    case "compatibility":
      return `相性では、${focusText}が「惹かれる理由」と「続けるための条件」を分けて見せます。金星だけが強い関係はときめきやすく、土星が絡む関係は責任や時間の積み重ねが必要です。長く続くかは、楽しい時より、意見が違う時にお互いの尊厳を守れるかで見えてきます。${plutoText}`;
    case "career":
      return `仕事では、${focusText}が才能の出し方を示します。太陽は目指す方向、水星は伝え方、火星は突破力です。今の場所で評価されない場合でも、才能がないのではなく、使う場面や見せ方が噛み合っていない可能性があります。${plutoText}`;
    case "money":
      return `お金では、${focusText}が価値観、拡大、制限のバランスを示します。金星は心地よい支出、木星は広げたい欲求、土星は守るべき基盤です。増やす運だけを見るより、どこで安心を買いすぎているか、どこなら投資的に使えるかを分けるほど金運は扱いやすくなります。${plutoText}`;
    default:
      return `さらに深く見ると、このテーマでは${focusText}が重要です。あなたは一見自然に対応しているようで、大事な場面ほど周囲の期待と自分の納得の間で揺れやすい面があります。${plutoText}今は、他人に合わせる選択より、自分の価値観が残る選択を選ぶほど、後から流れを活かしやすくなります。`;
  }
}

function buildTopicAction(topic: Topic, chart: Chart) {
  const moon = chart.planets.find((planet) => planet.key === "moon")!;
  const mercury = chart.planets.find((planet) => planet.key === "mercury")!;
  const venus = chart.planets.find((planet) => planet.key === "venus")!;
  const mars = chart.planets.find((planet) => planet.key === "mars")!;
  const saturn = chart.planets.find((planet) => planet.key === "saturn")!;

  switch (topic.key) {
    case "love":
      return `まず、今の恋で本当に欲しいものを「連絡」「安心感」「言葉」「会う頻度」のどれかに絞ってください。金星の${venus.sign.name}は愛情の受け取り方、月の${moon.sign.name}は不安の出方を示します。次に相手と向き合う時は、確認したいことをひとつだけ短く聞くのがおすすめです。`;
    case "compatibility":
      return `次に相手と関わる時は、火星の${mars.sign.name}を意識して、小さな希望をひとつだけ言葉にしてください。判断基準は「相手が望み通りに動くか」ではなく、「違う意見を出しても関係が壊れないか」です。`;
    case "career":
      return `今日、仕事を「続けたい要素」「減らしたい要素」「限界に近い要素」に分けて書いてください。水星の${mercury.sign.name}は言語化で才能の輪郭を出しやすく、土星の${saturn.sign.name}は我慢すべき課題と手放す負荷を見分ける必要を示します。`;
    case "money":
      return `まずできることは、今月の固定費と衝動的な支出を分けることです。金星の${venus.sign.name}は心地よさへの支出、土星の${saturn.sign.name}は守るべき土台を示します。次に、毎月自然に出ていくお金をひとつだけ減らせるか確認してください。`;
    case "decision":
      return `まず、選択肢を「気持ちが楽になる」「未来の自分が強くなる」「誰かの期待に応えようとしている」に分けてください。火星の${mars.sign.name}は小さく動いて確かめる力を示すので、次は一番リスクの小さい試行をひとつ置くと判断しやすくなります。`;
    default:
      return `今日できることは、${topic.label}について「本当は望んでいること」「怖くて避けていること」「今週ひとつだけ試せること」を3行で書くことです。月の${moon.sign.name}が感情の反応を示し、火星の${mars.sign.name}が小さく動かす力を示します。星は結論を押しつけるものではなく、選び方を澄ませるための地図です。`;
  }
}

function formatJapaneseDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatJapaneseMonth(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long"
  }).format(date);
}
