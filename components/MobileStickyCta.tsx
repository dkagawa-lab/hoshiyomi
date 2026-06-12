"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isEnglishPath, localizedPath, stripLocalePrefix } from "@/lib/i18n";

const birthStorageKey = "hoshiyomi:birth";
const birthUpdatedEvent = "hoshiyomi:birth-updated";

export function MobileStickyCta() {
  const pathname = usePathname();
  const [hasBirth, setHasBirth] = useState(false);

  useEffect(() => {
    const update = () => setHasBirth(hasStoredBirth());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    window.addEventListener(birthUpdatedEvent, update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
      window.removeEventListener(birthUpdatedEvent, update);
    };
  }, [pathname]);

  const cleanPath = stripLocalePrefix(pathname);
  const english = isEnglishPath(pathname);
  if (!pathname || cleanPath === "/consultation" || cleanPath.startsWith("/consultation/") || cleanPath.startsWith("/lp")) return null;

  const href = localizedPath(hasBirth ? "/consultation" : "/m", english ? "en" : "ja");
  const label = english ? (hasBirth ? "Ask the stars" : "Read my chart") : hasBirth ? "相談する" : "星を読む";
  const subLabel = english ? (hasBirth ? "Continue with your saved chart" : "Create your birth chart first") : hasBirth ? "保存した星の文脈で続ける" : "まず出生図を作成する";

  return (
    <div className="mobile-sticky-cta" aria-label={english ? "Next action" : "次の行動"}>
      <Link className="mobile-sticky-cta-button" href={href}>
        <span className="mobile-sticky-cta-copy">
          <strong>{label}</strong>
          <em>{subLabel}</em>
        </span>
        <span className="mobile-sticky-cta-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  );
}

function hasStoredBirth() {
  try {
    const raw = window.localStorage.getItem(birthStorageKey) ?? window.sessionStorage.getItem(birthStorageKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { date?: unknown; city?: unknown; latitude?: unknown; longitude?: unknown };
    return Boolean(parsed.date && parsed.city && Number.isFinite(Number(parsed.latitude)) && Number.isFinite(Number(parsed.longitude)));
  } catch {
    return false;
  }
}

export function notifyBirthUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(birthUpdatedEvent));
}
