"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/button";
import { DownloadIcon } from "@/components/icons";
import {
  DEFAULT_DOWNLOAD,
  PLATFORM_LABELS,
  detectPlatform,
  fetchLatestDownloadUrls,
  resolveDownloadTarget,
} from "@/lib/downloads";
import type { DownloadPlatform, DownloadablePlatform } from "@/lib/downloads";
import { useHomeMessages } from "@/i18n/locale";

/**
 * 下载按钮：按访问者的平台给对应的包（链接表与最新版本解析见 src/lib/downloads.ts）。
 *
 * 平台只能在浏览器里认，所以首帧（服务端渲染 + 首次水合）先按兜底链接渲染
 * ——也就是安装说明页——挂载后再换成识别到的平台，避免 hydration 不一致。
 * 挂载后还会拉一次最新 release，把 Windows / Android / Linux 的按钮换成
 * 仓库里最新版本的直链；拉不到就退回静态兜底。macOS / iOS，以及还没有产物的平台
 * （比如 APK 还没发出来时的 Android），渲染成置灰的「即将推出」，发新版后自动变成可下载。
 */
export function DownloadButton({ className }: { className?: string }) {
  const { hero } = useHomeMessages();
  const [platform, setPlatform] = useState<DownloadPlatform | null>(null);
  const [dynamicUrls, setDynamicUrls] = useState<Partial<Record<DownloadablePlatform, string>>>({});

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // 最新 release 的直链：失败了就保持静态兜底，不打扰用户
  useEffect(() => {
    let alive = true;
    fetchLatestDownloadUrls()
      .then((urls) => {
        if (alive) setDynamicUrls(urls);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const target = platform ? resolveDownloadTarget(platform, dynamicUrls) : DEFAULT_DOWNLOAD;
  // 文案是模板：中文「{platform}版下载」、英文 "Download for {platform}"；
  // 认不出平台时用 downloadAll（其它平台下载 → 安装说明页）
  const label = platform
    ? hero.download.replace("{platform}", PLATFORM_LABELS[platform])
    : hero.downloadAll;

  // 没有可下载的包：macOS / iOS，或产物还没发到 release 里的平台
  if (platform && !target) {
    const comingSoon = `${PLATFORM_LABELS[platform]} ${hero.comingSoon}`;
    return (
      <Button
        variant="disabled"
        size="lg"
        className={className}
        disabled
        aria-label={comingSoon}
        title={comingSoon}
      >
        <DownloadIcon className="h-4 w-4 shrink-0" />
        {hero.comingSoon}
      </Button>
    );
  }

  const linkTarget = target ?? DEFAULT_DOWNLOAD;

  return (
    <ButtonLink href={linkTarget.url} variant="primary" size="lg" className={className} aria-label={label}>
      <DownloadIcon className="h-4 w-4 shrink-0" />
      {label}
    </ButtonLink>
  );
}
