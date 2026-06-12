import { AccountPanel } from "@/components/AccountPanel";

export default function EnglishAccountPage() {
  return (
    <main className="shell">
      <section className="panel account-english-note">
        <div className="eyebrow">Account</div>
        <h1>Account, chart, rewards, and reading history</h1>
        <p>The account tools below use the same saved profile and credits as the Japanese version.</p>
      </section>
      <AccountPanel />
    </main>
  );
}
