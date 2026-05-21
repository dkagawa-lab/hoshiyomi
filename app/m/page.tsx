import Link from "next/link";
import { BirthChartApp } from "@/components/BirthChartApp";

export default function MobileEntryPage() {
  return (
    <main className="shell mobile-entry">
      <nav className="topbar mobile-entry-topbar">
        <Link className="brand" href="/">
          <span className="mark">☉</span>
          <span>HOSHIYOMI</span>
        </Link>
      </nav>
      <section className="mobile-entry-intro">
        <div className="eyebrow">Birth Data</div>
        <h1>あなたの星を読む</h1>
        <p>生年月日と出生地を選ぶだけで、ホロスコープを作成します。出生時刻がわからない場合は空欄で進められます。</p>
      </section>
      <BirthChartApp compact />
    </main>
  );
}
