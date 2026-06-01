import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { addOnPack, isPlanKey } from "@/lib/plans";
import { addCreditsByClientUserId, deleteStripeEvent, getUserByStripeCustomerId, isServerStoreConfigured, markStripeEventProcessed, normalizeClientUserId, updateUserPlanByClientUserId } from "@/lib/serverStore";
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

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook signature error" }, { status: 400 });
  }

  let eventRecorded = false;
  try {
    if (isServerStoreConfigured()) {
      const shouldProcess = await markStripeEventProcessed({ id: event.id, type: event.type });
      if (!shouldProcess) return NextResponse.json({ duplicate: true, received: true });
      eventRecorded = true;
    }

    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    if (eventRecorded) await deleteStripeEvent(event.id);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing error" }, { status: 500 });
  }
}

async function handleStripeEvent(event: Stripe.Event) {
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
          customerId: stripeCustomerId(session.customer),
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
      const clientUserId = await resolveSubscriptionClientUserId(subscription);
      if (clientUserId) {
        const active = event.type !== "customer.subscription.deleted" && ["active", "trialing"].includes(subscription.status);
        const nextPlan = active && isPlanKey(subscription.metadata?.plan) ? subscription.metadata.plan : "free";
        await updateUserPlanByClientUserId({
          clientUserId,
          customerId: stripeCustomerId(subscription.customer),
          plan: nextPlan,
          subscriptionId: subscription.id
        });
      }
      break;
    }
    default:
      break;
  }
}

async function resolveSubscriptionClientUserId(subscription: Stripe.Subscription) {
  const metadataClientUserId = normalizeClientUserId(subscription.metadata?.client_user_id);
  if (metadataClientUserId) return metadataClientUserId;
  const customerId = stripeCustomerId(subscription.customer);
  if (!customerId) return null;
  const user = await getUserByStripeCustomerId(customerId);
  return user?.client_user_id ? normalizeClientUserId(user.client_user_id) : null;
}

function stripeCustomerId(customer: unknown) {
  if (typeof customer === "string") return customer;
  if (customer && typeof customer === "object" && "id" in customer && typeof customer.id === "string") return customer.id;
  return null;
}
