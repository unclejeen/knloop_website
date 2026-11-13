#!/usr/bin/env node
/**
 * 把 Hero 的真实客户端快照从 prototype/hero-client/snapshots 同步到 public/hero。
 *
 * 约定（由 prototype/hero-client 的 capture 流程生成）：
 *   snapshots/desktop/en/client.html      -> public/hero/desktop-en.html
 *   snapshots/desktop/zh-CN/client.html   -> public/hero/desktop-zh.html
 *   snapshots/mobile/en/client.html       -> public/hero/mobile-en.html
 *   snapshots/mobile/zh-CN/client.html    -> public/hero/mobile-zh.html
 *
 * 用法：node scripts/sync-hero-snapshots.mjs
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceRoot = join(root, "prototype", "hero-client", "snapshots");
const targetRoot = join(root, "public", "hero");

const pairs = [
  ["desktop/en", "desktop-en.html"],
  ["desktop/zh-CN", "desktop-zh.html"],
  ["mobile/en", "mobile-en.html"],
  ["mobile/zh-CN", "mobile-zh.html"],
];

mkdirSync(targetRoot, { recursive: true });
for (const [from, to] of pairs) {
  const src = join(sourceRoot, from, "client.html");
  const dst = join(targetRoot, to);
  if (!existsSync(src)) {
    console.error("[hero] missing snapshot: " + src);
    process.exitCode = 1;
    continue;
  }
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  console.log("[hero] " + to + "  " + statSync(dst).size.toLocaleString("en-US") + " B");
}
