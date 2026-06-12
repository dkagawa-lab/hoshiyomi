import Link from "next/link";

export default function EnglishTermsPage() {
  return (
    <main className="shell detail-shell">
      <section className="detail-hero">
        <div className="eyebrow">Terms</div>
        <h1>Terms of use and reading notes</h1>
        <p className="lead">Please read these notes before using HOSHIYOMI.</p>
      </section>
      <section className="terms-stack">
        <article className="terms-block">
          <h2>1. Nature of the service</h2>
          <p>HOSHIYOMI is an astrology reading service for self-understanding and reflection. It does not replace professional advice.</p>
        </article>
        <article className="terms-block">
          <h2>2. Reading results</h2>
          <p>Readings are automatically created by HOSHIYOMI's system based on astrological calculations. Results may contain interpretive variation or inaccurate expressions.</p>
        </article>
        <article className="terms-block">
          <h2>3. Important decisions</h2>
          <p>For medical, legal, investment, gambling, or other specialist decisions, please consult qualified professionals rather than relying only on readings.</p>
        </article>
        <article className="terms-block">
          <h2>4. Accounts and payment</h2>
          <p>Users are responsible for managing login methods and subscription status. Paid plans, cancellation, and refunds are handled according to the payment terms.</p>
        </article>
        <article className="terms-block">
          <h2>5. Prohibited use</h2>
          <p>Do not abuse credits, automate excessive requests, impersonate another user, or use the service in ways that interfere with operation.</p>
        </article>
      </section>
      <div className="actions compact-actions">
        <Link className="button" href="/en/privacy">Privacy policy</Link>
        <Link className="button primary" href="/en/m">Create my chart</Link>
      </div>
    </main>
  );
}
