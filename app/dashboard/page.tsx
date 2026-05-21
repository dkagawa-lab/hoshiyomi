import { BirthChartApp } from "@/components/BirthChartApp";
import { GlobalNav } from "@/components/GlobalNav";

export default function DashboardPage() {
  return (
    <main className="shell">
      <GlobalNav active="chart" />
      <BirthChartApp hideConsultation />
    </main>
  );
}
