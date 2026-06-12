import Link from "next/link";

export default function EnglishPrivacyPage() {
  return (
    <main className="shell detail-shell">
      <section className="detail-hero">
        <div className="eyebrow">Privacy</div>
        <h1>Privacy policy</h1>
        <p className="lead">This page explains how HOSHIYOMI handles information used for readings, accounts, payment, and support.</p>
      </section>
      <section className="terms-stack">
        <article className="terms-block">
          <h2>1. Information collected</h2>
          <p>We may collect birth date, birth time, birthplace, name, gender, romantic-interest settings, consultation text, account identifiers, payment status, referral information, reviews, and inquiry details.</p>
        </article>
        <article className="terms-block">
          <h2>2. Purpose of use</h2>
          <p>Information is used to create readings, save profiles and history, manage credits and payment status, prevent abuse, respond to inquiries, and improve the service.</p>
        </article>
        <article className="terms-block">
          <h2>3. External services</h2>
          <p>HOSHIYOMI uses external services for reading creation, payment processing, data storage, account login, and access analysis. A portion of entered information may be sent to external providers located in the United States for reading creation and processing.</p>
        </article>
        <article className="terms-block">
          <h2>4. Transfer to foreign third parties</h2>
          <p>For reading creation, a portion of entered information is sent to external providers located in the United States. Information about the personal information protection systems of the destination country and the safety measures taken by the provider can be requested from the contact page.</p>
        </article>
        <article className="terms-block">
          <h2>5. Third-party provision</h2>
          <p>We do not provide personal information to third parties except where necessary for service operation, required by law, or with user consent.</p>
        </article>
        <article className="terms-block">
          <h2>6. Storage and deletion</h2>
          <p>Users may request disclosure, correction, deletion, or suspension of use through the contact page, subject to identity confirmation and operational/legal requirements.</p>
        </article>
        <article className="terms-block">
          <h2>7. Cookies and local storage</h2>
          <p>The service may use cookies, local storage, and similar identifiers to maintain sessions, preserve chart data, measure usage, and prevent abuse.</p>
        </article>
      </section>
      <div className="actions compact-actions">
        <Link className="button" href="/en/contact">Contact</Link>
        <Link className="button primary" href="/en/register">Create account</Link>
      </div>
    </main>
  );
}
