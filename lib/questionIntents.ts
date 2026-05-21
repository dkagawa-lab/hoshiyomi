export type QuestionIntentKey =
  | "daily_luck"
  | "general_now"
  | "love_values"
  | "new_encounter"
  | "reconciliation"
  | "relationship_distance"
  | "continue_love"
  | "marriage"
  | "career_stay"
  | "career_change"
  | "talent_money"
  | "monthly_caution"
  | "turning_point"
  | "custom";

export type QuestionIntent = {
  key: QuestionIntentKey;
  label: string;
  promptInstruction: string;
  demoFocus: string;
  keywords: string[];
};

export const questionIntents: QuestionIntent[] = [
  {
    key: "daily_luck",
    label: "今日の運勢",
    promptInstruction:
      "現在日付を必ず明記し、今日の総合運、恋愛運、仕事運、対人運、金運を短く具体的に読む。出生図と今日のトランジットを根拠にし、ラッキーカラー、ラッキーナンバー、ラッキーアイテム、ラッキーフード、今日気をつけること、今日の一言行動を必ず入れる。重い相談に寄せすぎず、毎日気軽に読みたくなる温度にする。",
    demoFocus: "今日の総合運、ラッキー要素、気をつけること、今日の小さな行動",
    keywords: ["今日の運勢", "今日の", "本日の運勢", "本日", "ラッキー", "ラッキーカラー", "ラッキーナンバー", "デイリー"]
  },
  {
    key: "general_now",
    label: "今必要なこと",
    promptInstruction:
      "月、太陽、土星、現在のトランジットを中心に、今いちばん優先すべき整理、避けるべき焦り、今日のうちに軽く整えることを読む。抽象的な励ましで終わらせない。",
    demoFocus: "今の自分を整える順番と、今日ひとつだけ動かすべきこと",
    keywords: ["必要", "今の私", "今する", "今やる", "今どう"]
  },
  {
    key: "love_values",
    label: "恋愛で大切にすべきこと",
    promptInstruction:
      "金星、月、火星を中心に、愛され方の好み、不安が出る条件、距離の詰め方を読む。一般的な恋愛論ではなく、相談者の星に基づく恋愛の癖と確認すべき言葉まで具体化する。",
    demoFocus: "恋愛で欲しい安心感、傷つきやすい点、相手へ伝えるべき一言",
    keywords: ["恋愛", "恋", "好き", "愛", "片思い"]
  },
  {
    key: "new_encounter",
    label: "出会い",
    promptInstruction:
      "金星、火星、木星、可能なら5ハウスと7ハウスを見て、惹かれやすい相手像、出会いが起きやすい場、見逃しやすいサインを読む。運命の相手を断定しない。",
    demoFocus: "惹かれやすい人の雰囲気、出会いを拾いやすい場所、最初に見るべき違和感",
    keywords: ["出会い", "次の人", "新しい恋", "どんな人"]
  },
  {
    key: "reconciliation",
    label: "復縁",
    promptInstruction:
      "月、金星、土星、冥王星を中心に、寂しさと愛情、戻れる条件、戻してはいけない関係パターンを分けて読む。復縁できると断定せず、連絡するなら何を確認すべきかまで示す。",
    demoFocus: "戻りたい理由、同じ失敗を繰り返す条件、連絡する時の温度",
    keywords: ["復縁", "元彼", "元カノ", "やり直", "戻りたい"]
  },
  {
    key: "relationship_distance",
    label: "相手との距離感",
    promptInstruction:
      "水星、月、金星、火星を中心に、連絡頻度、言葉の選び方、踏み込みすぎる点、待ちすぎる点を読む。今日送るならどんな文量・温度がよいかまで具体化する。",
    demoFocus: "近づくべきか待つべきか、連絡の温度、相手へ確認する一文",
    keywords: ["距離感", "あの人", "連絡", "LINE", "返事", "会う頻度"]
  },
  {
    key: "continue_love",
    label: "この恋を続けるか",
    promptInstruction:
      "金星、火星、土星、冥王星を中心に、続ける価値、消耗している理由、関係を変える条件を読む。続ける/終わるの二択にせず、見極めの基準を3つ提示する。",
    demoFocus: "続けていい恋か、変えないと苦しくなる点、判断基準",
    keywords: ["続けていい", "この恋", "別れる", "終わり", "諦め"]
  },
  {
    key: "marriage",
    label: "結婚・長期相性",
    promptInstruction:
      "月、金星、土星、木星、可能なら7ハウスを中心に、長く続く安心条件、生活リズム、責任の分け方を見る。結婚できる/できないではなく、結婚へ進むなら確認すべき現実条件を示す。",
    demoFocus: "長期的に続く条件、結婚前に確認する価値観、安心できる生活リズム",
    keywords: ["結婚", "相性", "パートナー", "夫婦", "長く続く"]
  },
  {
    key: "career_stay",
    label: "今の仕事を続けるか",
    promptInstruction:
      "太陽、水星、火星、土星、MCを中心に、今の職場で伸びる力、消耗している領域、続けるなら変えるべき条件を読む。辞める/続けるを即断せず、検証する条件を出す。",
    demoFocus: "続ける価値、消耗の原因、職場で交渉・確認すべきこと",
    keywords: ["仕事を続け", "今の仕事", "職場", "辞めるべき", "会社"]
  },
  {
    key: "career_change",
    label: "転職",
    promptInstruction:
      "太陽、水星、火星、木星、土星、MCを中心に、転職で重視すべき条件、動くタイミング、避けるべき逃避を読む。転職先の条件を3つに絞り、近いうちに確認する現実条件を示す。",
    demoFocus: "転職で外せない条件、動く時期、逃げではなく選択にする方法",
    keywords: ["転職", "仕事変え", "キャリア", "求人", "退職"]
  },
  {
    key: "talent_money",
    label: "才能と稼ぎ方",
    promptInstruction:
      "太陽、水星、金星、木星、土星、可能なら2ハウスと10ハウスを中心に、才能、価値提供、収入化の順番を見る。ふわっとした適職ではなく、今月試せる稼ぎ方の仮説を出す。",
    demoFocus: "収入に変えやすい才能、価値提供の形、今月試す小さな実験",
    keywords: ["才能", "稼", "収入", "お金", "副業", "適職"]
  },
  {
    key: "monthly_caution",
    label: "今月気をつけること",
    promptInstruction:
      "現在日付の年月を必ず明記し、太陽、月、土星、木星、目立つトランジットを中心に今月の注意点を読む。恋愛、仕事、体力、判断の4領域に分けて短く具体化する。",
    demoFocus: "今月の注意点、流れが変わりやすい領域、避けるべき判断",
    keywords: ["今月", "注意", "気をつけ", "運勢", "流れ"]
  },
  {
    key: "turning_point",
    label: "人生の転機",
    promptInstruction:
      "土星、木星、天王星、冥王星、現在のトランジットを中心に、転機の兆し、短期・中期・長期で変わる領域、本人が選択で動かせる部分を読む。劇的な断定をしない。",
    demoFocus: "転機の兆し、変わる領域、今から準備すること",
    keywords: ["転機", "人生", "変わる", "成長", "いつ"]
  },
  {
    key: "custom",
    label: "自由相談",
    promptInstruction:
      "質問文の具体語を最優先し、恋愛・仕事・お金・人間関係・人生テーマのどれに近いかを判断して、関係する天体を選ぶ。質問の言葉を言い換えず、本人が聞きたい核心に直接答える。",
    demoFocus: "質問文に含まれる具体的な悩みと、星から見える判断基準",
    keywords: []
  }
];

export const starterQuestions: { intent: QuestionIntentKey; text: string }[] = [
  { intent: "daily_luck", text: "今日の運勢は？" },
  { intent: "general_now", text: "今の私に必要なことは？" },
  { intent: "love_values", text: "恋愛で大切にすべきことは？" },
  { intent: "new_encounter", text: "次の出会いはどんな人？" },
  { intent: "reconciliation", text: "復縁の可能性をどう見ればいい？" },
  { intent: "relationship_distance", text: "あの人との距離感をどう見ればいい？" },
  { intent: "continue_love", text: "この恋を続けていい？" },
  { intent: "marriage", text: "結婚につながる相性？" },
  { intent: "career_stay", text: "仕事を続けるべき？" },
  { intent: "career_change", text: "転職するなら何を重視すべき？" },
  { intent: "talent_money", text: "私の才能と稼ぎ方は？" },
  { intent: "monthly_caution", text: "今月気をつけることは？" },
  { intent: "turning_point", text: "人生の転機は近い？" }
];

export function resolveQuestionIntent(question: string, explicitIntent?: QuestionIntentKey | null) {
  if (explicitIntent) {
    return questionIntents.find((intent) => intent.key === explicitIntent) ?? questionIntents[questionIntents.length - 1];
  }
  const normalized = question.toLowerCase();
  return (
    questionIntents.find((intent) => intent.key !== "custom" && intent.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) ??
    questionIntents[questionIntents.length - 1]
  );
}
