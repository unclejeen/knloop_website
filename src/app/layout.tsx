import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/i18n/locale";

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
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-bg text-fg antialiased">
        <ThemeProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}