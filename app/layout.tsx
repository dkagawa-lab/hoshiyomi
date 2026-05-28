import type { Metadata } from "next";
import type { Viewport } from "next";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOSHIYOMI",
  description: "出生図から読む、パーソナル星読み",
  icons: {
    icon: [{ url: "/brand/hoshiyomi-mark.svg", type: "image/svg+xml" }],
    shortcut: "/brand/hoshiyomi-mark.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        {children}
        <MobileStickyCta />
      </body>
    </html>
  );
}
