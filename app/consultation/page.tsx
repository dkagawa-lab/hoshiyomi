import { BirthChartApp } from "@/components/BirthChartApp";
import { GlobalNav } from "@/components/GlobalNav";

export default function ConsultationPage() {
  return (
    <main className="shell consultation-page-shell">
      <GlobalNav active="consultation" />
      <div className="consultation-page-body">
        <BirthChartApp consultationOnly />
      </div>
    </main>
  );
}
