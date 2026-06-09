export type NonBillableQuestionKind = "account" | "legal" | "line" | "menu_consult" | "menu_love" | "menu_work" | "off_topic" | "pricing" | "reader" | "small_talk" | "support" | "usage";

export type QuestionBilling = {
  countable: boolean;
  kind: NonBillableQuestionKind | "astrology";
  label: string;
};

const readerPrefixPattern = /^(通常|標準|マイルド|やさしく|優しく|寄り添い|共感|厳しめ|はっきり|辛辣|容赦なく)[：:\s]+/;
const loveLineContextPattern = /(彼|彼女|好き|恋|復縁|あの人|相手|既読|未読|返事|返信|連絡|距離|デート)/;
const readerStyleWordPattern = /(通常鑑定|標準鑑定|マイルド|辛辣|寄り添い|共感|はっきり|厳しめ|やさしく|優しく|容赦なく)/;
const readerSettingPattern = /(占い師|鑑定士|鑑定師|タイプ|口調|話し方|選べ|選択|変更|切り替|使える|使えます|プロフィール|プラン)/;
const appUiPattern = /(ページ|画面|ボタン|リンク|url|URL|フォーム|入力欄|選択肢|プルダウン|表示|反映|保存|履歴|登録画面|ログイン画面|決済画面|相談画面|アカウント画面)/;
const appIssuePattern = /(押せ|開け|動かない|できない|できません|壊れ|おかしい|エラー|バグ|不具合|反映されない|表示されない|保存されない|戻れない|飛ばない|遷移しない)/;

export function classifyQuestionBilling(question: string): QuestionBilling {
  const text = normalizeQuestionForBilling(question);
  const lower = text.toLowerCase();
  if (!text) return billable("astrology", "占い相談");

  const richMenuStarter = richMenuStarterKind(text);
  if (richMenuStarter === "daily") {
    return billable("astrology", "今日の運勢");
  }
  if (richMenuStarter) {
    return nonBillable(richMenuStarter, "リッチメニューの入口");
  }

  if (/^(ありがとう|ありがと|助かった|ok|ｏｋ|了解|わかった|分かった|こんにちは|こんばんは|おはよう|テスト|test)$/i.test(text)) {
    return nonBillable("small_talk", "挨拶・短い返答");
  }

  if (/(残り|残数|あと何回|あと何問|あと何件|何回使|何回.*(聞|相談|質問|占|使|残|でき|出来)|何問.*(聞|相談|質問|占|使|残|でき|出来)|回数|利用回数|相談回数|質問枠|相談枠|鑑定枠|無料枠|利用状況|上限|トークン|クレジット)/.test(text)) {
    return nonBillable("usage", "利用状況の確認");
  }

  if (/(料金|価格|値段|課金|決済|支払い|支払|プラン|通常プラン|無料プラン|プライベートプラン|有料|解約|返金|領収書|クーポン|追加.*100|stripe)/i.test(text)) {
    return nonBillable("pricing", "料金・プランの確認");
  }

  if (
    (readerStyleWordPattern.test(text) && readerSettingPattern.test(text)) ||
    /(占い師|鑑定士|鑑定師).*(選|変更|切り替|使|プロフィール|プラン|誰)/.test(text)
  ) {
    return nonBillable("reader", "占い師タイプの確認");
  }

  if (/(line|ライン)/i.test(text) && !loveLineContextPattern.test(text)) {
    return nonBillable("line", "LINE連携の確認");
  }

  if (/(登録|ログイン|ログアウト|メール|google|gmail|アカウント|会員|プロフィール|パスワード|認証|出生情報.*(変更|修正|保存)|紹介コード)/i.test(text)) {
    return nonBillable("account", "登録・アカウントの確認");
  }

  if (/(使い方|操作|問い合わせ|サポート|ヘルプ)/.test(text) || appUiPattern.test(text) || appIssuePattern.test(text) && /(アプリ|サイト|HOSHIYOMI|ほしよみ|登録|ログイン|LINE|ライン|メール|Google|決済|課金|プラン|回数|相談枠|鑑定文|回答|履歴)/i.test(text)) {
    return nonBillable("support", "操作・不具合の確認");
  }

  if (/(利用規約|プライバシー|個人情報|特商法|特定商取引|規約|ポリシー)/.test(text)) {
    return nonBillable("legal", "規約・ポリシーの確認");
  }

  if (/(病気|治る|治療|薬|診断|手術|妊娠|法律|訴訟|裁判|税金|投資|株価|仮想通貨|暗号資産|保険|契約書)/.test(text) && !/(金運|稼|収入|お金との付き合い)/.test(text)) {
    return nonBillable("off_topic", "専門判断が必要な相談");
  }

  if (isClearlyOffTopic(text, lower)) {
    return nonBillable("off_topic", "占い以外の質問");
  }

  return billable("astrology", "占い相談");
}

export function normalizeQuestionForBilling(question: string) {
  return String(question || "").trim().replace(readerPrefixPattern, "").trim();
}

export function richMenuStarterKind(text: string): "daily" | "menu_consult" | "menu_love" | "menu_work" | null {
  const normalized = String(text || "").trim().replace(/[。.!！?？\s]+$/g, "");
  if (normalized === "今日の運勢を占って") return "daily";
  if (normalized === "相談したいです") return "menu_consult";
  if (normalized === "恋愛について占って") return "menu_love";
  if (normalized === "仕事や人生の流れを占って") return "menu_work";
  return null;
}

function isClearlyOffTopic(text: string, lower: string) {
  if (/^\d+\s*[+\-*/÷×]\s*\d+/.test(text)) return true;
  if (/(天気|ニュース|レシピ|料理方法|プログラミング|コード|エクセル|excel|翻訳|英訳|和訳|要約|論文|宿題|歴史|地理|数学|計算して|店を探|ホテル|航空券|今何時|時刻)/i.test(text)) {
    return !/(運勢|運命|星|占|ホロスコープ|出生図|トランジット|相性|恋愛運|仕事運|金運|ラッキー|転機|今日の運勢|今月のテーマ|今月の運勢)/.test(text);
  }
  if (lower.includes("chatgpt") || lower.includes("claude") || lower.includes("anthropic")) return true;
  return false;
}

function nonBillable(kind: NonBillableQuestionKind, label: string): QuestionBilling {
  return { countable: false, kind, label };
}

function billable(kind: "astrology", label: string): QuestionBilling {
  return { countable: true, kind, label };
}
