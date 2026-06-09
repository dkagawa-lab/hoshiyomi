import { addOnPack, AddOnPackKey, isPlanKey, PlanKey } from "@/lib/plans";

export const pendingCheckoutIntentKey = "hoshiyomi:pendingCheckoutIntent";

export type PendingCheckoutIntent =
  | {
      kind: "plan";
      plan: Exclude<PlanKey, "free">;
      createdAt: number;
    }
  | {
      kind: "addOn";
      product: AddOnPackKey;
      createdAt: number;
    };

export type PendingCheckoutInput =
  | {
      kind: "plan";
      plan: Exclude<PlanKey, "free">;
    }
  | {
      kind: "addOn";
      product: AddOnPackKey;
    };

const maxIntentAgeMs = 30 * 60 * 1000;

export function checkoutLoginHref() {
  return "/login?returnTo=/pricing";
}

export function writePendingCheckoutIntent(intent: PendingCheckoutInput) {
  if (typeof window === "undefined") return;
  const value = JSON.stringify({ ...intent, createdAt: Date.now() });
  try {
    window.sessionStorage.setItem(pendingCheckoutIntentKey, value);
    window.localStorage.setItem(pendingCheckoutIntentKey, value);
  } catch {}
}

export function readPendingCheckoutIntent(): PendingCheckoutIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(pendingCheckoutIntentKey) || window.localStorage.getItem(pendingCheckoutIntentKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingCheckoutIntent>;
    if (!parsed.createdAt || Date.now() - parsed.createdAt > maxIntentAgeMs) {
      clearPendingCheckoutIntent();
      return null;
    }
    if (parsed.kind === "plan" && isPlanKey(parsed.plan)) {
      return { kind: "plan", plan: parsed.plan, createdAt: parsed.createdAt };
    }
    if (parsed.kind === "addOn" && parsed.product === addOnPack.key) {
      return { kind: "addOn", product: parsed.product, createdAt: parsed.createdAt };
    }
  } catch {
    clearPendingCheckoutIntent();
  }
  return null;
}

export function clearPendingCheckoutIntent() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(pendingCheckoutIntentKey);
    window.localStorage.removeItem(pendingCheckoutIntentKey);
  } catch {}
}
