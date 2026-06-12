import Link from "next/link";
import { RegisterActions } from "@/components/RegisterActions";

export default function EnglishLoginPage() {
  return (
    <main className="shell">
      <section className="panel form-panel auth-entry-page">
        <div className="eyebrow">Login</div>
        <h1>Log in</h1>
        <p className="auth-lead">
          <span>Log in with your registered email address, Google, or LINE.</span>
          <span>After login, you can check your saved chart and reading history from Account.</span>
        </p>
        <RegisterActions mode="login" />
        <div className="register-sub-actions">
          <Link className="text-link" href="/en/register">New here? Create account</Link>
          <Link className="text-link" href="/en/account">Back to account</Link>
        </div>
      </section>
    </main>
  );
}
