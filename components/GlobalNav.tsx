"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

type GlobalNavActive = "chart" | "consultation" | "glossary" | "account" | "support";

type GlobalNavProps = {
  active?: GlobalNavActive;
  brandLabel?: string;
  mark?: string;
};

const navItems = [
  { key: "chart", label: "星の確認", href: "/dashboard" },
  { key: "consultation", label: "相談", href: "/consultation" },
  { key: "glossary", label: "完全ガイド・用語集", href: "/glossary" },
  { key: "account", label: "登録情報", href: "/account" },
  { key: "review", label: "評価特典", href: "/account#review" },
  { key: "referral", label: "紹介コード", href: "/account#referral" },
  { key: "support", label: "問い合わせ", href: "/contact" }
] as const;

export function GlobalNav({ active, brandLabel = "HOSHIYOMI" }: GlobalNavProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const resolvedActive = active ?? resolveActiveNav(pathname);

  useEffect(() => {
    let frame = 0;
    let retryTimer = 0;

    const readScroll = () => {
      frame = 0;
      const pageScroll = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollTargets = Array.from(document.querySelectorAll<HTMLElement>(".consultation-scroll, .cv-thread"));
      const innerScroll = scrollTargets.some((element) => element.scrollTop > 24);
      const hasScrollableContent =
        document.documentElement.scrollHeight > document.documentElement.clientHeight + 24 ||
        scrollTargets.some((element) => element.scrollHeight > element.clientHeight + 24);
      const shouldExposeConsultationMenu =
        Boolean(document.querySelector(".consultation-view.is-reading")) && !hasScrollableContent;
      const shouldExposeStaticMenu = !hasScrollableContent;
      setVisible(pageScroll > 24 || innerScroll || shouldExposeConsultationMenu || shouldExposeStaticMenu);
    };

    const scheduleRead = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(readScroll);
    };

    readScroll();
    retryTimer = window.setTimeout(scheduleRead, 180);
    const observer = new MutationObserver(scheduleRead);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("scroll", scheduleRead, { passive: true });
    document.addEventListener("scroll", scheduleRead, { capture: true, passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (retryTimer) window.clearTimeout(retryTimer);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleRead);
      document.removeEventListener("scroll", scheduleRead, { capture: true });
    };
  }, [pathname]);

  if (pathname?.startsWith("/lp")) return null;

  return (
    <nav className={`topbar global-topbar ${visible ? "is-visible" : "is-hidden"}`}>
      <div className="global-topbar-inner">
        <Link className="brand" href="/">
          <BrandLogo label={brandLabel} />
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
                aria-current={resolvedActive === item.key ? "page" : undefined}
                className={`global-nav-link ${resolvedActive === item.key ? "active" : ""}`}
                href={item.href}
                key={item.key}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </nav>
  );
}

function resolveActiveNav(pathname: string | null): GlobalNavActive | undefined {
  if (!pathname) return undefined;
  if (pathname === "/m" || pathname === "/dashboard" || pathname.startsWith("/reading")) return "chart";
  if (pathname === "/consultation" || pathname.startsWith("/pricing") || pathname.startsWith("/checkout")) return "consultation";
  if (pathname.startsWith("/glossary") || pathname.startsWith("/about")) return "glossary";
  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/registration-complete")
  ) {
    return "account";
  }
  if (pathname.startsWith("/contact") || pathname.startsWith("/legal") || pathname.startsWith("/privacy") || pathname.startsWith("/terms")) return "support";
  return undefined;
}
