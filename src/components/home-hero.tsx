import { HomeHeroApp } from "@/components/home-hero-app";

/**
 * 首页 Hero 区域：应用界面预览，用项目内的组件渲染（home-hero-app.tsx），
 * 不是 <img> 图片，也不再内嵌整页导出的 HTML。
 *
 * 尺寸：宽度整宽、最宽 72rem（1152px，和站点内容宽度一致，见 globals.css 的
 * --home-hero-w）；高度 = max(16:9 算出来的高度, --home-hero-min-h)。
 * 也就是说外框始终按 16:9 走，只有在 16:9 比「够看界面的高度」还矮时
 * （手机上、以及 700~900px 这类窄版面）才用最小高度顶住，不再把界面压扁。
 * 文档区可滚动，其余部分仍是只读装饰。
 *
 * 预览内容按容器宽度自适应：窄框只给文档区，宽框才补上侧栏与检查器。
 * 只读展示：组件内部自带 pointer-events-none / select-none / aria-hidden。
 */
export function HomeHero() {
  return (
    <section aria-label="Hero" className="w-full shrink-0 px-3 pb-12 sm:px-6 sm:pb-16">
      <div className="@container relative mx-auto aspect-video min-h-[var(--home-hero-min-h)] w-[var(--home-hero-w)] max-w-[72rem] overflow-hidden rounded-xl border border-border bg-bg shadow-soft sm:rounded-2xl">
        <HomeHeroApp />
      </div>
    </section>
  );
}
