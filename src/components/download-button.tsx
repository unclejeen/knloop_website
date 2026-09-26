"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/button";
import { DownloadIcon } from "@/components/icons";
import { DEFAULT_DOWNLOAD, DOWNLOADS, detectPlatform } from "@/lib/downloads";
import type { DownloadPlatform } from "@/lib/downloads";
import { useHomeMessages } from "@/i18n/locale";

/**
 * 下载按钮：按访问者的平台给对应的包（链接表见 src/lib/downloads.ts）。
 *
 * 平台只能在浏览器里认，所以首帧（服务端渲染 + 首次水合）先按兜底链接渲染
 * ——也就是安装说明页——挂载后再换成识别到的平台，避免 hydration 不一致。
 */
export function DownloadButton({ className }: { className?: string }) {
  const { hero } = useHomeMessages();
  const [platform, setPlatform] = useState<DownloadPlatform | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const target = platform ? DOWNLOADS[platform] : DEFAULT_DOWNLOAD;
  // 文案是模板：中文「{platform}版下载」、英文 "Download for {platform}"；
  // 认不出平台时用 downloadAll（其它平台下载 → 安装说明页）
  const label = platform ? hero.download.replace("{platform}", target.label) : hero.downloadAll;

  return (
    <ButtonLink href={target.url} variant="primary" size="lg" className={className} aria-label={label}>
      <DownloadIcon className="h-4 w-4 shrink-0" />
      {label}
    </ButtonLink>
  );
}
