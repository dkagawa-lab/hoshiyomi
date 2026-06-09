"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

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
  { key: "review", label: "評価特典", href: "/account#review" },
  { key: "referral", label: "紹介コード", href: "/account#referral" },
  { key: "support", label: "問い合わせ", href: "/contact" }
] as const;

export function GlobalNav({ active, brandLabel = "HOSHIYOMI" }: GlobalNavProps) {
  const [visible, setVisible] = useState(false);

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
      setVisible(pageScroll > 24 || innerScroll || shouldExposeConsultationMenu);
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
  }, []);

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
      </div>
    </nav>
  );
}
