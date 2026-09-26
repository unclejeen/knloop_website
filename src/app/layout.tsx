import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
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

/**
 * Geist Mono：不在首屏的关键路径上，所以不预载。
 *
 * geist 包给的 GeistMono 是 preload: true，会和 Geist Sans、中文子集一起
 * 在 HTML 解析前就抢带宽；它 71 KB，而首页真正先用到它的是滚动到下面才出现的
 * 窗口标题栏（文档页是代码块）。preload: false 之后浏览器按 @font-face
 * 用到才取，display: swap 期间先用回退字体，不挡渲染。
 *
 * 字形文件是从 geist@1.7.2 的 node_modules 里拷出来的（版本记在
 * src/app/fonts/README.md），fallback / adjustFontFallback 和 geist
 * 自己那份定义逐字保持一致，所以回退渲染和以前一样。
 */
const GeistMono = localFont({
  src: "./fonts/geist-mono-variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
  preload: false,
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