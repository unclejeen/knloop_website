import { HomeFooter } from "@/components/home-footer";
import { HomeHero } from "@/components/home-hero";
import { HomeHeroCopy } from "@/components/home-hero-copy";

export const metadata = {
  title: "knloop",
};

// 首页只保留：首屏文案 + 双 CTA + 真实客户端主图 + footer。
// 原来的四步流程 / 功能截图 / 收尾 CTA 已去掉（介绍内容做减法）。
export default function HomePage() {
  return (
    <>
      <main className="home-surface flex min-h-dvh flex-col">
        <div className="shrink-0 pt-[var(--home-copy-top)]">
          <HomeHeroCopy />
        </div>

        <HomeHero />
      </main>

      <HomeFooter />
    </>
  );
}