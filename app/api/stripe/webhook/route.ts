import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { addOnPack, isPlanKey } from "@/lib/plans";
import { addCreditsByClientUserId, isServerStoreConfigured, markStripeEventProcessed, normalizeClientUserId, updateUserPlanByClientUserId } from "@/lib/serverStore";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ received: false, mode: "not-configured" }, { status: process.env.NODE_ENV === "production" ? 500 : 200 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    if (isServerStoreConfigured()) {
      const shouldProcess = await markStripeEventProcessed({ id: event.id, type: event.type });
      if (!shouldProcess) return NextResponse.json({ duplicate: true, received: true });
    }
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientUserId = normalizeClientUserId(session.metadata?.client_user_id);
        if (clientUserId && session.metadata?.product === addOnPack.key) {
          await addCreditsByClientUserId({ clientUserId, credits: addOnPack.credits });
        }
        if (clientUserId && isPlanKey(session.metadata?.plan)) {
          await updateUserPlanByClientUserId({
            clientUserId,
            customerId: typeof session.customer === "string" ? session.customer : null,
            plan: session.metadata.plan,
            subscriptionId: typeof session.subscription === "string" ? session.subscription : null
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clientUserId = normalizeClientUserId(subscription.metadata?.client_user_id);
        if (clientUserId) {
          const active = event.type !== "customer.subscription.deleted" && ["active", "trialing"].includes(subscription.status);
          const nextPlan = active && isPlanKey(subscription.metadata?.plan) ? subscription.metadata.plan : "free";
          await updateUserPlanByClientUserId({
            clientUserId,
            customerId: typeof subscription.customer === "string" ? subscription.customer : null,
            plan: nextPlan,
            subscriptionId: subscription.id
          });
        }
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook error" }, { status: 400 });
  }
}
