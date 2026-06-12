"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeCookieName, localizedPath } from "@/lib/i18n";

export function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const englishHref = localizedPath(pathname, "en");
  const japaneseHref = localizedPath(pathname, "ja");
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  function remember(locale: "ja" | "en") {
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
    try {
      window.localStorage.setItem(localeCookieName, locale);
    } catch {
      // Locale switching still works through the cookie.
    }
  }

  return (
    <div className="language-switcher" aria-label="Language">
      <Link aria-current={!isEnglish ? "page" : undefined} href={japaneseHref} onClick={() => remember("ja")}>
        JP
      </Link>
      <span aria-hidden="true">/</span>
      <Link aria-current={isEnglish ? "page" : undefined} href={englishHref} onClick={() => remember("en")}>
        EN
      </Link>
    </div>
  );
}
