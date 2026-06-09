import { BirthChartApp } from "@/components/BirthChartApp";

export default function DashboardPage() {
  return (
    <main className="shell">
      <BirthChartApp hideConsultation />
    </main>
  );
}
