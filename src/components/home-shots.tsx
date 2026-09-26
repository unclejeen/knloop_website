"use client";

import type { ReactNode } from "react";
import { HomeSection, HomeSectionHeader } from "@/components/home-section";
import { HOME_SHOTS } from "@/lib/home-shots";
import type { HomeShot } from "@/lib/home-shots";
import { useHomeMessages } from "@/i18n/locale";
import { cn } from "@/lib/utils";

/** 按扩展名判断是不是 SVG：SVG 要走 <object>（保留交互），其它走 <img>。 */
function isSvg(src: string): boolean {
  return src.toLowerCase().endsWith(".svg");
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
 * SVG 一律走 <object> 按文档加载，hover / 动画 / 焦点这些交互才不会被 <img> 拍平。
 */
function ShotMedia({ shot, title, className }: { shot: HomeShot; title: string; className?: string }) {
  if (!shot.src) {
    return (
      <div className={cn("flex items-center justify-center bg-surface-muted text-[0.8125rem] text-muted", className)}>
        图片占位 · {shot.id}
      </div>
    );
  }

  if (isSvg(shot.src)) {
    return (
      <object
        data={shot.src}
        type="image/svg+xml"
        aria-label={`${title} 示意图`}
        className={className}
        // 不套外框时 <object> 没有内在尺寸，用配置里的宽高比撑开
        style={shot.frame ? undefined : { aspectRatio: shot.ratio }}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={shot.src}
      alt=""
      draggable={false}
      className={cn(
        "select-none",
        className,
        shot.frame ? (shot.fit === "cover" ? "object-cover" : "object-contain") : undefined,
      )}
    />
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
