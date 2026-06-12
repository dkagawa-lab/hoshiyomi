import Link from "next/link";
import { RegisterActions } from "@/components/RegisterActions";

export default function EnglishRegisterPage() {
  return (
    <main className="shell">
      <section className="panel form-panel auth-entry-page">
        <div className="eyebrow">Membership</div>
        <h1>Create account</h1>
        <p className="auth-lead">
          <span>Register with email, Google, or LINE to save your birth chart and reading history.</span>
          <span>After registration, your first 10 consultations are available as a starting bonus.</span>
        </p>
        <div className="notice-box">
          <h2>Before registering</h2>
          <p className="notice-copy">
            <span>HOSHIYOMI is a reading service for self-understanding through astrology.</span>
            <span>For medical, legal, or investment decisions, please consult a qualified professional.</span>
          </p>
          <Link className="text-link" href="/en/terms">Read terms</Link>
        </div>
        <RegisterActions mode="register" />
        <div className="register-sub-actions">
          <Link className="text-link" href="/en/login">Already registered? Log in</Link>
          <Link className="text-link" href="/en/account">Account and history</Link>
          <Link className="text-link" href="/en/m">Back to chart</Link>
        </div>
      </section>
    </main>
  );
}
