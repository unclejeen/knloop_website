"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { Button, ButtonLink } from "@/components/button";
import { DownloadIcon } from "@/components/icons";
import {
  DEFAULT_DOWNLOAD,
  PLATFORM_LABELS,
  detectPlatform,
  fetchLatestDownloadUrls,
  isAcceleratedUrl,
  pickReachableDownloadUrl,
  resolveDownloadTarget,
} from "@/lib/downloads";
import type { DownloadPlatform, DownloadablePlatform } from "@/lib/downloads";
import { useHomeMessages } from "@/i18n/locale";

/**
 * 下载按钮：按访问者的平台给对应的包（链接表与最新版本解析见 src/lib/downloads.ts）。
 *
 * 平台只能在浏览器里认，所以首帧（服务端渲染 + 首次水合）先按兜底链接渲染
 * ——也就是安装说明页——挂载后再换成识别到的平台，避免 hydration 不一致。
 * 挂载后还会拉一次最新 release，把 Windows / Android 的按钮换成仓库里最新版本的直链；
 * 拉不到就退回静态兜底。macOS / iOS，以及还没有产物的平台（比如 APK 还没发出来时的
 * Android），渲染成置灰的「即将推出」，发新版后自动变成可下载。Linux 不解析直链：
 * 按钮直接指向安装说明页，让用户按发行版自己选（见 resolveDownloadTarget）。
 *
 * 加速线路（gh-proxy.org / v4. / v6. / cdn.）偶发 504：拉 release 时会按顺序换线路。
 * 点下载时再现场测一次（handleDownload）：挨条 HEAD，第一个 2xx 的线路才触发浏览器下载。
 *
 * installHint：按钮下面再挂一条小字链接指向安装说明。Linux 不挂——按钮本身就指向那一页。
 */
export function DownloadButton({
  className,
  installHint = false,
}: {
  className?: string;
  installHint?: boolean;
}) {
  const { hero } = useHomeMessages();
  const [platform, setPlatform] = useState<DownloadPlatform | null>(null);
  const [dynamicUrls, setDynamicUrls] = useState<Partial<Record<DownloadablePlatform, string>>>({});
  const [resolving, setResolving] = useState(false);

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

  // 文案是模板：中文「{platform} 版下载」、英文 "Download for {platform}"；
  // 认不出平台时用 downloadAll（其它平台下载 → 安装说明页）；正在测线路时给个反馈
  const label = resolving
    ? hero.connecting
    : platform
      ? hero.download.replace("{platform}", PLATFORM_LABELS[platform])
      : hero.downloadAll;

  // 小字链接：Linux 的按钮本身就指向安装说明页，再挂一句提示是多余的，所以只有其余平台显示。
  const hint =
    installHint && platform !== "linux" ? (
      <Link
        href="/install"
        className="mt-3 text-xs text-muted underline underline-offset-4 transition-colors hover:text-fg"
      >
        {hero.installHint}
      </Link>
    ) : null;

  // 没有可下载的包：macOS / iOS，或产物还没发到 release 里的平台
  if (platform && !target) {
    const comingSoon = `${PLATFORM_LABELS[platform]} ${hero.comingSoon}`;
    return (
      <div className={["inline-flex flex-col items-center", className].filter(Boolean).join(" ")}>
        <Button variant="disabled" size="lg" disabled aria-label={comingSoon} title={comingSoon}>
          <DownloadIcon className="h-4 w-4 shrink-0" />
          {hero.comingSoon}
        </Button>
      </div>
    );
  }

  // href 只是个「候选」：真正用哪条线路，点下去的那一刻才测（见 handleDownload）
  const linkTarget = target ?? DEFAULT_DOWNLOAD;

  /**
   * 点下载时才测线路：按顺序对每条线路 HEAD 一次，第一个 2xx 的才拿来下载。
   * 504 / 超时 / 网络错误都跳过换下一条；全都测不通就退回原链接，让浏览器自己去试。
   * 站内链接（安装说明页）没什么可回退的，直接走默认行为。
   */
  const handleDownload = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isAcceleratedUrl(linkTarget.url)) return;
    event.preventDefault();
    if (resolving) return;

    setResolving(true);
    let url = linkTarget.url;
    try {
      url = await pickReachableDownloadUrl(linkTarget.url, { fresh: true });
    } catch {
      // 探测本身出错：退回原链接
    }
    setResolving(false);
    window.location.href = url;
  };

  return (
    <div className={["inline-flex flex-col items-center", className].filter(Boolean).join(" ")}>
      <ButtonLink
        href={linkTarget.url}
        variant="primary"
        size="lg"
        aria-label={label}
        aria-busy={resolving}
        onClick={handleDownload}
      >
        <DownloadIcon className="h-4 w-4 shrink-0" />
        {label}
      </ButtonLink>
      {hint}
    </div>
  );
}
