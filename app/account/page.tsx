import { AccountPanel } from "@/components/AccountPanel";
import { GlobalNav } from "@/components/GlobalNav";

export default function AccountPage() {
  return (
    <main className="shell">
      <GlobalNav active="account" mark="✦" />
      <AccountPanel />
    </main>
  );
}
