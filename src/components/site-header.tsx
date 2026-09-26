"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand-lockup";
import { Search } from "@/components/search";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/i18n/locale";
import { cn } from "@/lib/utils";

/**
 * 站点头部。
 *
 * 首页顶部不显示头部：文案区里的品牌组合（带 data-header-sentinel）代替它。
 * 那个组合滚出视口后，头部从上方滑下来；回到顶部再滑回去。
 * 其它页面没有观察点，头部常驻。
 *
 * 初始状态按路由给（服务端渲染时就知道），避免首屏闪一下头部；
 * 观察用 IntersectionObserver，首帧会补一次当前相交状态。
 */
const ROUTES_WITH_SENTINEL = ["/"];

export function SiteHeader() {
  const { t } = useLocale();
  const pathname = usePathname();
  const [visible, setVisible] = useState(() => !ROUTES_WITH_SENTINEL.includes(pathname));

  useEffect(() => {
    const sentinel = document.querySelector("[data-header-sentinel]");
    if (!sentinel) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <header
      inert={!visible}
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-bg/90 backdrop-blur-sm",
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="flex h-14 items-center justify-between gap-4 px-3 sm:gap-6 sm:px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <BrandLockup />
          </Link>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/install"
            className="text-sm text-muted transition-colors hover:text-fg"
          >
            {t("nav.docs")}
          </Link>
          <Search />
          <a
            href={"https://github.com/" + (process.env.NEXT_PUBLIC_GITHUB_REPO || "unclejeen/knloop_website")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg sm:flex"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
