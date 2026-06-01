import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/serverAuth";
import { getStripe } from "@/lib/stripe";
import { getUserByClientUserId, getUserByLineUserId, isServerStoreConfigured } from "@/lib/serverStore";

export async function POST(req: Request) {
  const authUser = await getAuthenticatedRequestUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "支払い管理画面を開くにはログインが必要です。" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe || !isServerStoreConfigured()) {
    return NextResponse.json({ error: "支払い管理画面を開けませんでした。" }, { status: 400 });
  }

  const user =
    authUser.provider === "line" && authUser.lineUserId
      ? await getUserByLineUserId(authUser.lineUserId)
      : await getUserByClientUserId(authUser.clientUserId);
  if (!user?.stripe_customer_id) {
    return NextResponse.json({ error: "まだStripeの支払い情報が見つかりません。プラン画面から購入を開始してください。" }, { status: 404 });
  }

  const appUrl = resolveAppUrl(req);
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${appUrl}/account`
  });

  return NextResponse.json({ url: session.url });
}

function resolveAppUrl(req: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const fallback = new URL(req.url).origin;
  const shouldUseFallback = process.env.NODE_ENV === "production" && configured && /localhost|127\.0\.0\.1/.test(configured);
  return (shouldUseFallback ? fallback : configured || fallback).replace(/\/$/, "");
}
