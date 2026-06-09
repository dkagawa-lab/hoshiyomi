import { BirthChartApp } from "@/components/BirthChartApp";

export default function ConsultationPage() {
  return (
    <main className="shell consultation-page-shell">
      <div className="consultation-page-body">
        <BirthChartApp consultationOnly />
      </div>
    </main>
  );
}
