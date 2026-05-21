import { BirthChartApp } from "@/components/BirthChartApp";
import { GlobalNav } from "@/components/GlobalNav";

export default function ConsultationPage() {
  return (
    <main className="shell">
      <GlobalNav active="consultation" />
      <BirthChartApp consultationOnly />
    </main>
  );
}
