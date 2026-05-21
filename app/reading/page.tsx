import { GlobalNav } from "@/components/GlobalNav";
import { ReadingFlow } from "@/components/ReadingFlow";

export default function ReadingPage() {
  return (
    <main className="shell">
      <GlobalNav active="chart" mark="☉" />
      <ReadingFlow />
    </main>
  );
}
