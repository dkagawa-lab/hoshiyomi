export function normalizeAnswerText(value: unknown) {
  return replaceMechanicalTimeBoxes(coerceAnswerText(value))
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

export function coerceAnswerText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(coerceAnswerText).filter(Boolean).join("\n");
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["text", "content", "answer", "message"]) {
      const text = coerceAnswerText(record[key]);
      if (text) return text;
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  }
  return String(value);
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
