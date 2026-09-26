import { HomeCta } from "@/components/home-cta";
import { HomeFlow } from "@/components/home-flow";
import { HomeFooter } from "@/components/home-footer";
import { HomeHero } from "@/components/home-hero";
import { HomeHeroCopy } from "@/components/home-hero-copy";
import { HomeShots } from "@/components/home-shots";

export const metadata = {
  title: "knloop",
};

// 首页：首屏（文案 + 应用预览）之后，照 zerolang docs 的下半部分往下铺：
//   home-flow   四步流程（序号 + 标签 + 标题 + 说明，格子间带箭头）+ 一句小字提醒
//   home-shots  「一个标题 + 一张图」四个区块（图未到位时是占位框，见 src/lib/home-shots.ts）
//   home-cta    收尾：居中标题 + 按钮组
// 文案来自 i18n 的 home.*，滚动进入视口时淡入（globals.css 的 .reveal）。
export default function HomePage() {
  return (
    <>
      <main className="flex min-h-dvh flex-col">
        <div className="shrink-0 pt-[var(--home-copy-top)]">
          <HomeHeroCopy />
        </div>

        <HomeHero />

        <HomeFlow />
        <HomeShots />
        <HomeCta />
      </main>

      <HomeFooter />
    </>
  );
}
