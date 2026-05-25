import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getUserByClientUserId, isServerStoreConfigured, normalizeClientUserId } from "@/lib/serverStore";

type PortalRequest = {
  clientUserId?: string;
};

export async function POST(req: Request) {
  const stripe = getStripe();
  const clientUserId = normalizeClientUserId(((await req.json()) as PortalRequest).clientUserId);
  if (!stripe || !clientUserId || !isServerStoreConfigured()) {
    return NextResponse.json({ error: "支払い管理画面を開けませんでした。" }, { status: 400 });
  }

  const user = await getUserByClientUserId(clientUserId);
  if (!user?.stripe_customer_id) {
    return NextResponse.json({ error: "まだStripeの支払い情報が見つかりません。プラン画面から購入を開始してください。" }, { status: 404 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${appUrl}/account`
  });

  return NextResponse.json({ url: session.url });
}
