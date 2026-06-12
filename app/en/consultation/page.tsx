import { BirthChartApp } from "@/components/BirthChartApp";

export default function EnglishConsultationPage() {
  return (
    <main className="shell consultation-scroll">
      <BirthChartApp consultationOnly language="en" />
    </main>
  );
}
