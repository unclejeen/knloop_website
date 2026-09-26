import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

const root = resolve(import.meta.dirname, "../..");
const read = (locale) =>
  JSON.parse(readFileSync(join(root, "src/i18n/messages", `${locale}.json`), "utf8"));

/** 把嵌套对象摊平成 "a.b.c" 形式的路径表。 */
function keyPaths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? [path, ...keyPaths(child, path)] : [path];
  });
}

/** 取出所有字符串叶子（路径 → 值）。 */
function strings(value, prefix = "", out = new Map()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object") strings(child, path, out);
    else out.set(path, child);
  }
  return out;
}

// dictionaries.ts 里 en 是 `enMessages as Messages` 断言进来的，缺 key 不会报错，
// 所以这里把「两个语言键结构必须一致」钉成测试。
describe("i18n dictionaries", () => {
  it("en mirrors zh key for key", () => {
    assert.deepEqual(keyPaths(read("en")).sort(), keyPaths(read("zh")).sort());
  });

  it("no copy is left empty", () => {
    for (const locale of ["zh", "en"]) {
      const empty = [...strings(read(locale))]
        .filter(([, value]) => typeof value !== "string" || value.trim() === "")
        .map(([path]) => path);
      assert.deepEqual(empty, [], `${locale} 有空文案`);
    }
  });
});
