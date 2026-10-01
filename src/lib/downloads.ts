/**
 * 各平台下载地址 —— 唯一出处，改这个文件就行，组件不用动。
 *
 * Windows / Android 的安装包发在 GitHub Release 上。版本号不写死在代码里：
 * 页面在浏览器里经 gh-proxy 加速拉一次最新 release，按下面的 ASSET_PATTERNS
 * 认出各平台的产物，所以发了新版不用回来改地址。
 * macOS / iOS 还没有包，按钮置灰显示「即将推出」（见 resolveDownloadTarget）。
 * Linux 有 AppImage / deb / rpm 好几个包，按钮不替用户猜，统一跳安装说明页
 * （见 LINUX_DOWNLOAD_TARGET），让用户按发行版自己选。
 * 拉取失败时 Windows 退回 STATIC_DOWNLOADS 里那个已知可用的直链，Android 保持置灰；
 * 认不出平台时用 DEFAULT_DOWNLOAD（安装说明页）。
 */

/** 发行包所在仓库：https://github.com/unclejeen/knloop_website/releases */
export const GITHUB_REPO = "unclejeen/knloop_website";

/** gh-proxy 加速前缀，见 https://gh-proxy.com/docs/github-accelerator */
export const GH_PROXY = "https://gh-proxy.org";

/** 最新 release 的 API（经加速），返回 { tag_name, assets: [{ name, browser_download_url }] } */
export const RELEASES_API_URL = `${GH_PROXY}/https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

/** 最新 release 的网页版；地址永远指向最新版本，安装说明页用它当链接。 */
export const RELEASES_PAGE_URL = `${GH_PROXY}/https://github.com/${GITHUB_REPO}/releases/latest`;

/** 给 GitHub 地址套上加速前缀。 */
export function proxyUrl(url: string): string {
  return `${GH_PROXY}/${url}`;
}

export type DownloadPlatform = "windows" | "macos" | "linux" | "android" | "ios";

/** 有安装包的平台；其余平台（macOS / iOS）按钮置灰。 */
export type DownloadablePlatform = "windows" | "android" | "linux";

export type DownloadTarget = {
  /** 按钮上的平台名（专有名词，中英一致） */
  label: string;
  url: string;
};

/** 按钮上的平台名（专有名词，中英一致） */
export const PLATFORM_LABELS: Record<DownloadPlatform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  android: "Android",
  ios: "iOS",
};

export const DOWNLOADABLE_PLATFORMS: DownloadablePlatform[] = ["windows", "android", "linux"];

/**
 * 各平台在 release 资产里的文件名规则：从上往下取第一个命中的。
 * 产物命名变了只改这里；.sig、latest.json 之类不会命中这些后缀。
 */
export const ASSET_PATTERNS: Record<DownloadablePlatform, RegExp[]> = {
  windows: [/x64-setup\.exe$/i, /setup\.exe$/i],
  android: [/universal\.apk$/i, /arm64.*\.apk$/i, /\.apk$/i],
  linux: [
    /x86_64\.AppImage$/i,
    /amd64\.AppImage$/i,
    /\.AppImage$/i,
    /amd64\.deb$/i,
    /\.deb$/i,
    /\.rpm$/i,
  ],
};

export type ReleaseAsset = { name: string; browser_download_url: string };

/**
 * 离线兜底：只在浏览器拉不到 release 时用。
 * Windows 指一个确认过存在的安装包（允许滞后，发新版时可以随手更新）；
 * Android 还没有静态产物，拉取失败时保持置灰；Linux 不走这里（见 LINUX_DOWNLOAD_TARGET）。
 * 安装说明页（articles/install.md）不走这里，它的链接由
 * scripts/sync-install-downloads.mjs 跟着每次发版自动更新。
 */
export const STATIC_DOWNLOADS: Partial<Record<DownloadablePlatform, DownloadTarget>> = {
  windows: {
    label: PLATFORM_LABELS.windows,
    url: proxyUrl(
      `https://github.com/${GITHUB_REPO}/releases/download/0.1.0-871/knloop_0.1.0-871_windows-x64-setup.exe`,
    ),
  },
};

/** 认不出平台时的兜底：安装说明页（那里列了各平台的包） */
export const DEFAULT_DOWNLOAD: DownloadTarget = { label: "knloop", url: "/install" };

/**
 * Linux 的包有 AppImage / deb / rpm 好几个，按钮替用户猜一个（以前是 AppImage 优先）
 * 必然让另一半人下错包，所以 Linux 不解析直链，统一去安装说明页按发行版自己选。
 * 按钮下面那句小字（home.hero.installHintLinux）就是同一件事的提示。
 */
export const LINUX_DOWNLOAD_TARGET: DownloadTarget = {
  label: PLATFORM_LABELS.linux,
  url: DEFAULT_DOWNLOAD.url,
};

/** 在 release 资产里按 ASSET_PATTERNS 找平台对应的安装包，返回加速后的直链；找不到返回 null。 */
export function pickAssetUrl(assets: ReleaseAsset[], platform: DownloadablePlatform): string | null {
  for (const pattern of ASSET_PATTERNS[platform]) {
    const hit = assets.find((asset) => pattern.test(asset.name));
    if (hit) return proxyUrl(hit.browser_download_url);
  }
  return null;
}

/** macOS / iOS 永远置灰（还没上架）。 */
export function isComingSoonPlatform(platform: DownloadPlatform): boolean {
  return platform === "macos" || platform === "ios";
}

/**
 * 平台最终拿到的下载目标。返回 null 表示没有可下载的包 —— 按钮置灰显示「即将推出」。
 * 优先用动态拉到的地址，其次 STATIC_DOWNLOADS；两者都没有就是 null。
 * Linux 例外：不解析直链，直接给安装说明页（见 LINUX_DOWNLOAD_TARGET）。
 */
export function resolveDownloadTarget(
  platform: DownloadPlatform,
  dynamicUrls: Partial<Record<DownloadablePlatform, string>> = {},
): DownloadTarget | null {
  if (isComingSoonPlatform(platform)) return null;
  if (platform === "linux") return LINUX_DOWNLOAD_TARGET;

  const downloadable = platform as DownloadablePlatform;
  const url = dynamicUrls[downloadable] ?? STATIC_DOWNLOADS[downloadable]?.url;
  return url ? { label: PLATFORM_LABELS[platform], url } : null;
}

type LatestDownloads = Partial<Record<DownloadablePlatform, string>>;

const CACHE_KEY = "knloop:downloads:v1";
/** 三个平台都认出来了：缓存 6 小时，省掉绝大多数请求。 */
const RESOLVED_TTL_MS = 6 * 60 * 60 * 1000;
/** 还有平台没认出来：只缓存 15 分钟，新发出来的包最多 15 分钟就能自动出现。 */
const MISSING_TTL_MS = 15 * 60 * 1000;

type CacheEntry = { at: number; urls: LatestDownloads };

/** 只用 getItem / setItem，方便测试塞假实现。 */
export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type FetchLatestOptions = {
  fetchImpl?: typeof fetch;
  storage?: StorageLike;
};

/** 取浏览器 localStorage；SSR 或存储被禁用时返回 undefined。 */
function defaultStorage(): StorageLike | undefined {
  try {
    return typeof localStorage === "undefined" ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function readCache(storage: StorageLike | undefined): LatestDownloads | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (!entry || typeof entry.at !== "number" || !entry.urls) return null;
    const complete = DOWNLOADABLE_PLATFORMS.every((platform) => entry.urls[platform]);
    if (Date.now() - entry.at > (complete ? RESOLVED_TTL_MS : MISSING_TTL_MS)) return null;
    return entry.urls;
  } catch {
    // 缓存坏了就当没有，别让它挡住请求
    return null;
  }
}

function writeCache(storage: StorageLike | undefined, urls: LatestDownloads): void {
  if (!storage) return;
  try {
    const entry: CacheEntry = { at: Date.now(), urls };
    storage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // 隐私模式 / 存储满了：忽略，退化成每次都请求
  }
}

async function requestLatestDownloadUrls(options: FetchLatestOptions): Promise<LatestDownloads> {
  const { fetchImpl = fetch, storage = defaultStorage() } = options;

  const cached = readCache(storage);
  if (cached) return cached;

  // 不带自定义请求头，避免触发 CORS 预检；GitHub 默认就回 JSON。
  const response = await fetchImpl(RELEASES_API_URL);
  if (!response.ok) throw new Error(`GitHub release API ${response.status}`);

  const release = (await response.json()) as { assets?: ReleaseAsset[] };
  const assets = Array.isArray(release?.assets) ? release.assets : [];

  const urls: LatestDownloads = {};
  for (const platform of DOWNLOADABLE_PLATFORMS) {
    const url = pickAssetUrl(assets, platform);
    if (url) urls[platform] = url;
  }

  writeCache(storage, urls);
  return urls;
}

/** 同一页面里多处调用（首屏 + CTA 两个按钮）共用一个请求。 */
let inflight: Promise<LatestDownloads> | null = null;

/**
 * 拉最新 release，解析出各平台的加速直链。
 * 只请求公开的 GitHub API（经 gh-proxy 加速），失败就抛，由调用方退回兜底。
 * 传了 fetchImpl / storage（测试用）时不共用请求。
 */
export function fetchLatestDownloadUrls(options: FetchLatestOptions = {}): Promise<LatestDownloads> {
  if (options.fetchImpl || options.storage) return requestLatestDownloadUrls(options);

  inflight = inflight ?? requestLatestDownloadUrls(options).finally(() => {
    inflight = null;
  });
  return inflight;
}

/** 从 UA 认平台；认不出来返回 null，交给调用方兜底。 */
export function detectPlatform(): DownloadPlatform | null {
  if (typeof navigator === "undefined") return null;

  const ua = navigator.userAgent.toLowerCase();

  // iPadOS 13+ 的 UA 伪装成 macOS，只能靠触摸点区分
  const iPadOS = /macintosh|mac os x/.test(ua) && navigator.maxTouchPoints > 1;
  if (iPadOS || /iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android"; // Android 的 UA 里也带 linux，必须先判
  if (/windows|win32|win64/.test(ua)) return "windows";
  if (/mac os x|macintosh/.test(ua)) return "macos";
  if (/linux|x11|cros/.test(ua)) return "linux";

  return null;
}
