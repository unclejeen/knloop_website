"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/button";
import { DownloadIcon } from "@/components/icons";
import { AndroidIcon, LinuxIcon, WindowsIcon } from "@/components/os-icons";
import { GH_PROXY, RELEASES_API_URL, RELEASES_PAGE_URL, detectPlatform } from "@/lib/downloads";
import type { DownloadPlatform } from "@/lib/downloads";
import { useDownloadMessages } from "@/i18n/locale";

/**
 * 下载页：只做一件事 —— 让用户拿到对应平台的安装包。
 *
 * 顶部是版本号 + GitHub Releases，下面平台 Tabs（检测到的平台自动选中并挂「推荐」），
 * 同一时间只显示一个下载面板；没有标题、说明、FAQ、步骤。
 * release 信息在客户端拉一次（gh-proxy 加速，失败就退回静态版本和 Releases 页面）。
 */

type SupportedPlatform = "windows" | "linux" | "android";

type AssetUrls = {
  windows?: string;
  android?: string;
  deb?: string;
  rpm?: string;
  flatpak?: string;
};

const FALLBACK_VERSION = "0.1.0-1291";

function isSupported(platform: DownloadPlatform | null): platform is SupportedPlatform {
  return platform === "windows" || platform === "linux" || platform === "android";
}

const TABS: { key: SupportedPlatform; icon: typeof WindowsIcon }[] = [
  { key: "windows", icon: WindowsIcon },
  { key: "linux", icon: LinuxIcon },
  { key: "android", icon: AndroidIcon },
];

export function DownloadPage() {
  const copy = useDownloadMessages();
  const [selected, setSelected] = useState<SupportedPlatform>("windows");
  const [detected, setDetected] = useState<SupportedPlatform | null>(null);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [urls, setUrls] = useState<AssetUrls>({});

  // 平台检测：URL 的 ?os= 优先（首页按钮带过来），其次 UA。
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("os");
    const fromParam =
      param === "windows" || param === "linux" || param === "android" ? param : null;
    const platform = fromParam ?? detectPlatform();
    const supported = isSupported(platform) ? platform : null;
    setDetected(supported);
    setSelected(supported ?? "windows");
  }, []);

  // 拉最新 release：版本号 + 各平台直链；失败就用静态兜底。
  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    fetch(RELEASES_API_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((release: { tag_name?: string; assets?: { name: string; browser_download_url: string }[] } | null) => {
        if (!alive || !release) return;
        if (release.tag_name) setVersion(release.tag_name);

        const assets = Array.isArray(release.assets) ? release.assets : [];
        const find = (pattern: RegExp) => assets.find((asset) => pattern.test(asset.name));
        const proxied = (asset: { browser_download_url: string } | undefined) =>
          asset ? `${GH_PROXY}/${asset.browser_download_url}` : undefined;

        setUrls({
          windows: proxied(find(/x64-setup\.exe$/i) ?? find(/setup\.exe$/i)),
          android: proxied(find(/universal\.apk$/i) ?? find(/arm64.*\.apk$/i) ?? find(/\.apk$/i)),
          deb: proxied(find(/amd64\.deb$/i) ?? find(/\.deb$/i)),
          rpm: proxied(find(/\.rpm$/i)),
          flatpak: proxied(find(/\.flatpak$/i)),
        });
      })
      .catch(() => {
        /* 网络失败：保留静态版本 + Releases 链接 */
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, []);

  const downloadUrl = selected === "windows" ? urls.windows : selected === "android" ? urls.android : undefined;
  const primaryHref = downloadUrl ?? RELEASES_PAGE_URL;
  const label =
    selected === "windows" ? copy.windowsDownload : selected === "android" ? copy.androidDownload : "";

  return (
    <section className="mx-auto flex w-[min(100%-3rem,72rem)] flex-1 flex-col items-center justify-center py-10 text-center sm:py-12">
      <h1 className="sr-only">下载 knloop</h1>
      <p className="m-0 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
        <span>{copy.versionLabel}</span>
        <b className="font-mono text-xs font-medium text-fg">{version}</b>
        <span aria-hidden="true">·</span>
        <a
          href={RELEASES_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-colors hover:text-fg"
        >
          {copy.releases}
        </a>
      </p>

      <div
        role="tablist"
        aria-label="选择平台"
        className="mt-8 inline-flex rounded-xl border border-border bg-surface p-1"
      >
        {TABS.map(({ key, icon: Icon }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(key)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium transition-colors sm:px-4 ${
                active
                  ? "bg-bg text-fg shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_var(--color-border)]"
                  : "text-muted hover:text-fg"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {key === "windows" ? "Windows" : key === "linux" ? "Linux" : "Android"}
              {detected === key ? (
                <span className="ml-0.5 rounded border border-border bg-surface px-1 py-px font-mono text-[9px] font-medium text-muted">
                  {copy.recommended}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-border bg-surface/60 p-6 text-left sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-bg">
            {selected === "windows" ? (
              <WindowsIcon className="h-6 w-6" />
            ) : selected === "linux" ? (
              <LinuxIcon className="h-6 w-6" />
            ) : (
              <AndroidIcon className="h-6 w-6" />
            )}
          </span>
          <div>
            <h2 className="m-0 flex items-center gap-2 text-xl font-semibold tracking-[-0.02em]">
              {selected === "windows" ? "Windows" : selected === "linux" ? "Linux" : "Android"}
            </h2>
            <p className="m-0 mt-1 text-[12.5px] text-muted">
              {selected === "windows" ? copy.windowsMeta : selected === "linux" ? copy.linuxMeta : copy.androidMeta}
            </p>
          </div>
        </div>

        {selected === "linux" ? (
          <div className="grid w-full grid-cols-3 gap-2 sm:w-auto">
            {[
              { key: "deb", label: "deb", sub: copy.linuxDeb },
              { key: "rpm", label: "rpm", sub: copy.linuxRpm },
              { key: "flatpak", label: "Flatpak", sub: copy.linuxFlatpak },
            ].map((pkg) => (
              <a
                key={pkg.key}
                href={urls[pkg.key as keyof AssetUrls] ?? RELEASES_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-col rounded-lg border border-border bg-bg px-3 py-2.5 transition-colors hover:border-fg"
              >
                <b className="font-mono text-xs font-semibold">{pkg.label}</b>
                <span className="mt-0.5 text-[10.5px] leading-snug text-muted">{pkg.sub}</span>
              </a>
            ))}
          </div>
        ) : (
          <ButtonLink
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="lg"
            className="h-[52px] justify-center gap-2 rounded-xl px-6 text-[15px] sm:min-w-[200px]"
          >
            <DownloadIcon className="h-4 w-4" />
            {label}
          </ButtonLink>
        )}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
        <span>
          {copy.webBefore}
          <a
            href="https://app.knloop.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 underline underline-offset-4 transition-colors hover:text-fg"
          >
            {copy.webLink}
          </a>
        </span>
        <Link href="/install" className="underline underline-offset-4 transition-colors hover:text-fg">
          {copy.install}
        </Link>
      </div>
    </section>
  );
}