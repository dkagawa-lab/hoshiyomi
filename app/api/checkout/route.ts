import { NextResponse } from "next/server";
import { addOnPack, AddOnPackKey, isPlanKey, PlanKey } from "@/lib/plans";
import { getUserByClientUserId, isServerStoreConfigured, normalizeClientUserId } from "@/lib/serverStore";
import { getStripe } from "@/lib/stripe";

type CheckoutRequest = {
  clientUserId?: string;
  plan?: PlanKey;
  product?: AddOnPackKey;
};

export async function POST(req: Request) {
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
  const firstMonthCoupon = !selectedProduct && selectedPlan === "standard" ? process.env.STRIPE_STANDARD_FIRST_MONTH_COUPON_ID : undefined;

  if (!stripe || !price) {
    return NextResponse.json(selectedProduct ? { demo: true, product: selectedProduct, credits: addOnPack.credits } : { demo: true, plan: selectedPlan });
  }

  const existingUser = clientUserId && isServerStoreConfigured() ? await getUserByClientUserId(clientUserId).catch(() => null) : null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const clientMetadata: Record<string, string> = clientUserId ? { client_user_id: clientUserId } : {};
  const metadata: Record<string, string> = selectedProduct
    ? { ...clientMetadata, product: selectedProduct, credits: String(addOnPack.credits) }
    : { ...clientMetadata, plan: selectedPlan, intro_offer: selectedPlan === "standard" ? "first_month_480" : "none" };
  const session = await stripe.checkout.sessions.create({
    mode: selectedProduct ? "payment" : "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: selectedProduct
      ? `${appUrl}/consultation?checkout=success&product=${selectedProduct}`
      : `${appUrl}/consultation?checkout=success&plan=${selectedPlan}`,
    cancel_url: `${appUrl}/consultation?checkout=cancel`,
    metadata,
    ...(existingUser?.stripe_customer_id ? { customer: existingUser.stripe_customer_id } : {}),
    ...(!selectedProduct ? { subscription_data: { metadata } } : {}),
    ...(firstMonthCoupon ? { discounts: [{ coupon: firstMonthCoupon }] } : {})
  });

  return NextResponse.json({ url: session.url });
}
