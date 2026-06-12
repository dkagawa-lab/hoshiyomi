import Link from "next/link";
import { BirthChartApp } from "@/components/BirthChartApp";
import { BrandLogo } from "@/components/BrandLogo";

export default function EnglishMobileEntryPage() {
  return (
    <main className="shell mobile-entry">
      <nav className="topbar mobile-entry-topbar">
        <Link className="brand" href="/en">
          <BrandLogo />
        </Link>
      </nav>
      <section className="mobile-entry-intro">
        <div className="eyebrow">Birth Data</div>
        <h1>Read your stars</h1>
        <p>Create your horoscope from your birth date and birthplace. If you do not know your birth time, you can leave it blank.</p>
      </section>
      <BirthChartApp compact language="en" />
    </main>
  );
}
