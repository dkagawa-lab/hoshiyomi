import { Chart, TransitSnapshot, formatPosition } from "@/lib/astrology";
import { ReaderStyleKey, resolveReaderStyle } from "@/lib/readerStyles";
import { PlanKey, resolvePlan } from "@/lib/plans";
import { QuestionIntentKey, resolveQuestionIntent } from "@/lib/questionIntents";
import { genderLabel, romanticInterestLabel } from "@/lib/profileOptions";

export function buildChartContext(chart: Chart) {
  const planets = chart.planets.map(formatPosition).join("\n");
  const angles = [chart.ascendant, chart.midheaven].filter(Boolean).map((p) => formatPosition(p!)).join("\n");
  const aspects = chart.aspects.map((a) => `${a.from} - ${a.to}: ${a.type} orb ${a.orb.toFixed(1)}度`).join("\n");
  return [
    `相談者: ${chart.input.name || "ゲスト"}`,
    `プロフィール: 性別 ${genderLabel(chart.input.gender)} / 恋愛対象 ${romanticInterestLabel(chart.input.romanticInterest)}`,
    `出生地: ${chart.input.city} (${chart.input.latitude}, ${chart.input.longitude})`,
    `出生日時: ${chart.input.date} ${chart.input.time || "時刻不明"}`,
    "",
    "天体:",
    planets,
    angles ? `\n感受点:\n${angles}` : "",
    aspects ? `\n主要アスペクト:\n${aspects}` : ""
  ].join("\n");
}

export function buildTransitContext(transits: TransitSnapshot) {
  const planets = transits.chart.planets.map(formatPosition).join("\n");
  const aspects = transits.aspects
    .map((a) => `現在の${a.transit.name} - 出生図の${a.natal.name}: ${a.type} orb ${a.orb.toFixed(1)}度`)
    .join("\n");
  return [`日時: ${transits.dateLabel}`, "", "現在の天体:", planets, aspects ? `\n出生図との主要アスペクト:\n${aspects}` : ""].join("\n");
}

export function buildAnswerQualityContext(planKey?: PlanKey, questionIntentKey?: QuestionIntentKey) {
  const plan = resolvePlan(planKey);
  const intent = resolveQuestionIntent("", questionIntentKey);
  return `回答品質の最低条件:
- 今回のテーマ「${intent.label}」に直接答える。恋愛相談なら恋愛、仕事相談なら仕事の判断に戻し、抽象的な自己理解だけで終わらせない
- 冒頭2〜3文で、相談者が今いちばん知りたいことへの答えを出す。ただし「まず結論」などの固定見出しに頼らない
- 出生図の配置を最低3つ使い、それぞれ「何の象徴か」「今回の質問にどう関係するか」まで説明する
- 現在のトランジットを最低1つ使い、現在日付または今月表記を入れて、いま起きやすい心理・行動の流れへつなげる
- 配置名の羅列で終わらせない。太陽・月・金星などの意味を、相談者の具体的な悩みへ翻訳する
- 短期・中期・長期の展望を必ず入れる。変わる可能性は示すが、断定的予言にはしない
- 現実で試すことは「今日」「次に動く時」「しばらく意識する判断基準」のように、自然な時間感覚で分ける。時間で機械的に区切る固定表現は使わない
- 今回のテーマが「今日の運勢」の場合は、今日の総合運、恋愛運、仕事運、対人運、金運、ラッキーカラー、ラッキーナンバー、ラッキーアイテム、ラッキーフード、今日気をつけること、今日の一言行動を必ず入れる
- 「24時間以内」「7日以内」「七日以内」「1週間以内」のような、機械的な期限見出しや行動区切りは使わない
- 最後に次に聞きたくなる問いを2〜3個出す。今回の質問と星の根拠につながる問いにする
- 「すぐに答えを決めるより」「自分の本音」「丁寧に見る」「今のあなたに必要」などの汎用表現を繰り返さない
- ${plan.label}の回答量「${plan.answerLength}」に合わせる。短くまとめすぎず、同じ内容の言い換えで水増しもしない
- 回答は必ず最後まで完結させる。長くなりすぎる場合は項目数を減らしてでも、途中で文章が切れたような終わり方にしない
- Markdown記法を使わない。「##」「###」「**」「---」「- 」などの記号で装飾しない
- 見出しを使う場合は、記号なしの短い日本語だけを1行で置く。例: 仕事を続ける前に見ること`;
}

export function systemPrompt(readerStyle?: ReaderStyleKey, planKey?: PlanKey, questionIntentKey?: QuestionIntentKey, question = "") {
  const style = resolveReaderStyle(readerStyle);
  const plan = resolvePlan(planKey);
  const intent = resolveQuestionIntent(question, questionIntentKey);
  return `あなたは日本語で鑑定する、深く誠実な西洋占星術師です。
相談者の出生図、現在のトランジット、質問文を必ず統合して、専任の占い師のように丁寧に回答してください。

今回のプラン:
- ${plan.label}
- 回答量: ${plan.answerLength}
- ${plan.answerPolicy}

今回の占い師タイプ:
- ${style.label}
- ${style.promptInstruction}
${buildReaderStyleResponseRules(style.key)}

口調の優先順位:
- 今回選ばれている占い師タイプの口調を最優先する。直近の相談履歴に別の占い師タイプの回答があっても、その口調は引き継がない
- 以前の回答内容は文脈として参照してよいが、「榊リカ」「黒瀬レイ」など別タイプの強い言い回し、説教口調、命令口調は今回の回答に混ぜない

今回の相談テーマ:
- ${intent.label}
- ${intent.promptInstruction}

回答方針:
- まず質問文の具体語を拾い、何に答える鑑定なのかを1〜2文で明確にする。「今のあなたに必要なこと」のような汎用表現に逃げない
- 今回の相談テーマの指示を優先し、選ばれた内容から外れた一般論に広げすぎない
- 今日の運勢では、現在日付を冒頭で明記し、重すぎる人生相談に広げすぎない。毎日読みたくなる軽さを保ちつつ、星の根拠と今日の注意点は具体的にする
- 恋愛相談では、プロフィールの恋愛対象を尊重する。未選択や回答しないの場合は、相手を男性/女性と決めつけず「相手」「好きな人」と表現する
- 恋愛対象が「対象が男か女かわからない」の場合は、相手の性別を決めつけず、関係性・言葉・距離感・確認すべきことを中心に読む
- 恋愛対象が「迷っている」の場合は、自分の気持ちが揺れている前提で、惹かれ方、安心感、違和感、焦って決めないための判断軸を中心に読む
- 恋愛対象が「どちらもない」の場合は、恋愛感情を前提に押しつけず、安心できる距離感、関係性、本人の違和感を中心に読む
- 回答内で「このテーマでは何を見ているのか」を自然に示し、質問者が次も同じ文脈で聞きたくなる余白を残す
- 回答は短く終わらせない。目安は${plan.answerLength}。${plan.key === "free" ? "無料プランでは要点を絞りながらも、質問に直接答え、星の根拠を薄くしない。" : "満足感のある鑑定文にする"}
- ${plan.key === "luxury" ? "プライベートプランでは、優しい一般論で終わらせず、矛盾、変化可能性、本人が避けている判断基準まで踏み込む。" : "必要以上に長く引き伸ばさず、質問テーマに関係する根拠を優先する"}
- 冒頭の「まず結論」は毎回同じ定型句にしない。質問の内容に応じて、恋愛・仕事・お金・相性・人生テーマで切り口と言い回しを変える
- 「まず結論」「出生図から見える本質」「今日からできること」などの見出しを毎回そのまま使わない。相談テーマに合わせて見出し名も変える
- 冒頭は冗長にしない。最初の結論は2〜3文で端的に述べ、その後に根拠を展開する
- 「すぐに答えを決めるより」「自分の本音」「丁寧に見る」などの表現を連発しない
- 直前の回答と同じ言い回し、同じ結論文、同じ締め方を避ける。会話履歴がある場合は、前回と違う角度から読む
- 質問に直接答えたうえで、出生図の根拠を複数示す
- 太陽、月、水星、金星、火星、木星、土星、天王星、海王星、冥王星のうち、質問に関係する天体を3つ以上使う
- 星座の性質、天体の象徴、ハウス、アスペクト、現在のトランジットを組み合わせて読む
- 「今日」「今月」と書く時は、必ず現在日付を「YYYY年M月D日」または「YYYY年M月」の形で明記する
- 「なぜそう読めるのか」を説明する。配置名を羅列するだけで終わらない
- 相談者の不安を煽らず、でも薄い励ましでごまかさない
- 短期・中期・長期の展望を入れ、今後どこが変わる可能性があるかを示唆する
- ただし「必ず起きる」と断定せず、「兆し」「変化しやすい領域」「意識すると変えられる流れ」として表現する
- 回答の最後に、続けて聞きたくなる自然な問いを2〜3個提案する
- 提案する問いは、今回の質問内容と出生図の根拠につながるものにする
- 「もっと課金しないと危険」のような煽りはしない。代わりに「ここを掘ると、より具体的に見える」という前向きな導線にする
- 過去の会話がある場合は、「前に話していたテーマ」として自然に接続し、相談が積み重なっている感覚を出す
- 相談者が次に使いやすいよう、回答内に「次に見ると良い観点」を残す
- 最後は現実で使える行動提案を2〜3個出す
- 行動提案は一般論にしない。質問テーマに直結した、今日軽く整えること、次に相手や環境と向き合う時に試すこと、迷った時の判断基準を具体的に書く
- 行動提案を「24時間以内」「7日以内」「七日以内」「1週間以内」で区切らない。必要なら「今日軽く整えること」「次に気持ちが動いた時に見ること」「しばらく意識する判断基準」に言い換える
- 恋愛なら連絡頻度、言葉の選び方、距離感、相手に確認することまで踏み込む
- 仕事なら続ける/辞めるではなく、何を検証すべきか、誰に何を相談するか、どの条件が揃えば動くかを書く
- お金なら支出・収入・習慣のどこを見るか、今週確認する数字を書く

回答構成:
- 固定テンプレートにしない。質問テーマに応じて3〜5個の見出しを選び、見出し名も内容に合わせて変える
- 恋愛なら「相手との距離」「確認すべき言葉」「続ける条件」、仕事なら「消耗の正体」「動く前の検証」「交渉する条件」、お金なら「漏れている場所」「収入化の仮説」「今週見る数字」のように、テーマ固有の切り口にする
- どの構成でも、質問への答え、星の根拠、現在の星の影響、短期・中期・長期、現実で試す行動、次に深掘りできる問いは入れる
- Markdownではなく、鑑定士がそのまま書いた手紙のように整える。見出しは「##」や太字ではなく、自然な短文の行にする
- 箇条書きにする場合は「・」を使う。番号を使う場合も必要最小限にし、レポート感を出しすぎない

${buildAnswerQualityContext(plan.key, intent.key)}

ルール:
- 医療、法律、投資、ギャンブルの判断はしない
- 「必ず起きる」「絶対に別れる」のような断定的予言をしない
- 不安を煽って課金させる表現をしない
- ${style.key === "harsh" ? "辛辣タイプでは、品のない罵倒や人格否定は避ける。ただし耳に痛い指摘は薄めず、昔ながらの辛口占い師のような説教感、断言、強い言い切りを優先する" : "文章は上品で、神秘的だが現実から離れすぎない"}
- AIが生成した文章に見えるMarkdown記号や機械的な区切り線を使わない
- 見出しを使って読みやすくする。ただし装飾記号なしで自然に見せる
- 最後の一文まで書き切る。途中で出力が切れそうな場合は、次に聞ける問いを短くしてでも自然に締める`;
}

function buildReaderStyleResponseRules(styleKey: ReaderStyleKey) {
  if (styleKey === "harsh") {
    return `辛辣タイプの追加ルール:
- 語り口は、昔ながらの辛口占い師のような強さにする。やさしいカウンセラー口調にしない
- 冒頭3文以内に、相談者が見ないふりをしている可能性を1つはっきり指摘する。前置きは短く、最初から切り込む
- 「相手が悪い」「状況が悪い」だけで終わらせず、相談者側の甘い期待、先延ばし、相手任せ、都合のいい解釈を星の根拠と一緒に読む
- 使ってよい表現: 「はっきり言います」「それは甘いです」「そこで逃げているから同じことになります」「その期待は相手に預けすぎです」「腹を決めなさい」「筋を通しなさい」「まずそこを切りなさい」「今のままだと同じ場所を回ります」「耳に痛いですが、ここを見ないと変わりません」
- 語尾は「〜しなさい」「〜です」「〜じゃありません」「〜してはいけません」を混ぜる。弱い遠回し表現を続けない
- 未来予言としての断定は禁止だが、現状評価は強く言い切ってよい。例: 「この考え方は甘いです」「その待ち方はあなたを弱くします」
- 避ける表現: 「大丈夫です」「ゆっくりで大丈夫」「まずは自分を責めないで」「丁寧に見ていきましょう」「少しずつでいい」のような、辛辣さを薄める慰め
- ただし、人格否定、罵倒、脅し、恐怖訴求、依存させる言い方は禁止。辛辣さは現実を見せるために使い、傷つけるために使わない
- 最後の行動提案も甘くしない。気持ちを整えるだけでなく、連絡する/距離を置く/条件を確認する/数字を見る/誰に相談する、まで具体化し、「やりなさい」「やめなさい」の強さで締める`;
  }
  if (styleKey === "direct") {
    return `はっきり厳しめタイプの追加ルール:
- 黒瀬レイは、現実的な判断材料を整理する鑑定師として書く。優しい前置きを長くしない
- 見ないふり、先延ばし、曖昧な期待がある場合は具体的に指摘する
- 「〜です」「〜を見るべきです」「ここは確認しましょう」のように、端的で冷静な言い方を中心にする
- 辛辣タイプほど刺す言い方にはせず、説教、命令、罵倒、突き放しは避ける。厳しさは、感情ではなく判断材料の明確さで出す
- 最後は、相手や状況に期待する前に確認すべき条件、切るべき曖昧さ、次の行動を具体化する`;
  }
  if (styleKey === "companion") {
    return `寄り添い系タイプの追加ルール:
- 雨宮しずくは、包み込む年上の相談相手のような語り口にする。強い説教、命令、突き放し、辛口の断言は使わない
- 「そう感じるのも無理ないよ」「ここは急がなくて大丈夫」「まずはここだけ見てみようね」のように、あたたかく受け止めてから助言する
- 「しなさい」「甘いです」「はっきり言います」「今のままだと同じ場所を回ります」のような強い言い方は禁止
- 語尾は「〜してみてくださいね」「〜してあげるといいです」「〜かもしれません」「〜で大丈夫です」を中心にする。ただし幼くならないよう、落ち着いた大人の言葉を選ぶ
- 最初に、相談者が抱えている寂しさ、不安、期待、言葉にしにくい願いを具体的に受け止める
- 共感を強めに出すが、共感だけで終わらせない。守ると楽になる境界線と次に確認するとよいことを、やわらかい助言として示す`;
  }
  if (styleKey === "mild") {
    return `マイルドタイプの追加ルール:
- 白月まどかは、穏やかで上品な語り口にする。強い断定で急かさず、心が受け取りやすい順番で伝える
- 寄り添い系ほど感情に深く入り込みすぎず、不安を強めない距離感で選択肢を見せる
- 「可能性があります」「ここから整えられます」「まず小さく見るなら」のように、安心して読める表現を中心にする
- ただし曖昧な励ましだけで終わらせず、星の根拠と次の小さな行動を示す`;
  }
  return `通常タイプの追加ルール:
- 標準鑑定は、出生図と現在の星を偏りなく整理する基本タイプとして書く
- 過度に親密な口調、過度な辛口、演出の強い言い回しは避ける
- 星の根拠、相談への答え、現実で見る判断材料を落ち着いて並べる`;
}

export function demoAnswer(question: string, chart: Chart, transits?: TransitSnapshot, readerStyle?: ReaderStyleKey, planKey?: PlanKey, questionIntentKey?: QuestionIntentKey) {
  const style = resolveReaderStyle(readerStyle);
  const plan = resolvePlan(planKey);
  const intent = resolveQuestionIntent(question, questionIntentKey);
  const sun = chart.planets.find((p) => p.key === "sun")!;
  const moon = chart.planets.find((p) => p.key === "moon")!;
  const mercury = chart.planets.find((p) => p.key === "mercury")!;
  const venus = chart.planets.find((p) => p.key === "venus")!;
  const mars = chart.planets.find((p) => p.key === "mars")!;
  const saturn = chart.planets.find((p) => p.key === "saturn")!;
  const pluto = chart.planets.find((p) => p.key === "pluto");
  const asc = chart.ascendant;
  const mainAspect = chart.aspects[0];
  const transitMoon = transits?.chart.planets.find((p) => p.key === "moon");
  const transitAspect = transits?.aspects[0];
  const dateText = formatJapaneseDate(new Date());
  const monthText = formatJapaneseMonth(new Date());
  const opening = buildOpening(question, chart, intent.key);
  const labels = buildSectionLabels(intent.key);
  const themeReading = buildIntentReading(intent.key, question, chart);
  const nextPrompts = buildNextPrompts(intent.key).map((item) => `・${item}`).join("\n");
  const toneLine = buildToneLine(style.key);
  const profileLine = buildProfileReadingLine(chart, intent.key);
  const dailyLuck = buildDailyLuckItems(chart, transits);

  return `【${labels.answer}】
${opening}

${toneLine}
${profileLine ? `\n\n${profileLine}` : ""}

${plan.label}では、${plan.answerPolicy}
今回の相談は「${intent.label}」として、${intent.demoFocus}を中心に読みます。

【${labels.theme}】
${themeReading}
${intent.key === "daily_luck" ? `\n\n【今日のラッキー要素】\nラッキーカラー: ${dailyLuck.color}\nラッキーナンバー: ${dailyLuck.number}\nラッキーアイテム: ${dailyLuck.item}\nラッキーフード: ${dailyLuck.food}\n今日の気分を整える場所: ${dailyLuck.place}` : ""}

【${labels.birth}】
出生図では、太陽が${sun.sign.name}${sun.degree.toFixed(1)}度、月が${moon.sign.name}${moon.degree.toFixed(1)}度にあります。太陽は人生の方向性や表に出していく意志、月は心の安心条件や素の反応を表します。太陽の${sun.sign.name}は${sun.sign.element}の性質を持つため、人生を進める時にその元素らしいやり方が出やすくなります。一方、月の${moon.sign.name}は、気持ちが揺れた時にどんな環境で落ち着くのかを教えてくれます。

水星は${mercury.sign.name}${mercury.degree.toFixed(1)}度にあり、考え方や言葉の使い方に影響します。迷った時、あなたは感覚だけで決めるより、いったん言葉にして整理することで自分の答えに近づきやすいタイプです。金星は${venus.sign.name}${venus.degree.toFixed(1)}度で、愛し方、心地よさ、美意識を表します。火星は${mars.sign.name}${mars.degree.toFixed(1)}度で、欲しいものに向かう力や怒り方、行動のスイッチを示します。

【${labels.depth}】
土星は${saturn.sign.name}${saturn.degree.toFixed(1)}度にあります。土星は苦手意識や責任、時間をかけて育てる力を示す天体です。ここに表れるテーマは、避けようとすると重くなりますが、向き合うほど人生の軸になります。${pluto ? `さらに冥王星は${pluto.sign.name}${pluto.degree.toFixed(1)}度にあり、表面的な願いの奥にある「本当は変えたいもの」や、無意識のこだわりを示します。` : ""}
${asc ? `ASCは${asc.sign.name}${asc.degree.toFixed(1)}度です。これは人から見られやすい第一印象や、物事を始める時の入り口を表します。あなた自身が思っている自分と、周囲に伝わっている雰囲気が少し違うこともありそうです。` : "出生時刻が不明なためASCとハウスは省略しています。ただし、太陽・月・主要天体だけでも性質の核は十分に読むことができます。"}

【${labels.aspect}】
${mainAspect ? `出生図で目立つアスペクトは、${mainAspect.from}と${mainAspect.to}の${mainAspect.type}です。アスペクトは天体同士の関係性を表します。この配置は、あなたの中で自然に使える才能、または意識しないとぶつかりやすい癖として出てきます。今回の質問では、この${mainAspect.type}が「自分の気持ち」と「現実の選択」をどうつなげるかの鍵になります。` : "出生図上では強烈なアスペクトが少なめなので、ひとつの大きな葛藤よりも、日常の小さな違和感を積み重ねて読む方が合っています。"}

【${labels.timing}】
${transitMoon ? `${dateText}の月は${transitMoon.sign.name}${transitMoon.degree.toFixed(1)}度にあり、感情の反応が${transitMoon.sign.element}の質を帯びやすい日です。月は日々の気分や体感に強く関わるため、${dateText}に感じた違和感や安心感は軽く扱わない方がいいでしょう。` : `${dateText}の星の流れを見ると、短期的な感情の動きと、長期的な人生テーマの両方を分けて考えることが大切です。`}
${transitAspect ? `また、現在の${transitAspect.transit.name}が出生図の${transitAspect.natal.name}に${transitAspect.type}を作っています。これは、普段は見過ごしていたテーマが意識に上がりやすいタイミングです。焦って答えを出すより、「なぜ今これが気になるのか」を見ることで、質問の奥にある本当の願いが見えやすくなります。` : "大きく目立つトランジットが少ない時は、外側の事件よりも内側の整理に向いています。静かな時期ほど、本音の微細な変化を拾いやすいものです。"}
${monthText}の大きなテーマとしては、太陽の位置が示す「どこに意識を向けるか」と、月が日々運んでくる感情の変化を分けて見ることが大切です。

【${labels.outlook}】
短期的には、${dateText}から数日のあいだは「感情の反応を観察すること」が鍵になります。すぐに結論を出すより、どんな言葉や出来事に心が動いたかを記録すると、質問の本質が見えやすくなります。

中期的には、${monthText}のあいだに「続けたいもの」と「もう無理をしたくないもの」の差が少しずつはっきりしてきそうです。これは怖い変化というより、あなたが自分のエネルギーをどこに使うべきかを選び直す流れです。

長期的には、土星や冥王星が示すように、表面的な答えよりも「自分の選び方そのもの」を変えていくことがテーマになります。状況が変わる可能性はありますが、その変化は外から突然与えられるというより、あなたが小さな違和感を無視しないことで開いていくものです。

【${labels.change}】
今の悩みは固定された運命ではありません。特に、言葉にできていない本音を整理すること、相手や環境に合わせすぎている部分を見直すこと、自分が本当に求めている安心感を明確にすることで、流れは変わりやすくなります。

${buildActionSection(question, chart, intent.key)}

この鑑定で大事なのは、星の説明を読んで終わらせず、今の相談に使える判断基準へ変えることです。今日の答えは結論の断定ではなく、あなたが次に選ぶ時の精度を上げるための地図です。

【${labels.next}】
次に聞くなら、たとえば次の問いが向いています。
${nextPrompts}
今回の答えは入口です。質問を重ねるほど、星の説明は「性格の話」から「いま何を選ぶか」の話へ近づいていきます。`;
}

function buildProfileReadingLine(chart: Chart, intentKey: QuestionIntentKey) {
  const gender = genderLabel(chart.input.gender);
  const romanticInterest = romanticInterestLabel(chart.input.romanticInterest);
  if (["love_values", "new_encounter", "reconciliation", "relationship_distance", "continue_love", "marriage"].includes(intentKey)) {
    if (chart.input.romanticInterest === "target_unknown") {
      return `プロフィールでは、性別は「${gender}」、恋愛対象は「${romanticInterest}」として受け取っています。相手の性別を決めつけず、いま見えている関係性と言葉の確認ポイントを中心に読みます。`;
    }
    if (chart.input.romanticInterest === "not_sure") {
      return `プロフィールでは、性別は「${gender}」、恋愛対象は「${romanticInterest}」として受け取っています。気持ちが揺れている前提で、惹かれ方、安心感、違和感を分けながら読みます。`;
    }
    if (chart.input.romanticInterest && chart.input.romanticInterest !== "unspecified") {
      return `プロフィールでは、性別は「${gender}」、恋愛対象は「${romanticInterest}」として受け取っています。この前提を尊重し、相手の性別を勝手に決めつけずに読みます。`;
    }
    return "恋愛対象が未選択のため、相手を男性・女性と決めつけずに読みます。必要なら、次の相談で恋愛対象や相手の性別を入れると、距離感や確認すべき言葉をさらに具体化できます。";
  }
  return chart.input.gender && chart.input.gender !== "unspecified" ? `プロフィールでは、性別は「${gender}」として受け取っています。` : "";
}

function buildDailyLuckItems(chart: Chart, transits?: TransitSnapshot) {
  const moon = transits?.chart.planets.find((p) => p.key === "moon") ?? chart.planets.find((p) => p.key === "moon")!;
  const venus = chart.planets.find((p) => p.key === "venus")!;
  const mercury = chart.planets.find((p) => p.key === "mercury")!;
  const colorByElement = {
    火: ["コーラルレッド", "キャンドルオレンジ", "ウォームゴールド"],
    地: ["セージグリーン", "ミルクベージュ", "オリーブ"],
    風: ["ライトブルー", "シルバーグレー", "ミント"],
    水: ["パールホワイト", "ラベンダー", "ディープブルー"]
  } as const;
  const itemByElement = {
    火: ["赤みのあるリップや小物", "小さな鏡", "温かい飲み物"],
    地: ["革小物", "香りのよいハンドクリーム", "きれいに磨いた靴"],
    風: ["メモ帳", "イヤホン", "軽いストール"],
    水: ["透明なボトル", "やわらかいハンカチ", "月モチーフの小物"]
  } as const;
  const foodByElement = {
    火: ["スパイスの効いた料理", "温かいスープ", "柑橘系のデザート"],
    地: ["根菜の料理", "ナッツ", "焼き菓子"],
    風: ["ハーブティー", "サンドイッチ", "軽い麺類"],
    水: ["白身魚", "ヨーグルト", "水分の多い果物"]
  } as const;
  const placeByElement = {
    火: "少し日が入る場所",
    地: "落ち着いて座れる場所",
    風: "風通しのいい場所",
    水: "水辺や静かなカフェ"
  } as const;
  const colorPool = colorByElement[venus.sign.element];
  const itemPool = itemByElement[moon.sign.element];
  const foodPool = foodByElement[moon.sign.element];
  const seed = Math.round(moon.longitude + venus.longitude + mercury.degree);
  return {
    color: colorPool[seed % colorPool.length],
    food: foodPool[(seed + 2) % foodPool.length],
    item: itemPool[(seed + 1) % itemPool.length],
    number: String((seed % 9) + 1),
    place: placeByElement[moon.sign.element]
  };
}

function buildToneLine(styleKey: ReaderStyleKey) {
  if (styleKey === "mild") return "強い言い方で急がせず、でも曖昧に濁さずに読みます。今は小さく安心を取り戻しながら、次に動く順番を決めるのが合っています。";
  if (styleKey === "companion") return "まずね、その気持ちが揺れるのは自然なことですよ。寂しさや不安、期待、まだうまく言葉にならない願いまで、そのまま置いて大丈夫です。星が示している本音と、心を守るために見てあげたい境界線を、ゆっくり一緒に見ていきましょうね。";
  if (styleKey === "direct") return "少しはっきり言うと、今は気持ちだけで判断すると同じ場所を回りやすいです。星の根拠から、見るべき条件を絞ります。";
  if (styleKey === "harsh") return "はっきり言います。今のまま相手や状況のせいに寄せるなら、同じ場所を回るだけです。星は、あなたが都合よく残している期待を先に切りなさい、と強く出ています。";
  return "偏りすぎず、出生図と今の星を重ねて読みます。結論だけで終わらせず、なぜそう読めるのかまで整理します。";
}

function buildSectionLabels(intentKey: QuestionIntentKey) {
  if (intentKey === "daily_luck") {
    return {
      answer: "今日の星から見える運勢",
      theme: "今日の流れ",
      birth: "今日反応しやすいあなたの星",
      depth: "気分を整える鍵",
      aspect: "今日使える星の組み合わせ",
      timing: "今日の星の動き",
      outlook: "朝・昼・夜の流れ",
      change: "今日気をつけること",
      next: "明日以降も見るなら"
    };
  }
  if (intentKey === "reconciliation") {
    return {
      answer: "戻る前に見るべき答え",
      theme: "復縁の温度と条件",
      birth: "あなたの愛し方の癖",
      depth: "繰り返しやすいパターン",
      aspect: "関係を動かす内側の力",
      timing: "いま連絡するなら見る星",
      outlook: "短期・中期・長期の流れ",
      change: "戻せる部分と戻さない方がいい部分",
      next: "次に聞くと深まること"
    };
  }
  if (intentKey === "new_encounter") {
    return {
      answer: "次の出会いで見えていること",
      theme: "惹かれやすい相手の気配",
      birth: "出会いを受け取る時のあなた",
      depth: "見逃しやすいサイン",
      aspect: "縁が動く星の組み合わせ",
      timing: "いま出会いを拾うなら",
      outlook: "短期・中期・長期の出会い運",
      change: "出会い方を変えられる場所",
      next: "相手像をもっと具体化する問い"
    };
  }
  if (["love_values", "relationship_distance", "continue_love", "marriage"].includes(intentKey)) {
    return {
      answer: "この恋で見えていること",
      theme: "恋愛の核心",
      birth: "愛し方と安心条件",
      depth: "近づくほど出やすい癖",
      aspect: "惹かれ方の星の組み合わせ",
      timing: "いまの恋愛運の流れ",
      outlook: "これから変わりやすい距離",
      change: "選び方で変えられる関係",
      next: "この先をもっと具体化する問い"
    };
  }
  if (["career_stay", "career_change", "talent_money"].includes(intentKey)) {
    return {
      answer: "仕事とお金の判断軸",
      theme: "今見るべき現実条件",
      birth: "才能と働き方の癖",
      depth: "消耗と成長の境目",
      aspect: "能力が伸びる使い方",
      timing: "いま動くなら見る星",
      outlook: "短期・中期・長期の仕事運",
      change: "選択で動かせるキャリア",
      next: "次に絞ると見えること"
    };
  }
  if (intentKey === "monthly_caution") {
    return {
      answer: "今月の注意点",
      theme: "今月いちばん乱れやすい場所",
      birth: "あなたが反応しやすい星",
      depth: "無理をしやすい癖",
      aspect: "注意点を強める配置",
      timing: "今月の星の流れ",
      outlook: "月内の前半・中盤・後半",
      change: "避けるより整えるポイント",
      next: "今月さらに見るなら"
    };
  }
  return {
    answer: "今の相談への答え",
    theme: "このテーマで見るべきこと",
    birth: "星の配置が示すあなたの核",
    depth: "深く効いているテーマ",
    aspect: "天体同士の関係",
    timing: "現在の星の影響",
    outlook: "短期・中期・長期の展望",
    change: "変えられる流れ",
    next: "次に深掘りできる問い"
  };
}

function buildIntentReading(intentKey: QuestionIntentKey, question: string, chart: Chart) {
  const moon = chart.planets.find((p) => p.key === "moon")!;
  const mercury = chart.planets.find((p) => p.key === "mercury")!;
  const venus = chart.planets.find((p) => p.key === "venus")!;
  const mars = chart.planets.find((p) => p.key === "mars")!;
  const jupiter = chart.planets.find((p) => p.key === "jupiter")!;
  const saturn = chart.planets.find((p) => p.key === "saturn")!;
  const pluto = chart.planets.find((p) => p.key === "pluto");

  if (intentKey === "daily_luck") {
    return `今日の運勢は、月の${moon.sign.name}が示す気分の揺れ方と、水星の${mercury.sign.name}が示す判断の癖を中心に見ると使いやすいです。金星の${venus.sign.name}は、今日心が軽くなる色や持ち物のヒントになります。火星の${mars.sign.name}は、勢いで動くより「小さくひとつ片づける」ことで運を整えやすいことを示しています。`;
  }
  if (intentKey === "new_encounter") {
    return `出会いを見る時は、金星の${venus.sign.name}が示す「惹かれやすい雰囲気」と、火星の${mars.sign.name}が示す「距離の詰め方」を分けて読みます。あなたの場合、最初から強く追いかける相手より、会話のテンポや生活感の中で自然に気持ちが動く相手の方が残りやすいです。木星の${jupiter.sign.name}は、広がりが出る場所を示すので、いつもの人間関係の外側にある学び、紹介、趣味、仕事の接点にも目を向けると出会いを拾いやすくなります。`;
  }
  if (intentKey === "relationship_distance") {
    return `距離感の相談では、水星の${mercury.sign.name}がかなり重要です。連絡の量より、どんな言葉ならあなたが自分を削らずに伝えられるかを見る配置です。月の${moon.sign.name}は不安になった時の反応を示すため、返信の速さだけで相手の気持ちを測ると、余計に揺れやすくなります。火星の${mars.sign.name}は、待つだけではなく、短く具体的に確認する行動が必要な場面もあることを示しています。`;
  }
  if (intentKey === "continue_love") {
    return `この恋を続けるかを見るなら、金星の${venus.sign.name}が示す心地よさと、土星の${saturn.sign.name}が示す現実条件の両方が必要です。好きという感情があっても、同じ不安を何度も繰り返すなら、関係の形を変える必要があります。${pluto ? `冥王星の${pluto.sign.name}は、執着と本音の境目を見せるため、「失うのが怖いから続けたい」のか「深く関わりたいから続けたい」のかを分けることが大切です。` : ""}`;
  }
  if (intentKey === "marriage") {
    return `結婚や長期相性では、金星のときめきだけでなく、月の${moon.sign.name}が示す生活の安心条件と、土星の${saturn.sign.name}が示す責任の持ち方を見ます。長く続く関係は、盛り上がりよりも「疲れている時にどう扱い合えるか」に出ます。木星の${jupiter.sign.name}は、二人で広げられる未来像を示すため、結婚を考えるなら理想より先に生活リズム、お金、家族観を確認する方が現実的です。`;
  }
  if (intentKey === "career_change") {
    return `転職では、太陽が示す成長方向に加えて、水星の${mercury.sign.name}が示す思考の使い方、火星の${mars.sign.name}が示す動き方を見ます。いま大切なのは「辞めたい気持ち」そのものより、次の場所で何を使いたいのかを言語化することです。土星の${saturn.sign.name}は、勢いだけで動くと同じ課題を持ち越しやすいことも示します。`;
  }
  if (intentKey === "talent_money") {
    return `才能と稼ぎ方では、金星の${venus.sign.name}が示す価値観、水星の${mercury.sign.name}が示す伝え方、火星の${mars.sign.name}が示す実行力をつなげて見ます。あなたは「好きなこと」だけで収入化するより、誰のどんな困りごとを軽くできるかまで落とすとお金に変わりやすいです。木星の${jupiter.sign.name}は、今後伸ばすと広がりやすい領域を示しています。`;
  }
  if (intentKey === "monthly_caution") {
    return `今月の注意点は、月の${moon.sign.name}が反応しやすい感情と、土星の${saturn.sign.name}が示す責任や負荷の扱いに出ます。疲れている時ほど判断を急ぎやすくなるため、恋愛、仕事、お金、人間関係を一気に決めないことが大切です。質問が「${question}」であるなら、今月は特に、感情で決める日と現実を確認する日を分けるほど安定します。`;
  }
  if (intentKey === "turning_point") {
    return `転機を見る時は、木星の${jupiter.sign.name}が示す広がり、土星の${saturn.sign.name}が示す責任、${pluto ? `冥王星の${pluto.sign.name}が示す根本的な変化` : "冥王星が示す根本的な変化"}を重ねます。今の変化は、急に別人になるというより、今まで見ないふりをしてきた選択基準を変えていく流れです。`;
  }
  return `この相談では、月の${moon.sign.name}が示す感情の反応、水星の${mercury.sign.name}が示す考え方、火星の${mars.sign.name}が示す行動の出し方を一緒に見る必要があります。質問が「${question}」である以上、抽象的な運勢ではなく、今どの気持ちを信じて、どの条件を確認するかが焦点です。`;
}

function buildNextPrompts(intentKey: QuestionIntentKey) {
  if (intentKey === "daily_luck") return ["今日の恋愛運をもう少し詳しく見て", "今日の仕事運と注意点を見て", "明日の運勢も見て"];
  if (intentKey === "reconciliation") return ["連絡するなら、いつ・どんな文面がよさそう？", "戻してはいけない関係パターンはどこ？", "相手の出生情報も入れると相性ではどう見える？"];
  if (intentKey === "new_encounter") return ["出会いやすい場所や場面をもっと具体的に見たい", "次に惹かれやすい相手の特徴を知りたい", "恋愛で避けた方がいい相手の傾向は？"];
  if (["love_values", "relationship_distance", "continue_love", "marriage"].includes(intentKey)) return ["この相手に今どこまで踏み込んでいい？", "私が恋愛で繰り返しやすい癖は？", "長く続けるなら何を確認すべき？"];
  if (["career_stay", "career_change", "talent_money"].includes(intentKey)) return ["今の仕事で残すべき条件は？", "転職するなら避けた方がいい職場は？", "私の才能を収入に変える最初の一歩は？"];
  if (intentKey === "monthly_caution") return ["今月の恋愛で気をつけることは？", "今月の仕事運をもっと具体的に見たい", "今月避けた方がいい判断は？"];
  return ["この悩みを恋愛面で見るとどうなる？", "仕事やお金にはどう影響する？", "今の星で一番変えやすい行動は？"];
}

function buildActionSection(question: string, chart: Chart, intentKey: QuestionIntentKey = "custom") {
  const moon = chart.planets.find((p) => p.key === "moon")!;
  const mercury = chart.planets.find((p) => p.key === "mercury")!;
  const venus = chart.planets.find((p) => p.key === "venus")!;
  const mars = chart.planets.find((p) => p.key === "mars")!;
  const saturn = chart.planets.find((p) => p.key === "saturn")!;

  if (intentKey === "daily_luck") {
    return `【今日の気をつけること】
・月の${moon.sign.name}が示す反応として、気分で予定を増やしすぎると疲れやすい日です。まずは「今日やること」をひとつ減らして、余白を作ってください。
・水星の${mercury.sign.name}は、言葉の受け取り方に癖が出やすいことを示します。返事を急がず、気になる言葉ほど一度置いてから返すと流れが乱れにくいです。
・今日の一言行動は、机の上かバッグの中をひとつだけ整えること。火星の${mars.sign.name}は、小さな整理から行動運が戻る配置です。`;
  }
  if (intentKey === "reconciliation" || question.includes("復縁")) {
    return `【次に気持ちが揺れた時に見ること】
・まず、相手へ連絡するかどうかではなく「戻りたい理由」を3つ書き出してください。月の${moon.sign.name}は記憶に引っ張られやすい面を示すため、寂しさと愛情を分けることが大切です。
・もし連絡するなら、長文で気持ちをぶつけるより、水星の${mercury.sign.name}を活かして「最近どうしてる？」程度の軽い確認に留めてください。
・見る基準は、相手の反応よりも「前と同じ不安がすぐ戻るか」です。同じ不安が戻るなら、復縁そのものより関係の形を変える必要があります。`;
  }
  if (intentKey === "new_encounter") {
    return `【出会いを拾いやすくする小さな動き】
・まず、最近少しでも気が向いた場所や人との接点を3つ書き出してください。金星の${venus.sign.name}は、あなたが自然体で惹かれる空気を示します。
・次の予定を決める時は、いつもの生活圏から少しだけ外れた選択をひとつ入れてください。火星の${mars.sign.name}は、待つだけではなく小さく動くことで縁を拾いやすい配置です。
・最初に見る基準は、強い刺激より「会話の後に自分が疲れ切っていないか」です。出会いの質は、始まりの派手さより後味に出ます。`;
  }
  if (intentKey === "relationship_distance" || intentKey === "marriage" || question.includes("あの人") || question.includes("相性") || question.includes("結婚")) {
    return `【この関係で確認したい距離感】
・まず、相手といる時の自分を「安心する瞬間」と「無理している瞬間」に分けてメモしてください。金星の${venus.sign.name}は、あなたが本当に心地よい愛情の受け取り方を示します。
・次に会う時は、火星の${mars.sign.name}を意識して、相手に合わせすぎず小さな希望をひとつだけ言葉にしてください。
・長く続く相性かを見る基準は、盛り上がりよりも「沈黙していても自分を責めないでいられるか」です。`;
  }
  if (intentKey === "love_values" || intentKey === "continue_love" || question.includes("恋")) {
    return `【恋を曖昧にしないための見方】
・まず、今の恋で「もっと欲しいもの」をひとつだけ決めてください。連絡、安心感、言葉、会う頻度など、曖昧にしないことが大切です。
・金星の${venus.sign.name}は愛され方の好みを、月の${moon.sign.name}は不安の出方を示します。不安になった時にすぐ相手へぶつけるのではなく、まず自分が何を求めているか一文にしてください。
・相手に確認するなら、聞きたいことをひとつだけ短く聞いてください。試すべきは駆け引きではなく、あなたの本音が受け止められる関係かどうかです。`;
  }
  if (intentKey === "career_stay" || intentKey === "career_change" || question.includes("仕事") || question.includes("転職") || question.includes("才能")) {
    return `【仕事で迷った時に見る条件】
・まず、今の仕事を「残したい要素」「減らしたい要素」「もう限界な要素」に分けてください。土星の${saturn.sign.name}は、我慢すべき課題と手放すべき負荷を見分ける必要を示します。
・近いうちに、信頼できる人へ「私は何が得意に見える？」と聞いてください。水星の${mercury.sign.name}は、言葉にすることで才能の輪郭がはっきりしやすい配置です。
・転職判断の基準は、嫌だから辞めるではなく「次の場所で使いたい能力が明確か」です。火星の${mars.sign.name}が示す行動力を、逃避ではなく選択に使いましょう。`;
  }
  if (intentKey === "talent_money" || question.includes("お金") || question.includes("収入") || question.includes("稼")) {
    return `【お金の流れを整える見方】
・まず、今月の固定費と衝動的に使ったお金を分けて見てください。金星の${venus.sign.name}は、あなたが心地よさにお金を使いやすいポイントを示します。
・収入につながりそうな得意分野を3つ書き出してください。火星の${mars.sign.name}は、実際に動いて試すことで金運が開きやすいことを示します。
・判断基準は「増やす前に漏れを止める」です。大きな勝負より、毎月自然に出ていくお金をひとつ減らす方が流れを変えやすいです。`;
  }
  return `【迷いを現実に戻すための見方】
・まず、今の悩みを「感情」「事実」「相手や環境に期待していること」の3つに分けてください。月の${moon.sign.name}は、感情と現実を混ぜると疲れやすいことを示します。
・小さく試せる行動をひとつ選んでください。火星の${mars.sign.name}は、頭の中で考え続けるより、現実に小さく動かすことで答えが見えやすい配置です。
・判断基準は「その選択をした後、自分を少し大切に扱えている感覚が残るか」です。`;
}

function buildOpening(question: string, chart: Chart, intentKey: QuestionIntentKey = "custom") {
  const sun = chart.planets.find((p) => p.key === "sun")!;
  const moon = chart.planets.find((p) => p.key === "moon")!;
  const venus = chart.planets.find((p) => p.key === "venus")!;
  const mars = chart.planets.find((p) => p.key === "mars")!;
  const saturn = chart.planets.find((p) => p.key === "saturn")!;

  if (intentKey === "daily_luck") {
    const today = formatJapaneseDate(new Date());
    return `${today}の運勢は、派手に大きく動かす日というより、気分と予定の流れを整えることで運が乗りやすい日です。月の${moon.sign.name}が心の反応を、金星の${venus.sign.name}が今日の心地よさとラッキー要素を示しています。`;
  }
  if (intentKey === "reconciliation" || question.includes("復縁")) {
    return `復縁については、急いで答えを出すより「戻りたい理由」と「同じ形に戻してはいけない部分」を分けて見る必要があります。月の${moon.sign.name}は感情の記憶を大切にしますが、土星の${saturn.sign.name}は関係を続けるための現実的な条件を問いかけています。`;
  }
  if (intentKey === "new_encounter") {
    return `出会いについては、「いつ誰が現れるか」だけで見るより、あなたがどんな空気の相手に心を開きやすいかを見る方が現実的です。金星の${venus.sign.name}は惹かれやすい雰囲気を、火星の${mars.sign.name}は縁を動かす時の行動パターンを示しています。`;
  }
  if (intentKey === "relationship_distance" || intentKey === "marriage" || question.includes("あの人") || question.includes("相性") || question.includes("結婚")) {
    return `相手との関係を見る時、鍵になるのは金星の${venus.sign.name}が示す愛し方と、火星の${mars.sign.name}が示す距離の詰め方です。惹かれる気持ちだけでなく、安心して続くリズムがあるかを見ていくと、この関係の本質が見えやすくなります。`;
  }
  if (intentKey === "love_values" || intentKey === "continue_love" || question.includes("恋")) {
    return `恋愛については、今のあなたが「ときめき」と「安心」のどちらを強く求めているかが大切です。金星の${venus.sign.name}は心地よい愛し方を、月の${moon.sign.name}は傷つきやすいポイントを教えてくれます。`;
  }
  if (intentKey === "career_stay" || intentKey === "career_change" || question.includes("仕事") || question.includes("転職") || question.includes("才能")) {
    return `仕事については、今の環境が合うかどうかだけでなく、太陽の${sun.sign.name}が示す成長方向と、水星・火星が示す働き方の癖を見る必要があります。続けるか変えるかの前に、どの能力を使えていて、どこが消耗になっているかを分けて見ましょう。`;
  }
  if (intentKey === "talent_money" || question.includes("お金") || question.includes("収入") || question.includes("稼")) {
    return `お金については、単に増える・減るではなく、金星の${venus.sign.name}が示す価値観と、火星の${mars.sign.name}が示す行動量の噛み合いが重要です。あなたにとっての豊かさは、無理に広げるより「納得できる使い方」から整っていきます。`;
  }
  if (intentKey === "turning_point" || question.includes("人生") || question.includes("転機") || question.includes("成長")) {
    return `人生の流れを見ると、太陽の${sun.sign.name}が示す進みたい方向と、土星の${saturn.sign.name}が示す乗り越える課題が強く関わっています。今は劇的な答えより、長く残る選択を見極めるタイミングです。`;
  }
  if (intentKey === "monthly_caution") {
    return `今月の注意点は、悪いことを避けるためというより、あなたが消耗しやすい場所を先に知るために見ます。月の${moon.sign.name}が揺れやすい反応を、土星の${saturn.sign.name}が現実面で無理をしやすい領域を示しています。`;
  }
  return `この質問では、太陽の${sun.sign.name}が示す意志と、月の${moon.sign.name}が示す安心条件のバランスが鍵になります。答えはひとつに固定されているというより、今どの星の性質を使うかで変わっていきます。`;
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
