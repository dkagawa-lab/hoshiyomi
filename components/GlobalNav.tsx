import Link from "next/link";

type GlobalNavProps = {
  active?: "chart" | "consultation" | "glossary" | "account" | "support";
  brandLabel?: string;
  mark?: string;
};

const navItems = [
  { key: "chart", label: "星の確認", href: "/dashboard" },
  { key: "consultation", label: "相談", href: "/consultation" },
  { key: "glossary", label: "完全ガイド・用語集", href: "/glossary" },
  { key: "account", label: "登録情報", href: "/account" },
  { key: "support", label: "問い合わせ", href: "/contact" }
] as const;

export function GlobalNav({ active, brandLabel = "HOSHIYOMI", mark = "☽" }: GlobalNavProps) {
  return (
    <nav className="topbar global-topbar">
      <Link className="brand" href="/">
        <span className="mark">{mark}</span>
        <span>{brandLabel}</span>
      </Link>
      <details className="global-menu">
        <summary className="global-menu-button" aria-label="メニューを開く">
          <span className="hamburger-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Menu</span>
        </summary>
        <div className="global-nav-links" aria-label="主要ナビゲーション">
          {navItems.map((item) => (
            <Link
              aria-current={active === item.key ? "page" : undefined}
              className={`global-nav-link ${active === item.key ? "active" : ""}`}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </details>
    </nav>
  );
}
