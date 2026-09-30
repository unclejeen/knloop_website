import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

import { docs } from "../lib/docs.ts";

const docsSiteRoot = resolve(import.meta.dirname, "../..");

// 文档路由来自 src/lib/docs.ts 的手工登记（articles/ 不自动扫描），
// 这里把「登记项必须自洽」钉成测试：路由唯一、小写、slug 与 path 对应；
// 增删文章不需要改测试。
describe("docs registry", () => {
  it("gives every doc a unique lowercase route", () => {
    assert.ok(docs.length > 0, "至少要有一篇文档");

    const paths = docs.map((doc) => doc.path);
    const slugs = docs.map((doc) => doc.slug);
    assert.equal(new Set(paths).size, paths.length, "path 不能重复");
    assert.equal(new Set(slugs).size, slugs.length, "slug 不能重复");

    for (const doc of docs) {
      assert.equal(doc.path, `/${doc.slug}`, `${doc.path} 与 slug 不一致`);
      assert.equal(doc.path, doc.path.toLowerCase(), `${doc.path} 必须是小写`);
      assert.ok(doc.title.trim().length > 0, `${doc.slug} 缺 title`);
      assert.ok(doc.section.trim().length > 0, `${doc.slug} 缺 section`);
    }
  });

  it("keeps a non-empty source file for every doc", async () => {
    for (const doc of docs) {
      const source = await readFile(join(docsSiteRoot, doc.sourcePath.slice(1)), "utf8");
      assert.ok(source.trim().length > 0, `${doc.sourcePath} 是空的`);
      assert.match(source, /^##?\s+\S/m, `${doc.sourcePath} 缺标题`);
    }
  });
});
