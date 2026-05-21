export function normalizeAnswerText(value: string) {
  return replaceMechanicalTimeBoxes(value)
    .replace(/\r\n/g, "\n")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/^\s{0,3}[-*_]{3,}\s*$/gm, "")
    .replace(/^\s*[-*]\s+/gm, "・")
    .replace(/^\s*(\d+)\.\s+/gm, "$1. ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function replaceMechanicalTimeBoxes(value: string) {
  return value
    .replace(/24\s*時間以内(にできること|でできること|にやること|の行動|のアクション)?/g, "次に気持ちが動いた時に見ること")
    .replace(/二十四時間以内(にできること|でできること|にやること|の行動|のアクション)?/g, "次に気持ちが動いた時に見ること")
    .replace(/[7７]\s*日以内(にできること|でできること|にやること|の行動|のアクション)?/g, "しばらく意識する判断基準")
    .replace(/七日以内(にできること|でできること|にやること|の行動|のアクション)?/g, "しばらく意識する判断基準")
    .replace(/[1１]\s*週間以内(にできること|でできること|にやること|の行動|のアクション)?/g, "しばらく意識する判断基準")
    .replace(/一週間以内(にできること|でできること|にやること|の行動|のアクション)?/g, "しばらく意識する判断基準");
}
