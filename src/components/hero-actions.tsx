"use client";

import { ButtonLink } from "@/components/button";
import { DownloadIcon } from "@/components/icons";
import { useHomeMessages } from "@/i18n/locale";

/**
 * 首页 Hero 的两个行动：网页版主 CTA + 静态的客户端下载入口。
 * 首页不做平台判断，统一显示「下载客户端」并进 /download；
 * 平台识别只发生在下载页（Tabs + 推荐角标）。
 */
const WEB_APP_URL = "https://app.knloop.com";

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 2.5 15.2 0 18M12 3c-2.5 2.8-2.5 15.2 0 18" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function HeroActions({ className = "" }: { className?: string }) {
  const { hero } = useHomeMessages();

  return (
    <div className={`flex flex-col items-center ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink
          href={WEB_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="lg"
        >
          <GlobeIcon className="h-4 w-4" />
          {hero.webCta}
        </ButtonLink>
        <ButtonLink href="/download" variant="default" size="lg">
          <DownloadIcon className="h-4 w-4" />
          {hero.clientDownload}
        </ButtonLink>
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs leading-relaxed text-muted">
        <LockIcon className="h-3.5 w-3.5 shrink-0" />
        {hero.localNote}
      </p>
    </div>
  );
}