import Link from "next/link";

export default function EnglishCommercialDisclosurePage() {
  return (
    <main className="shell detail-shell">
      <section className="detail-hero">
        <div className="eyebrow">Legal Disclosure</div>
        <h1>Specified Commercial Transactions Act disclosure</h1>
        <p className="lead">This page summarizes seller and payment information for users in Japan.</p>
      </section>
      <section className="terms-stack">
        <article className="terms-block">
          <h2>Seller information</h2>
          <p>Please refer to the Japanese legal disclosure page for the official seller name, address, responsible person, and contact information.</p>
        </article>
        <article className="terms-block">
          <h2>Price and fees</h2>
          <p>Prices are shown on the plan page. Internet connection fees and communication charges are borne by the user.</p>
        </article>
        <article className="terms-block">
          <h2>Delivery timing</h2>
          <p>Paid features and credits are reflected after payment confirmation. Reflection may take a short time depending on payment processing.</p>
        </article>
      </section>
      <div className="actions compact-actions">
        <Link className="button" href="/legal/commercial-disclosure">Official Japanese disclosure</Link>
        <Link className="button primary" href="/en/pricing">Back to plans</Link>
      </div>
    </main>
  );
}
