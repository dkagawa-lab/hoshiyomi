import Link from "next/link";

export default function EnglishPaymentTermsPage() {
  return (
    <main className="shell detail-shell">
      <section className="detail-hero">
        <div className="eyebrow">Payment</div>
        <h1>Payment and subscription terms</h1>
        <p className="lead">Please confirm these conditions before starting a paid plan or add-on.</p>
      </section>
      <section className="terms-stack">
        <article className="terms-block">
          <h2>Plans</h2>
          <p>Standard Plan starts at ¥480 for the first month and renews at ¥980/month. Private Plan is ¥2,980/month. The 100-question add-on is ¥1,500.</p>
        </article>
        <article className="terms-block">
          <h2>Automatic renewal</h2>
          <p>Monthly plans renew automatically until cancelled. Cancellation can be handled through the billing portal when available.</p>
        </article>
        <article className="terms-block">
          <h2>Refunds</h2>
          <p>As a rule, completed payments are non-refundable unless required by law or separately determined by HOSHIYOMI.</p>
        </article>
        <article className="terms-block">
          <h2>Add-on credits</h2>
          <p>Add-on credits are consumed after plan credits. Remaining add-on credits are shown in the account or plan area.</p>
        </article>
      </section>
      <Link className="button primary" href="/en/pricing">Back to plans</Link>
    </main>
  );
}
