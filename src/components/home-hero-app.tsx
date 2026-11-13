"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "@/i18n/locale";

/**
 * 首页 Hero 的真实客户端预览（静态图版）。
 *
 * 之前是 iframe 加载 418 KB 的快照 HTML，云端首屏要等 iframe 文档 + 脚本执行，
 * 主图出来得慢。现在改为服务端直出的 <picture>：
 *   · 图片是在真实客户端里渲染、裁好的 WebP（桌面 2304×1296 / 移动 640×1386）；
 *   · 页面 HTML 里直接有 <img>，没有 iframe、没有内联脚本；
 *   · 主题/语言只切换图片 URL，图片本身由 <picture> 按容器宽度选桌面或移动版；
 *   · fetchPriority=high + 固定宽高比，首屏不闪、不抖动，整个页面一次请求即可展示。
 *
 * 图片由 prototype/hero-client 的捕获快照生成，放在 public/hero：
 *   desktop-{zh,en}-{light,dark}.webp / mobile-{zh,en}-{light,dark}.webp
 */
export function HomeHeroApp() {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemDark(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const dark = theme === "dark" || (theme === null && systemDark);
  const lang = locale === "en" ? "en" : "zh";
  const mode = dark ? "dark" : "light";

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      <picture>
        <source media="(max-width: 767px)" srcSet={`/hero/mobile-${lang}-${mode}.webp`} />
        <img
          src={`/hero/desktop-${lang}-${mode}.webp`}
          alt="knloop 客户端界面预览：文档树与欢迎文档"
          width={2304}
          height={1296}
          fetchPriority="high"
          decoding="async"
          draggable={false}
          className="h-full w-full select-none object-cover"
        />
      </picture>
    </div>
  );
}
