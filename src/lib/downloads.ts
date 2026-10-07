/**
 * 各平台下载地址 —— 唯一出处，改这个文件就行，组件不用动。
 *
 * Windows / Android 的安装包发在 GitHub Release 上。版本号不写死在代码里：
 * 页面在浏览器里经 gh-proxy 加速拉一次最新 release，按下面的 ASSET_PATTERNS
 * 认出各平台的产物，所以发了新版不用回来改地址。
 * macOS / iOS 还没有包，按钮置灰显示「即将推出」（见 resolveDownloadTarget）。
 * Linux 有 deb / rpm 等好几个包，按钮不替用户猜，统一跳安装说明页
 * （见 LINUX_DOWNLOAD_TARGET），让用户按发行版自己选。
 * 拉取失败时 Windows 退回 STATIC_DOWNLOADS 里那个已知可用的直链，Android 保持置灰；
 * 认不出平台时用 DEFAULT_DOWNLOAD（安装说明页）。
 */

/** 发行包所在仓库：https://github.com/unclejeen/knloop_website/releases */
export const GITHUB_REPO = "unclejeen/knloop_website";

/**
 * gh-proxy 的加速线路，第一条是主线路，其余按顺序当回退。
 * 单条线路偶发 504（尤其缓存 MISS 时），换一条往往立刻就好；这几条落在不同 CDN 上
 * （cdn. 是 Fastly，其余是 Cloudflare），所以是互补的入口，不是同一个后端的别名。
 * 只用 .org 这一族：.com 的子域名只是 301/302 跳回 .org（而且 Location 少了斜杠），不能用。
 */
export const GH_PROXIES = [
  "https://gh-proxy.org",
  "https://v4.gh-proxy.org",
  "https://v6.gh-proxy.org",
  "https://cdn.gh-proxy.org",
];

/** 主线路：拼静态链接、安装说明文档用它。 */
export const GH_PROXY = GH_PROXIES[0];

/** 最新 release 的 API 原址。 */
export const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

/** 最新 release 的 API（经主线路加速），返回 { tag_name, assets: [{ name, browser_download_url }] } */
export const RELEASES_API_URL = `${GH_PROXY}/${RELEASES_API}`;

/** 最新 release 的网页版；地址永远指向最新版本，安装说明页用它当链接。 */
export const RELEASES_PAGE_URL = `${GH_PROXY}/https://github.com/${GITHUB_REPO}/releases/latest`;

/** 给 GitHub 地址套上加速前缀；proxy 默认主线路。 */
export function proxyUrl(url: string, proxy: string = GH_PROXY): string {
  return `${proxy}/${url}`;
}

/** 同一个 GitHub 地址在每条线路上的候选链接，按 GH_PROXIES 顺序。 */
export function mirrorUrls(url: string): string[] {
  return GH_PROXIES.map((proxy) => proxyUrl(url, proxy));
}

/** 把加速链接还原成 GitHub 原址；本来就不是加速链接（比如 /install）就原样返回。 */
export function unproxyUrl(url: string): string {
  const proxy = GH_PROXIES.find((candidate) => url.startsWith(`${candidate}/`));
  return proxy ? url.slice(proxy.length + 1) : url;
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
 * Linux 的包有 deb / rpm 好几个，按钮替用户猜一个
 * 必然让另一半人下错包，所以 Linux 不解析直链，统一去安装说明页按发行版自己选。
 * 按钮下面那句小字（home.hero.installHintLinux）就是同一件事的提示。
 */
export const LINUX_DOWNLOAD_TARGET: DownloadTarget = {
  label: PLATFORM_LABELS.linux,
  url: DEFAULT_DOWNLOAD.url,
};

/**
 * 在 release 资产里按 ASSET_PATTERNS 找平台对应的安装包，返回加速后的直链；找不到返回 null。
 * proxy 默认主线路；API 是经哪条线路拿到 release 的，资产链接就跟着用哪条。
 */
export function pickAssetUrl(
  assets: ReleaseAsset[],
  platform: DownloadablePlatform,
  proxy: string = GH_PROXY,
): string | null {
  for (const pattern of ASSET_PATTERNS[platform]) {
    const hit = assets.find((asset) => pattern.test(asset.name));
    if (hit) return proxyUrl(hit.browser_download_url, proxy);
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
  /** 单条线路的超时；测试用。 */
  timeoutMs?: number;
};

/** 单条线路的超时：慢到这个程度基本就是挂了，直接换下一条。 */
const MIRROR_TIMEOUT_MS = 8000;

/**
 * 依次尝试每条加速线路，返回第一个 2xx 的响应和它用的线路。
 * 504 / 超时 / 网络错误都换下一条——用户遇到的正是单条线路偶发 504。
 */
async function fetchFromMirrors(
  rawUrl: string,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<{ response: Response; proxy: string }> {
  const { fetchImpl = fetch, timeoutMs = MIRROR_TIMEOUT_MS } = options;
  let lastError: unknown = new Error(`没有可用的加速线路：${rawUrl}`);

  for (const proxy of GH_PROXIES) {
    const url = proxyUrl(rawUrl, proxy);
    try {
      // 不带自定义请求头，避免触发 CORS 预检；GitHub 默认就回 JSON。
      const response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (response.ok) return { response, proxy };
      lastError = new Error(`GitHub release API ${response.status}：${url}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

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
  const { fetchImpl = fetch, storage = defaultStorage(), timeoutMs } = options;

  const cached = readCache(storage);
  if (cached) return cached;

  const { response, proxy } = await fetchFromMirrors(RELEASES_API, { fetchImpl, timeoutMs });

  const release = (await response.json()) as { assets?: ReleaseAsset[] };
  const assets = Array.isArray(release?.assets) ? release.assets : [];

  const urls: LatestDownloads = {};
  for (const platform of DOWNLOADABLE_PLATFORMS) {
    // 资产链接跟着 API 一起用那条通了的线路
    const url = pickAssetUrl(assets, platform, proxy);
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

/**
 * 点下载时每条线路最多等这么久，超时就当这条不通、换下一条。
 * 别调太小：这些线路冷启动时 HEAD 要 1–2s（实测 v6 最慢到 2.0s），太短会把能用的线路也跳掉。
 */
const PROBE_TIMEOUT_MS = 2000;

export type PickReachableOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  /** 每次都重新测（点下载用），不吃上一次探测的结论。 */
  fresh?: boolean;
};

/** 探过的结果记下来：同一页面里首屏 + CTA 两个按钮只探一次。 */
const reachableCache = new Map<string, Promise<string>>();

/**
 * 一条线路上的资产真的能下吗？HEAD 一次，2xx 算通。
 * 一条都不通就返回 GitHub 原址：加速线路全挂了还有 GitHub 兜底，
 * 不该把用户丢在一张 504 上，更不该让他自己去换域名。
 */
async function probeMirrors(url: string, raw: string, options: PickReachableOptions): Promise<string> {
  const { fetchImpl = fetch, timeoutMs = PROBE_TIMEOUT_MS } = options;
  // 先用链接里现成的那条线路，再依次试其余线路
  const candidates = [url, ...mirrorUrls(raw).filter((candidate) => candidate !== url)];

  for (const candidate of candidates) {
    try {
      const response = await fetchImpl(candidate, {
        method: "HEAD",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) return candidate;
    } catch {
      // 探测本身失败就当这条线路不可用，继续试下一条
    }
  }
  return raw;
}

/** 这个链接是不是走加速线路的；站内链接（比如安装说明页 /install）不是。 */
export function isAcceleratedUrl(url: string): boolean {
  return unproxyUrl(url) !== url;
}

/**
 * 从候选线路里挑一条真的能用的资产链接。
 *
 * gh-proxy 单条线路偶发 504，把用户直接丢到 504 上他只能自己重试，所以点下载、点文档里的
 * 下载链接之前都先现测一次（传 fresh，见 components/mirror-link.tsx）：第一个 2xx 的线路
 * 才算数；四条线路都不通就直接回 GitHub 原址兜底。
 * 不是加速链接（比如安装说明页 /install）就原样返回，不探测。
 * 传了 fetchImpl / timeoutMs（测试用）时不共用缓存。
 */
export function pickReachableDownloadUrl(url: string, options: PickReachableOptions = {}): Promise<string> {
  const raw = unproxyUrl(url);
  if (raw === url) return Promise.resolve(url);

  // 以「当前这条链接」为键：换了线路（比如 API 回退到 v4）要重新探，别沿用上一轮的结论。
  // fresh 用于「每次点击都测」：当次绕过缓存，重新发 HEAD。
  const cacheable = !options.fresh && !options.fetchImpl && !options.timeoutMs;
  const cached = cacheable ? reachableCache.get(url) : undefined;
  if (cached) return cached;

  const task = probeMirrors(url, raw, options);
  if (cacheable) reachableCache.set(url, task);
  return task;
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
