import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "NTpanel.KZ — Минимализм в интерьере",
  description:
    "Декоративные стеновые панели, луверы, гибкий камень, стеклоблоки и блоки NT-BLOK. Производство в Казахстане.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="antialiased">
      <body
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
        }}
      >
        {children}
        <Script src="/chat-widget.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
