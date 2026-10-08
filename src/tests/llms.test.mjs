import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

import { docs } from "../lib/docs.ts";

const siteRoot = resolve(import.meta.dirname, "../..");
const publicRoot = join(siteRoot, "public");
const SITE_ORIGIN = "https://knloop.ai";

/**
 * public/llms.txt 手写，但要跟两份东西对齐，所以钉成测试：
 *   1. llms.txt v2 的骨架（H1 → blockquote → 说明 → H2 文件列表）；
 *   2. 它链接的 .md 镜像确实存在 —— 这些镜像由 scripts/generate-llms-files.mjs
 *      从 articles/*.md 与 zh.json 生成，登记了新文档却忘了写 llms.txt 会在这里报错。
 */
async function readLlms() {
  return readFile(join(publicRoot, "llms.txt"), "utf8");
}

/** 一个 H2 文件列表项：- [标题](链接)，链接后面可选冒号说明。 */
const FILE_LIST_ITEM = /^- \[[^\]]+\]\((https:\/\/[^)\s]+)\)(: .+)?$/;

describe("llms.txt", () => {
  it("follows the v2 skeleton: H1, blockquote, details, then H2 file lists", async () => {
    const text = await readLlms();
    const lines = text.split(/\r?\n/);
    const nonEmpty = lines.filter((line) => line.trim().length > 0);

    assert.match(nonEmpty[0], /^# \S/, "第一行必须是 H1（站点名）");
    assert.equal(nonEmpty.filter((line) => /^# \S/.test(line)).length, 1, "只能有一个 H1");
    assert.match(nonEmpty[1], /^> \S/, "H1 之后必须是一段 blockquote 摘要");

    const firstHeading = lines.findIndex((line) => line.startsWith("## "));
    assert.ok(firstHeading > 0, "至少要有一个 H2 文件列表");
    assert.ok(
      lines.slice(0, firstHeading).some((line) => line.startsWith("> ") && line.length > 2),
      "blockquote 必须在 H2 之前",
    );
    assert.match(text, /^## Optional$/m, "按惯例要有 Optional 段放可跳过的次要链接");
  });

  it("writes every H2 list item as [name](url): notes", async () => {
    const text = await readLlms();
    const afterFirstSection = text.slice(text.search(/^## /m));

    for (const line of afterFirstSection.split(/\r?\n/)) {
      if (!line.startsWith("- ")) {
        assert.ok(!line.trim().startsWith("-"), `文件列表项格式不对：${line}`);
        continue;
      }
      assert.match(line, FILE_LIST_ITEM, `文件列表项必须是 - [名称](链接)，可跟 : 说明：${line}`);
      const [, url] = line.match(FILE_LIST_ITEM) ?? [];
      assert.ok(url.startsWith("https://"), `链接必须写绝对地址：${url}`);
    }
  });

  it("points only at https URLs, and its markdown links resolve to generated mirrors", async () => {
    const text = await readLlms();

    for (const [, url] of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      assert.ok(url.startsWith("https://"), `不允许 http 链接：${url}`);
      if (!url.startsWith(SITE_ORIGIN)) continue;

      const path = url.slice(SITE_ORIGIN.length) || "/";
      if (!path.endsWith(".md")) continue;
      const mirror = join(publicRoot, path.slice(1));
      await assert.doesNotReject(readFile(mirror, "utf8"), `${url} 在 public/ 下没有对应文件`);
    }
  });

  it("lists every registered doc together with its mirror", async () => {
    const text = await readLlms();

    for (const doc of docs) {
      assert.ok(
        text.includes(`${SITE_ORIGIN}${doc.path}.md`),
        `llms.txt 里漏了 ${doc.path}（或写的不是 .md 地址）`,
      );
      const mirror = await readFile(join(publicRoot, `${doc.slug}.md`), "utf8");
      assert.match(mirror, new RegExp(`^# ${doc.title}$`, "m"), `public/${doc.slug}.md 的 H1 应该是文档标题`);
    }
  });

  it("stays small enough to fit in an agent context window", async () => {
    const text = await readLlms();
    assert.ok(Buffer.byteLength(text, "utf8") < 10_000, "llms.txt 超过 10 KB，说明细节该放进链接里");
  });
});
