import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Tatlı Bi'şey | Günlük taze pasta ve tatlılar",
    template: "%s | Tatlı Bi'şey",
  },
  description:
    "Her gün taze hazırlanan pastalar, kurabiyeler, makaronlar ve şerbetli tatlılar. Kapıda ödeme, havale veya kredi kartı ile güvenli sipariş.",
  keywords: ["pasta", "tatlı", "baklava", "makaron", "cheesecake", "online tatlı siparişi"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
