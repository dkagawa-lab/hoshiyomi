export const metaPixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();
export const lineTagId = (process.env.NEXT_PUBLIC_LINE_TAG_ID || "").trim();

type MetaPixelFn = (...args: unknown[]) => void;
type LineTagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: MetaPixelFn;
    _lt?: LineTagFn;
  }
}

export function isMarketingConfigured() {
  return Boolean(metaPixelId || lineTagId);
}

export function trackPageView() {
  try {
    if (metaPixelId && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
    if (lineTagId && typeof window._lt === "function") {
      window._lt("send", "pv", [lineTagId]);
    }
  } catch {}
}

export function trackMetaEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    if (metaPixelId && typeof window.fbq === "function") {
      if (params) window.fbq("track", eventName, params);
      else window.fbq("track", eventName);
    }
  } catch {}
}

export function trackLineConversion(conversionType = "Conversion") {
  try {
    if (lineTagId && typeof window._lt === "function") {
      window._lt("send", "cv", { type: conversionType }, [lineTagId]);
    }
  } catch {}
}
