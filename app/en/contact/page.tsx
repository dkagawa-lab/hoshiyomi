import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";

export default function EnglishContactPage() {
  return (
    <main className="shell detail-shell">
      <section className="detail-hero contact-hero">
        <div className="eyebrow">Contact</div>
        <h1 className="contact-title">
          <span>Contact</span>
          <span>Requests</span>
        </h1>
        <p className="lead contact-lead">Send feedback, bug reports, requested reading themes, or billing and cancellation questions.</p>
      </section>
      <section className="contact-layout">
        <div className="panel contact-main">
          <div className="contact-heading">
            <div className="eyebrow">Message</div>
            <h2>Send a message</h2>
            <p>If you need a reply, enter an email address you can check.</p>
          </div>
          <ContactForm language="en" />
        </div>
        <aside className="contact-side">
          <article className="terms-block">
            <h2>Replies</h2>
            <p>We review messages and reply when needed. Requests may be reflected in future improvements rather than answered individually.</p>
          </article>
          <article className="terms-block">
            <h2>Billing</h2>
            <p>For billing questions, include the email used at checkout, plan name, and approximate time. Do not enter card numbers.</p>
            <Link className="text-link" href="/en/legal/payment-terms">Payment terms</Link>
          </article>
        </aside>
      </section>
    </main>
  );
}
