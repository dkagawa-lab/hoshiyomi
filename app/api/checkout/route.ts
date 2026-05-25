import { NextResponse } from "next/server";
import { addOnPack, AddOnPackKey, isPlanKey, PlanKey } from "@/lib/plans";
import { getUserByClientUserId, isServerStoreConfigured, normalizeClientUserId } from "@/lib/serverStore";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

type CheckoutRequest = {
  clientUserId?: string;
  plan?: PlanKey;
  product?: AddOnPackKey;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutRequest;
    const clientUserId = normalizeClientUserId(body.clientUserId);
    const selectedProduct = body.product === addOnPack.key ? addOnPack.key : null;
    const selectedPlan = isPlanKey(body.plan) && body.plan !== "free" ? body.plan : "standard";
    const stripe = getStripe();
    const price = selectedProduct
      ? process.env.STRIPE_ADDON_100_PRICE_ID
      : selectedPlan === "luxury"
        ? process.env.STRIPE_LUXURY_PRICE_ID
        : process.env.STRIPE_STANDARD_PRICE_ID;
    if (!stripe || !price) {
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(selectedProduct ? { demo: true, product: selectedProduct, credits: addOnPack.credits } : { demo: true, plan: selectedPlan });
      }
      return NextResponse.json(
        {
          error: selectedProduct
            ? "追加相談枠の決済設定がまだ完了していません。STRIPE_ADDON_100_PRICE_IDを確認してください。"
            : "プランの決済設定がまだ完了していません。StripeのPrice IDとSecret keyを確認してください。"
        },
        { status: 500 }
      );
    }

    const firstMonthDiscount = !selectedProduct && selectedPlan === "standard" ? await resolveStripeDiscount(stripe, process.env.STRIPE_STANDARD_FIRST_MONTH_COUPON_ID) : null;
    if (!selectedProduct && selectedPlan === "standard" && !firstMonthDiscount && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "通常プラン初回480円用のクーポン設定が未設定です。STRIPE_STANDARD_FIRST_MONTH_COUPON_ID に coupon_... または promo_... を設定してください。" },
        { status: 500 }
      );
    }

    const existingUser = clientUserId && isServerStoreConfigured() ? await withTimeout(getUserByClientUserId(clientUserId).catch(() => null), 1200, null) : null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const clientMetadata: Record<string, string> = clientUserId ? { client_user_id: clientUserId } : {};
    const metadata: Record<string, string> = selectedProduct
      ? { ...clientMetadata, product: selectedProduct, credits: String(addOnPack.credits) }
      : { ...clientMetadata, plan: selectedPlan, intro_offer: selectedPlan === "standard" ? "first_month_480" : "none" };
    const session = await stripe.checkout.sessions.create(
      {
        mode: selectedProduct ? "payment" : "subscription",
        line_items: [{ price, quantity: 1 }],
        success_url: selectedProduct
          ? `${appUrl}/consultation?checkout=success&product=${selectedProduct}`
          : `${appUrl}/consultation?checkout=success&plan=${selectedPlan}`,
        cancel_url: `${appUrl}/consultation?checkout=cancel`,
        metadata,
        ...(existingUser?.stripe_customer_id ? { customer: existingUser.stripe_customer_id } : {}),
        ...(!selectedProduct ? { subscription_data: { metadata } } : {}),
        ...(firstMonthDiscount ? { discounts: [firstMonthDiscount] } : {})
      },
      { timeout: 10000 }
    );

    if (!session.url) {
      return NextResponse.json({ error: "Stripe CheckoutのURLを取得できませんでした。" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.warn("Stripe checkout session failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: buildCheckoutErrorMessage(error) }, { status: 502 });
  }
}

async function resolveStripeDiscount(stripe: Stripe, value: string | undefined): Promise<Stripe.Checkout.SessionCreateParams.Discount | null> {
  const id = value?.trim();
  if (!id) return null;
  if (id.startsWith("promo_")) return { promotion_code: id };
  if (!id.startsWith("coupon_")) {
    const promotionCodes = await stripe.promotionCodes.list({ active: true, code: id, limit: 1 });
    const promotionCodeId = promotionCodes.data[0]?.id;
    if (promotionCodeId) return { promotion_code: promotionCodeId };
  }
  return { coupon: id };
}

function buildCheckoutErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("No such coupon") || message.includes("No such promotion_code") || message.includes("No such promotion code")) {
    return "通常プラン初回480円用のクーポンIDがStripeで見つかりません。テスト/本番のモード違い、または coupon_... / promo_... の貼り間違いを確認してください。";
  }
  if (message.includes("No such price")) {
    return "StripeのPrice IDが見つかりません。Vercelに入れた price_... が本番モードの価格IDか確認してください。";
  }
  if (message.includes("Invalid API Key") || message.includes("api_key")) {
    return "Stripe Secret keyが正しくありません。VercelのSTRIPE_SECRET_KEYが本番モードの sk_live_... になっているか確認してください。";
  }
  return "Stripeの決済画面を開けませんでした。Price ID、クーポンID、Secret keyの組み合わせを確認してください。";
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T) {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}
