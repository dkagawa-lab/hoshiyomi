import Link from "next/link";
import { PricingPanel } from "@/components/PricingPanel";

export default function EnglishPricingPage() {
  return (
    <main className="shell pricing-page">
      <section className="panel pricing-hero">
        <div className="eyebrow">Plans</div>
        <h1>The more you consult, the more the reading can follow your path</h1>
        <p>Choose the number of questions, reading depth, and reader styles that fit the way you want to keep asking.</p>
        <div className="actions compact-actions">
          <Link className="button primary" href="/en/consultation">
            Go to consultation
          </Link>
        </div>
      </section>
      <PricingPanel language="en" />
      <section className="pricing-legal-links" aria-label="Information before payment">
        <Link className="text-link" href="/en/legal/payment-terms">Payment and subscription terms</Link>
        <Link className="text-link" href="/en/legal/commercial-disclosure">Legal disclosure</Link>
        <Link className="text-link" href="/en/contact">Contact about payment</Link>
      </section>
    </main>
  );
}
