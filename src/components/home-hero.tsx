import { HomeHeroApp } from "@/components/home-hero-app";

/**
 * 首页 Hero 区域：真实客户端预览（iframe 加载 public/hero 下的捕获快照，
 * 逻辑见 home-hero-app.tsx），不是图片、也不是仿写的组件。
 *
 * 尺寸：
 *   · 桌面（>=768px）：外框整宽、最宽 72rem（1152px，和站点内容宽度一致），
 *     16:9；iframe 高 810px + 文档内 zoom = 外框宽/1440，文字清晰。
 *   · 移动（<768px）：真实 390×844 移动布局，缩到 20rem（320px）宽、圆角卡片，
 *     左右留出边距；iframe 用 transform 等比缩小，字体跟着小一档。
 */
export function HomeHero() {
  return (
    <section aria-label="Hero" className="w-full shrink-0 px-4 pb-10 sm:pb-16 md:px-3 lg:px-6">
      <div className="relative mx-auto aspect-[390/844] w-full max-w-[20rem] overflow-hidden rounded-2xl border border-border bg-bg shadow-soft md:aspect-video md:max-w-[72rem]">
        <HomeHeroApp />
      </div>
    </section>
  );
}
