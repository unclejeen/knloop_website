"use client";

import { HeroActions } from "@/components/hero-actions";
import { HomeSection } from "@/components/home-section";
import { useHomeMessages } from "@/i18n/locale";

/**
 * 首屏文案区块（头部之下、应用预览之上，见 page.tsx 的排布）。
 *
 * 布局：巨大的 knloop 波浪 mark（装饰层）在上，一行标题、一行副标题在下，
 * 整体居中（窄屏自然折行）。顶部留白由 page.tsx 的 --home-copy-top 控制，
 * 底边到预览的间距是这里的 --home-copy-gap。
 * 标题的字号/字重/字距/字体分档都写在 globals.css 的 .home-hero-title
 * （clamp 跟随视口，拉丁 Geist + 中文思源黑体）。
 * 标题与副标题来自 i18n 的 home.hero，双 CTA 见 hero-actions.tsx；
 * badge（1.0 前实验版本）暂时隐藏，
 * 想恢复的话把它接回 BrandLockup 的位置即可。
 */
export function HomeHeroCopy() {
  const { hero } = useHomeMessages();

  return (
    <HomeSection id="home-hero-copy" className="border-t-0 py-0">
      <div className="mx-auto flex max-w-[52rem] flex-col items-center pb-[var(--home-copy-gap)] text-center">
        {/* 巨大的品牌 mark：只做装饰，不参与阅读/交互 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/knloop-logo.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="home-hero-mark theme-adapt-invert pointer-events-none select-none"
        />
        <h1 className="home-hero-title text-balance">{hero.title}</h1>
        {/* 副标题：i18n 里的 lede，压一档字号、走 muted */}
        <p className="mt-5 max-w-[44rem] break-keep text-pretty text-sm leading-relaxed text-muted md:mt-6 md:text-base">
          {hero.lede}
        </p>
        {/* 下载按钮：按平台换链接，见表 src/lib/downloads.ts；
            installHint 在按钮下方挂一条指向安装说明的小字链接（Linux 多个包自己选） */}
        <HeroActions className="mt-12" />
      </div>
    </HomeSection>
  );
}