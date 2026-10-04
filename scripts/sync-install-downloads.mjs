/**
 * 把 articles/install.md 里的下载链接同步成最新 Release 的产物。
 *
 * 为什么需要它：release 资产名里带版本号（knloop_0.1.0-871_linux-amd64.deb），
 * 所以文档里写死的直链每发一版就会过期——旧版本的 install.md 就停在 0.1.0-844，
 * 连 APK 的名字都是错的。这个脚本按 src/lib/downloads.ts 里的仓库与加速前缀去拉一次
 * release，把 install.md 里 <!-- downloads:start --> ... <!-- downloads:end --> 之间的
 * 内容整块重写；发布流水线（.github/workflows/release.yml 的 sync-install-links job）
 * 在每次发布完成后自动跑一遍并提交，本地也可以手动跑。
 *
 * 用法：
 *   node scripts/sync-install-downloads.mjs                    # 最新 release
 *   node scripts/sync-install-downloads.mjs --tag 0.1.0-871    # 指定 tag
 *   node scripts/sync-install-downloads.mjs --release r.json   # 离线：直接读一份 release JSON
 *   node scripts/sync-install-downloads.mjs --check            # 只检查是否需要更新（CI 用）
 *
 * 私有仓库拉 release 时给 GITHUB_TOKEN / GH_TOKEN（公开仓库匿名也能拉，只是限流更紧）。
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { GITHUB_REPO, proxyUrl } from "../src/lib/downloads.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** 被同步的文档；标记块之外的内容不受影响。 */
export const INSTALL_DOC_PATH = join(ROOT, "articles", "install.md");
export const BLOCK_START = "<!-- downloads:start -->";
export const BLOCK_END = "<!-- downloads:end -->";

/**
 * Release 网页地址（GitHub 直链）。这里不套 gh-proxy：加速服务只代理 release 资产，
 * 代理网页会 403，所以网页链接交给浏览器直接访问 github.com。
 */
export const RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases`;

/** 有安装包的平台，按文档里的顺序。 */
const PLATFORMS = [
  { heading: "Windows", pattern: /setup\.exe$/i },
  { heading: "Android", pattern: /\.apk$/i },
];

/**
 * Linux 有多个发行包，站点按钮只能猜一个（AppImage 优先），所以文档里全列出来，
 * 让用户自己按发行版选。顺序与站点按钮的偏好一致。
 */
const LINUX_VARIANTS = [
  { label: "AppImage（免安装，chmod +x 后直接运行）", pattern: /\.AppImage$/i },
  { label: "deb（Debian / Ubuntu）", pattern: /\.deb$/i },
  { label: "rpm（Fedora / RHEL / openSUSE）", pattern: /\.rpm$/i },
];

/** 资产里挑出某个平台的安装包；.sig / latest.json 不在这些后缀里，自然被排除。 */
function matchAssets(assets, pattern) {
  const hits = assets.filter((asset) => asset && typeof asset.name === "string" && pattern.test(asset.name));
  // 通用包排前面：有 universal 就不该让分架构的包抢在前面。
  const rank = (asset) => (/universal/i.test(asset.name) ? 0 : 1);
  return hits.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

function downloadLine(asset, suffix = "") {
  return `- [${asset.name}](${proxyUrl(asset.browser_download_url)})${suffix}`;
}

/**
 * 生成标记块里的 Markdown。纯函数：同样的 release 一定生成同样的内容，
 * 所以 --check 不会因为时间戳之类的东西误报。
 */
export function renderInstallBlock(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : [];
  const tag = String(release?.tag_name ?? release?.version ?? "").trim();

  const lines = [
    BLOCK_START,
    "",
    // 网页链接用 GitHub 直链（RELEASES_PAGE）：gh-proxy 只代理 release 资产，代理网页会 403。
    // 用哪条加速线路在点击时决定（见 src/components/mirror-link.tsx）：四条线路挨个试，都不通
    // 就直接回 GitHub 原址。所以页头只说明会自动回退，不写「自己把域名换成 v4 / v6 / cdn」这种
    // 把问题推给用户的提示——用户看到 504 就说明我们没兜住。
    `> 当前版本 **${tag || "未知"}**，下载链接会自动挑一条通的加速线路，都不通就直接回退 GitHub；也可以在 [releases](${RELEASES_PAGE}) 页面下载。`,
    "",
  ];

  for (const { heading, pattern } of PLATFORMS) {
    const hits = matchAssets(assets, pattern);
    lines.push(`### ${heading}`, "");
    if (hits.length === 0) lines.push("- 还没有这个平台的安装包。", "");
    else lines.push(...hits.map((asset) => downloadLine(asset)), "");
  }

  lines.push("### Linux（有多个包，按你的发行版选一个）", "");
  const linux = LINUX_VARIANTS.map((variant) => {
    const hit = assets.find((asset) => asset && variant.pattern.test(asset.name));
    return hit ? downloadLine(hit, ` — ${variant.label}`) : null;
  }).filter(Boolean);
  if (linux.length === 0) lines.push("- 还没有这个平台的安装包。", "");
  else lines.push(...linux, "");

  lines.push("### macOS / iOS", "", "即将推出。", "", BLOCK_END);

  return lines.join("\n");
}

/** 把标记块整块换掉，标记之外原样保留；找不到标记就报错（说明文档被改动过）。 */
export function replaceInstallBlock(source, block) {
  const start = source.indexOf(BLOCK_START);
  const end = source.indexOf(BLOCK_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`找不到 ${BLOCK_START} / ${BLOCK_END} 标记，无法自动更新（见 articles/install.md）`);
  }
  return `${source.slice(0, start)}${block}${source.slice(end + BLOCK_END.length)}`;
}

/** release JSON -> 一整份新的 install.md 内容。 */
export function renderInstallDoc(source, release) {
  return replaceInstallBlock(source, renderInstallBlock(release));
}

/** 拉一份 release：默认最新，给了 tag 就拉那个 tag。 */
export async function fetchRelease(options = {}) {
  const {
    repo = GITHUB_REPO,
    tag,
    token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
    fetchImpl = fetch,
  } = options;
  const url = tag
    ? `https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`
    : `https://api.github.com/repos/${repo}/releases/latest`;

  const response = await fetchImpl(url, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "knloop-install-downloads-sync",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`GitHub release API ${response.status}：${url}`);
  return response.json();
}

/**
 * 按 release 更新文档。check=true 时只比对不对（CI 里判断有没有漂移），返回 { changed, tag }。
 */
export async function syncInstallDoc(options = {}) {
  const { release, docPath = INSTALL_DOC_PATH, check = false } = options;
  const source = await readFile(docPath, "utf8");
  const updated = renderInstallDoc(source, release);
  const tag = String(release?.tag_name ?? release?.version ?? "").trim();
  const changed = updated !== source;
  if (changed && !check) await writeFile(docPath, updated, "utf8");
  return { changed, tag };
}

const USAGE = `用法：node scripts/sync-install-downloads.mjs [选项]

  --tag <tag>        同步指定 release（默认：最新 release）
  --release <file>   离线模式：直接读一份 GitHub release JSON
  --doc <file>       换一份文档（默认 articles/install.md，测试用）
  --repo <owner/name> 换一个仓库（默认 ${GITHUB_REPO}）
  --check            只检查是否需要更新，不写文件（有变化时退出码 1）
  -h, --help         看这段说明
`;

function parseArgs(argv) {
  const options = { check: false, tag: undefined, releaseFile: undefined, docFile: undefined, repo: GITHUB_REPO, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--check") options.check = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--tag") options.tag = argv[++i];
    else if (arg === "--repo") options.repo = argv[++i];
    else if (arg === "--release") options.releaseFile = argv[++i];
    else if (arg === "--doc") options.docFile = argv[++i];
    else throw new Error(`未知参数 ${arg}（--help 看用法）`);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return;
  }

  const release = options.releaseFile
    ? JSON.parse(await readFile(resolve(process.cwd(), options.releaseFile), "utf8"))
    : await fetchRelease({ repo: options.repo, tag: options.tag });

  const result = await syncInstallDoc({
    release,
    check: options.check,
    ...(options.docFile ? { docPath: resolve(process.cwd(), options.docFile) } : {}),
  });

  if (options.check && result.changed) {
    console.error(`[sync-install-downloads] articles/install.md 与 ${result.tag} 不一致，需要重新生成。`);
    process.exitCode = 1;
    return;
  }
  const action = result.changed ? (options.check ? "需要更新" : "已更新") : "已是最新";
  console.log(`[sync-install-downloads] ${result.tag || "(未知版本)"} -> articles/install.md ${action}`);
}

// 被当成脚本直接跑时才执行；被测试 import 时只拿纯函数。
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(`[sync-install-downloads] ${error.message}`);
    process.exitCode = 1;
  });
}
