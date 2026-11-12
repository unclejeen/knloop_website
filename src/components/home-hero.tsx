import { HomeHeroApp } from "@/components/home-hero-app";

/**
 * 首页 Hero 区域：真实客户端预览（iframe 加载 public/hero 下的捕获快照，
 * 逻辑见 home-hero-app.tsx），不是图片、也不是仿写的组件。
 *
 * 尺寸：
 *   · 桌面（>=768px）：外框整宽、最宽 72rem（1152px，和站点内容宽度一致），
 *     16:9；iframe 高 810px + 文档内 zoom = 外框宽/1440，文字清晰（见组件注释）。
 *   · 移动（<768px）：真实 390×844 移动布局 1:1，整宽铺满、上下边框，无圆角。
 */
export function HomeHero() {
  return (
    <section aria-label="Hero" className="w-full shrink-0 pb-12 sm:pb-16 md:px-3 lg:px-6">
      <div className="relative mx-auto h-[844px] w-full max-w-[390px] overflow-hidden border-y border-border bg-bg md:aspect-video md:h-auto md:max-w-[72rem] md:rounded-2xl md:border">
        <HomeHeroApp />
      </div>
    </section>
  );
}
