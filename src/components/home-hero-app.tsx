"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "@/i18n/locale";

/**
 * 首页 Hero 的真实客户端预览。
 *
 * 不是截图、也不是项目内仿写的组件：iframe 直接加载 public/hero 下由
 * prototype/hero-client 捕获的真实客户端快照（desktop/mobile × zh/en）。
 *
 * 尺寸策略（和 prototype/hero-client 的评审版本一致）：
 *   · 桌面：外框 16:9，iframe 宽度 = 外框宽、高度固定 810（客户端原生布局高度），
 *     往文档里注入 html { zoom: 外框宽 / 1440 }。客户端仍按 1440×810 排版
 *     （正文栏 720px），Chrome 按目标尺寸原生栅格化，文字清晰；没有 transform 缩放。
 *   · 移动（<768px）：真实 390×844 移动布局，1:1 显示（zoom: 1）。
 *
 * 主题/语言跟随站点：LocaleProvider 切语言时换 iframe src，next-themes 切主题时
 * 给快照的 <html> 加/去 .dark。站点的滚轮在 Hero 上时：文档区自己滚，其它区域
 * 转发给页面，文档滚到顶/底后也把滚动交还页面（和原型一致）。
 *
 * 快照由 scripts/sync-hero-snapshots.mjs 同步到 public/hero：
 *   desktop-zh.html / desktop-en.html / mobile-zh.html / mobile-en.html
 */

const DESKTOP_LAYOUT_WIDTH = 1440;
const MOBILE_QUERY = "(max-width: 767px)";
const ZOOM_STYLE_ID = "hero-zoom-style";

type HeroDoc = Document;

function getDoc(iframe: HTMLIFrameElement | null): HeroDoc | null {
  try {
    return iframe?.contentDocument ?? null;
  } catch {
    return null;
  }
}

export function HomeHeroApp() {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [systemDark, setSystemDark] = useState(false);
  const [ready, setReady] = useState(false);

  // 站点主题：显式选择优先，否则跟随系统（和 theme-toggle.tsx 同一套规则）。
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemDark(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const dark = theme === "dark" || (theme === null && systemDark);

  // 首帧之后再决定桌面/移动，避免 hydration 不一致；之前外框保持背景色。
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const applyTheme = useCallback(() => {
    const html = getDoc(iframeRef.current)?.documentElement;
    if (!html) return;
    html.classList.toggle("dark", dark);
    html.classList.toggle("light", !dark);
    html.setAttribute("data-theme", dark ? "dark" : "light");
    html.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  const applyZoom = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = getDoc(iframe);
    if (!iframe || !doc) return;
    const html = doc.documentElement;
    html.classList.add("hero-embed");
    const zoom = isMobile ? 1 : iframe.clientWidth / DESKTOP_LAYOUT_WIDTH;
    let style = doc.getElementById(ZOOM_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = ZOOM_STYLE_ID;
      doc.head.appendChild(style);
    }
    style.textContent = "html { zoom: " + zoom + "; }";
  }, [isMobile]);

  const installInteractions = useCallback(() => {
    const doc = getDoc(iframeRef.current);
    if (!doc) return;
    const html = doc.documentElement;
    html.classList.add("hero-embed");
    if (html.getAttribute("data-hero-wheel") === "1") return;
    html.setAttribute("data-hero-wheel", "1");

    // 链接只是快照里的样子，别让点击把 iframe 导航走。
    doc.addEventListener(
      "click",
      (event) => {
        const anchor = (event.target as Element | null)?.closest?.("a");
        if (anchor) event.preventDefault();
      },
      true,
    );

    // 文档区自己滚；其余区域把滚轮交给页面；文档到顶/底后也交还页面。
    doc.addEventListener(
      "wheel",
      (event) => {
        const scroller = (event.target as Element | null)?.closest?.(".editor-scroll-area") as HTMLElement | null;
        const delta = event.deltaY;
        if (scroller) {
          const atTop = scroller.scrollTop <= 0;
          const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
          if (!((delta > 0 && atEnd) || (delta < 0 && atTop))) return;
        }
        event.preventDefault();
        try {
          window.parent.postMessage({ type: "hero:wheel", deltaY: delta }, "*");
        } catch {
          /* ignore */
        }
      },
      { passive: false },
    );
  }, []);

  const handleLoad = useCallback(() => {
    applyTheme();
    applyZoom();
    installInteractions();
    setReady(true);
  }, [applyTheme, applyZoom, installInteractions]);

  // 主题变化：直接改快照的 html.dark，不重载 iframe。
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // 外框宽度变化（窗口缩放、侧栏出现）：重算 zoom。
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !ready) return;
    const observer = new ResizeObserver(() => applyZoom());
    observer.observe(iframe);
    return () => observer.disconnect();
  }, [applyZoom, ready]);

  // 页面滚动转发（iframe 发来的 hero:wheel）。
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; deltaY?: number } | null;
      if (data?.type === "hero:wheel" && typeof data.deltaY === "number") {
        window.scrollBy({ top: data.deltaY, behavior: "auto" });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const src =
    isMobile === null
      ? null
      : "/hero/" + (isMobile ? "mobile" : "desktop") + "-" + (locale === "en" ? "en" : "zh") + ".html";

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      {src ? (
        <iframe
          ref={iframeRef}
          key={src}
          src={src}
          title={isMobile ? "knloop 移动端应用预览" : "knloop 应用预览"}
          onLoad={handleLoad}
          className={
            "absolute inset-x-0 top-0 w-full border-0 " +
            (isMobile ? "h-full" : "h-[810px]")
          }
          style={{ colorScheme: dark ? "dark" : "light" }}
        />
      ) : null}
      <div
        aria-hidden="true"
        className={
          "pointer-events-none absolute inset-0 bg-bg transition-opacity duration-300 " +
          (ready ? "opacity-0" : "opacity-100")
        }
      />
    </div>
  );
}