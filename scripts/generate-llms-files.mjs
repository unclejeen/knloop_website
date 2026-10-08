/**
 * 生成 LLM 友好文件：llms.txt 里链接的那些 .md 页面。
 *
 * 为什么需要它：public/llms.txt（手写）按 llms.txt v2 规范指向每个页面的 Markdown
 * 版本，而页面正文分别来自 articles/*.md（文档）与 src/i18n/messages/zh.json（首页
 * 文案）。与其手抄一份注定过期的副本，不如按内容源头重新生成：
 *   public/index.md     ← zh.json 的 home.*（首页文案）
 *   public/install.md   ← articles/install.md（安装指南，发版时由 sync-install-downloads.mjs 更新）
 *   public/feedback.md  ← articles/Feedback.md（问题反馈）
 * 生成结果和 public/search-index.json 一样是构建产物，prebuild 时重新写一遍。
 * 不写生成时间，内容没变就不产生 diff。
 *
 * 用法：node scripts/generate-llms-files.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { docs } from "../src/lib/docs.ts";
import { GITHUB_REPO, PLATFORM_LABELS, DOWNLOADABLE_PLATFORMS } from "../src/lib/downloads.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES_ROOT = join(ROOT, "articles");
const MESSAGES_PATH = join(ROOT, "src", "i18n", "messages", "zh.json");
const PUBLIC_ROOT = join(ROOT, "public");
const SITE_URL = "https://knloop.ai";

/** 首页能力区块的展示顺序，与 src/lib/home-shots.ts 的截图顺序一致。 */
const FEATURE_ORDER = ["local", "agents", "mcp", "git", "editor", "start"];

/** 句末标点：中文句子拼接时后面不加空格，拉丁字母句子才加。 */
const CJK_END = /[。！？；：，、）」』】]$/;

/** 文案里的换行（首页用 \n 分成两行）在 Markdown 里并成一段。 */
function oneLine(text) {
  return text
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => (acc && !CJK_END.test(acc) ? `${acc} ${part}` : acc + part), "");
}

/** 每份镜像开头都标明来源与「这是生成产物」。 */
function sourceNote(pageUrl) {
  return `*本文件是 ${pageUrl} 的 Markdown 版本，随站点内容生成，与 HTML 页面内容一致。*`;
}

/**
 * 文档正文整理：去掉 HTML 注释（构建标记、维护者说明）、行尾空格与多余空行；
 * 正文首个标题如果和文档标题重复（Feedback.md 的 "## 问题反馈"），去掉它。
 */
function tidyBody(markdown, title) {
  const lines = markdown.replace(/<!--[\s\S]*?-->/g, "").split("\n").map((line) => line.replace(/\s+$/, ""));

  for (;;) {
    const first = lines[0]?.trim() ?? "";
    if (!first) {
      lines.shift();
      continue;
    }
    if (first.replace(/^#+\s*/, "") === title) {
      lines.shift();
      continue;
    }
    break;
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** 首页：从 zh.json 的 home.* 拼一份干净的 Markdown。 */
function buildIndexMarkdown(zh) {
  const home = zh.home;

  const flow = home.flow
    .map((step, index) => `${index + 1}. **${step.label} · ${step.title}**：${oneLine(step.body)}`)
    .join("\n");

  const features = FEATURE_ORDER.map((id) => {
    const feature = home.sections[id];
    return `### ${feature.title}\n\n${oneLine(feature.description)}`;
  }).join("\n\n");

  const platforms = DOWNLOADABLE_PLATFORMS.map((platform) => PLATFORM_LABELS[platform]).join("、");
  const releasesUrl = `https://github.com/${GITHUB_REPO}/releases`;

  return `# knloop · ${home.hero.title}

> ${oneLine(home.hero.lede)}

${oneLine(home.hero.note)}

${sourceNote(`${SITE_URL}/`)}

## 工作流

${flow}

## 核心能力

${features}

## 下载

- 已提供安装包：${platforms}（Linux 按发行版选 AppImage / deb / rpm）。
- macOS、iOS：即将推出。
- 全部安装包与历史版本：${releasesUrl}
- 各平台直链与说明见 [安装指南](${SITE_URL}/install.md)。

## 反馈

微信群与 QQ 群的联系方式见 [问题反馈](${SITE_URL}/feedback.md)。
`;
}

async function main() {
  const zh = JSON.parse(await readFile(MESSAGES_PATH, "utf8"));
  const written = [];

  await writeFile(join(PUBLIC_ROOT, "index.md"), buildIndexMarkdown(zh), "utf8");
  written.push("index.md");

  for (const doc of docs) {
    const relative = doc.sourcePath.replace(/^\/articles\//, "");
    const raw = await readFile(join(ARTICLES_ROOT, relative), "utf8");
    const markdown = `# ${doc.title}

${sourceNote(`${SITE_URL}${doc.path}`)}

${tidyBody(raw, doc.title)}
`;
    const name = `${doc.slug}.md`;
    await writeFile(join(PUBLIC_ROOT, name), markdown, "utf8");
    written.push(name);
  }

  console.log(`Generated ${written.length} markdown page(s) → ${PUBLIC_ROOT}: ${written.join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
