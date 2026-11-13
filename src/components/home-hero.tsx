import { HomeHeroApp } from "@/components/home-hero-app";

/**
 * 首页 Hero 区域：真实客户端预览（iframe 加载 public/hero 下的捕获快照，
 * 逻辑见 home-hero-app.tsx），不是图片、也不是仿写的组件。
 *
 * 尺寸：
 *   · 桌面（>=768px）：外框整宽、最宽 72rem（1152px），16:9，直接显示 WebP 主图。
 *   · 移动（<768px）：和客户端一致的 390:844 比例，20rem（320px）宽圆角卡片，
 *     左右留边；<picture> 自动切到移动版图片。
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