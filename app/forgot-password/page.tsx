import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="shell">
      <section className="panel form-panel forgot-password-page">
        <div className="eyebrow">Password Reset</div>
        <h1>パスワードを再設定する</h1>
        <p>登録したメールアドレスに再設定用のリンクを送ります。リンクを開くと、新しいパスワードを設定できます。</p>
        <ForgotPasswordForm />
        <Link className="text-link" href="/register">
          登録・ログイン画面へ戻る
        </Link>
      </section>
    </main>
  );
}
