import Link from "next/link";
import { RegisterActions } from "@/components/RegisterActions";

export default function LoginPage() {
  return (
    <main className="shell">
      <section className="panel form-panel auth-entry-page">
        <div className="eyebrow">Login</div>
        <h1>ログイン</h1>
        <p className="auth-lead">
          <span>登録済みのメールアドレス、</span>
          <span>Google、LINEでログインできます。</span>
          <span>保存した星の情報や鑑定履歴は、</span>
          <span>ログイン後に登録情報ページから確認できます。</span>
        </p>
        <RegisterActions mode="login" />
        <div className="register-sub-actions">
          <Link className="text-link" href="/register">
            初めての方は新規登録へ
          </Link>
          <Link className="text-link" href="/account">
            登録情報へ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
