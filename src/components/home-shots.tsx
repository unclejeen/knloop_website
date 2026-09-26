"use client";

import type { ReactNode } from "react";
import { HomeSection, HomeSectionHeader } from "@/components/home-section";
import { HOME_SHOTS } from "@/lib/home-shots";
import type { HomeShot, HomeShotVariant } from "@/lib/home-shots";
import { useHomeMessages } from "@/i18n/locale";
import { cn } from "@/lib/utils";

/**
 * 图在页面上的显示宽度：HomeSection 宽 min(100% - 3rem, 72rem)，图区再收 52rem。
 * 这个值和生成脚本的宽度档（480 / 832 / 1664）是一对：写错会让浏览器挑到更大的一档。
 */
const SHOT_SIZES = "(min-width: 55rem) 52rem, calc(100vw - 3rem)";

function srcSet(variants: readonly HomeShotVariant[], format: "avif" | "webp"): string {
  return variants.map((variant) => `${variant[format]} ${variant.width}w`).join(", ");
}

/** 窗口框（zerolang 的 Panel + WindowBar）：顶部一条标题栏带三个圆点。 */
function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-fg/30 ${className}`}
      style={{ boxShadow: "0 1px 0 0 color-mix(in srgb, var(--color-fg) 4%, transparent)" }}
    >
      {children}
    </div>
  );
}

function WindowBar({ title }: { title: string }) {
  return (
    <div className="relative flex items-center border-b border-fg/30 px-4 py-3">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
      </div>
      <span className="absolute left-1/2 -translate-x-1/2 font-mono text-xs font-medium text-muted">{title}</span>
    </div>
  );
}

/**
 * 「一个标题 + 一张图」的区块组（对应 zerolang 里 01 Chat / 02 Loop / 03 Patch / 04 Graph）。
 *
 * frame: true（默认）套一层窗口外框（三个圆点 + 标题栏 + 描边），图片区固定 16:10；
 * frame: false 就是光图一张（圆角、按图自己的比例），截图里已经带窗口/对话框时用这个。
 *
 * 图走 <picture>：AVIF 优先、WebP 兜底，每个格式按 480 / 832 / 1664 三档给 srcSet，
 * 浏览器只下它这个屏真正需要的那张（见 scripts/optimize-home-shots.mjs）。
 *
 * loading="lazy" 在这里不只是省流量：React 19 会给**非 lazy** 的 <img> 自动插一条
 * <link rel="preload" as="image">，Cloudflare 又把它变成 103 Early Hints，
 * 于是首屏还没解析完，几 MB 的截图就先抢带宽去了（这些图全在首屏之下）。
 * 加 lazy 之后不再预载，滚到哪儿下哪儿。
 */
function ShotMedia({ shot, title, className }: { shot: HomeShot; title: string; className?: string }) {
  const widest = shot.variants[shot.variants.length - 1];

  if (!shot.source || !widest) {
    return (
      <div className={cn("flex items-center justify-center bg-surface-muted text-[0.8125rem] text-muted", className)}>
        图片占位 · {shot.id}
      </div>
    );
  }

  return (
    <picture className="contents">
      <source type="image/avif" srcSet={srcSet(shot.variants, "avif")} sizes={SHOT_SIZES} />
      <img
        src={widest.webp}
        srcSet={srcSet(shot.variants, "webp")}
        sizes={SHOT_SIZES}
        width={widest.width}
        height={widest.height}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={cn(
          "select-none",
          className,
          shot.frame ? (shot.fit === "cover" ? "object-cover" : "object-contain") : undefined,
        )}
      />
    </picture>
  );
}

export function HomeShots() {
  const { sections } = useHomeMessages();

  return (
    <>
      {HOME_SHOTS.map((shot) => {
        const copy = sections[shot.id];
        if (!copy) return null;

        return (
          <HomeSection key={shot.id}>
            <HomeSectionHeader title={copy.title} description={copy.description} />

            {shot.frame ? (
              <div className="reveal mx-auto max-w-[52rem]">
                <Panel className="bg-bg">
                  <WindowBar title={shot.window} />
                  {/* 图区比例默认 16:10；配置里给了 aspect 就按图自己的比例，避免留白 */}
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: shot.aspect ?? "16 / 10" }}
                  >
                    <ShotMedia shot={shot} title={copy.title} className="absolute inset-0 h-full w-full" />
                  </div>
                </Panel>
              </div>
            ) : (
              <div className="reveal mx-auto max-w-[52rem] overflow-hidden rounded-2xl">
                <ShotMedia shot={shot} title={copy.title} className="block w-full" />
              </div>
            )}
          </HomeSection>
        );
      })}
    </>
  );
}
