export type Locale = "ja" | "en";

export const localeCookieName = "hoshiyomi_locale";

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "ja";
}

export function isEnglishPath(pathname: string | null | undefined) {
  return Boolean(pathname === "/en" || pathname?.startsWith("/en/"));
}

export function stripLocalePrefix(pathname: string | null | undefined) {
  if (!pathname) return "/";
  if (pathname === "/en") return "/";
  return pathname.replace(/^\/en(?=\/)/, "") || "/";
}

export function localizedPath(pathname: string, locale: Locale) {
  const cleanPath = stripLocalePrefix(pathname);
  if (locale === "en") return cleanPath === "/" ? "/en" : `/en${cleanPath}`;
  return cleanPath;
}

export function shouldPreferEnglish(acceptLanguage: string | null) {
  if (!acceptLanguage) return false;
  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), quality: quality ? Number(quality) : 1 };
    })
    .filter((item) => Number.isFinite(item.quality))
    .sort((a, b) => b.quality - a.quality);
  const firstSupported = candidates.find((item) => item.tag.startsWith("en") || item.tag.startsWith("ja"));
  return firstSupported ? firstSupported.tag.startsWith("en") : false;
}
