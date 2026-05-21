export type GenderKey = "unspecified" | "male" | "female" | "no_answer";

export type RomanticInterestKey = "unspecified" | "men" | "women" | "both" | "target_unknown" | "none" | "not_sure" | "no_answer";

export const genderOptions: { key: GenderKey; label: string }[] = [
  { key: "unspecified", label: "未選択" },
  { key: "male", label: "男性" },
  { key: "female", label: "女性" },
  { key: "no_answer", label: "回答しない" }
];

export const romanticInterestOptions: { description: string; key: RomanticInterestKey; label: string }[] = [
  { key: "unspecified", label: "未選択", description: "恋愛相談の前に確認します" },
  { key: "men", label: "男性", description: "男性を好きになることが多い" },
  { key: "women", label: "女性", description: "女性を好きになることが多い" },
  { key: "both", label: "男女どちらも", description: "男女どちらも恋愛対象になる" },
  { key: "target_unknown", label: "対象が男か女かわからない", description: "相手や気になる人の性別をまだ決めつけずに読みたい" },
  { key: "none", label: "どちらもない", description: "恋愛対象はない、または今は恋愛を前提にしない" },
  { key: "not_sure", label: "迷っている", description: "自分の気持ちや恋愛対象がまだ揺れている" },
  { key: "no_answer", label: "回答しない", description: "相手の性別を決めつけずに読む" }
];

export function isGenderKey(value: unknown): value is GenderKey {
  return typeof value === "string" && genderOptions.some((option) => option.key === value);
}

export function isRomanticInterestKey(value: unknown): value is RomanticInterestKey {
  return typeof value === "string" && romanticInterestOptions.some((option) => option.key === value);
}

export function genderLabel(value?: GenderKey | null) {
  return genderOptions.find((option) => option.key === value)?.label ?? "未選択";
}

export function romanticInterestLabel(value?: RomanticInterestKey | null) {
  return romanticInterestOptions.find((option) => option.key === value)?.label ?? "未選択";
}

export function hasRomanticInterest(value?: RomanticInterestKey | null) {
  return Boolean(value && value !== "unspecified");
}
