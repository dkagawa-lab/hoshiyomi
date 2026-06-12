import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HOSHIYOMI | Personal horoscope readings from your birth chart",
  description: "A personal astrology reading service based on your birth chart and the current sky.",
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      ja: "/"
    }
  }
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
