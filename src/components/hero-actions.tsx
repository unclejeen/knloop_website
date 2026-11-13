"use client";

import { ButtonLink } from "@/components/button";
import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import { useHomeMessages } from "@/i18n/locale";

/**
 * 首页 Hero 的两个行动：下载客户端（左，主按钮）+ 开始使用（右，次按钮）。
 * 首页不做平台判断，下载统一进 /download；平台识别只发生在下载页。
 */
const WEB_APP_URL = "https://app.knloop.com";

export function HeroActions({ className = "" }: { className?: string }) {
  const { hero } = useHomeMessages();

  return (
    <div className={`flex flex-col items-center ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/download" variant="primary" size="lg">
          <DownloadIcon className="h-4 w-4" />
          {hero.clientDownload}
        </ButtonLink>
        <ButtonLink
          href={WEB_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="default"
          size="lg"
        >
          {hero.webCta}
          <ArrowRightIcon className="h-4 w-4" />
        </ButtonLink>
      </div>
      <p className="mt-4 max-w-[46rem] text-balance text-center text-xs leading-relaxed text-muted">
        {hero.localNote}
      </p>
    </div>
  );
}
