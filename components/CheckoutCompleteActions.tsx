"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { addOnPack, isPlanKey, resolvePlan } from "@/lib/plans";

export function CheckoutCompleteActions() {
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan");
  const productKey = searchParams.get("product");
  const isAddOn = productKey === addOnPack.key;
  const plan = isPlanKey(planKey) && planKey !== "free" ? resolvePlan(planKey) : null;
  const title = isAddOn ? "追加相談枠が付与されました" : plan ? `${plan.label}になりました` : "決済が完了しました";
  const detail = isAddOn
    ? `${addOnPack.credits}回分のクレジットが付与されました。必要な時に、そのまま続けて星読みを相談できます。`
    : plan
      ? `あなたは${plan.label}になりました。相談回数、回答の深さ、選べる占い師タイプがこのプランの内容に切り替わります。`
      : "お支払い内容を確認しました。相談画面から、そのまま星読みを続けられます。";

  return (
    <div className="registration-complete-card checkout-complete-card">
      <div className="completion-mark" aria-hidden="true">
        ✓
      </div>
      <div className="eyebrow">お支払い完了</div>
      <h1>お支払いありがとうございました。</h1>
      <div className="completion-summary">
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
      <p className="completion-note">
        反映には数十秒ほどかかる場合があります。相談画面へ進むと、現在のプランと残り回数を確認できます。
      </p>
      <div className="completion-actions">
        <Link className="button primary" href="/consultation">
          今すぐ占う
        </Link>
        <Link className="button" href="/account">
          登録情報を見る
        </Link>
        <Link className="text-link" href="/pricing">
          料金プランへ戻る
        </Link>
      </div>
    </div>
  );
}
