import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/i18n/locale";

/**
 * 展示级标题的中文子集字体：思源黑体（Noto Sans SC，SIL OFL-1.1），只保留
 * home.hero.title / home.cta.title / home.sections.*.title 里出现的汉字。
 * 这些文案或字体改了就跑一次 `node scripts/generate-display-subset.mjs` 重新生成
 * （缺字会按 --font-display 的字栈回退到系统黑体）。
 */
const DisplayCjk = localFont({
  src: "./fonts/display-cjk.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  variable: "--font-display-cjk",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://knloop.ai";
const SITE_DESCRIPTION = "knloop 官网";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "knloop",
    template: "%s | knloop",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "knloop",
    title: "knloop",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "knloop",
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/knloop-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${GeistSans.variable} ${GeistMono.variable} ${DisplayCjk.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-fg antialiased">
        <ThemeProvider>
          <LocaleProvider>
            <SiteHeader />
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}