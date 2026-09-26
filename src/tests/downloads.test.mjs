import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_DOWNLOAD, DOWNLOADS, detectPlatform } from "../lib/downloads.ts";

const UA = {
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  macos:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  linux:
    "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  // iPadOS 13+ 用的就是 macOS 的 UA，只能靠触摸点区分
  ipados:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  bot: "SomeCrawler/1.0",
};

/** detectPlatform 读 globalThis.navigator，这里换一个再还原。 */
function withUA(userAgent, maxTouchPoints, run) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    value: { userAgent, maxTouchPoints },
    configurable: true,
  });
  try {
    return run();
  } finally {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else delete globalThis.navigator;
  }
}

describe("download platform detection", () => {
  it("maps common desktop and mobile user agents", () => {
    assert.equal(withUA(UA.windows, 0, detectPlatform), "windows");
    assert.equal(withUA(UA.macos, 0, detectPlatform), "macos");
    assert.equal(withUA(UA.linux, 0, detectPlatform), "linux");
    assert.equal(withUA(UA.android, 5, detectPlatform), "android");
    assert.equal(withUA(UA.iphone, 5, detectPlatform), "ios");
  });

  it("treats iPadOS (macOS UA + touch) as iOS", () => {
    assert.equal(withUA(UA.ipados, 5, detectPlatform), "ios");
    assert.equal(withUA(UA.ipados, 0, detectPlatform), "macos");
  });

  it("returns null for unknown clients so the caller can fall back", () => {
    assert.equal(withUA(UA.bot, 0, detectPlatform), null);
  });
});

describe("download links", () => {
  it("covers all five platforms", () => {
    assert.deepEqual(Object.keys(DOWNLOADS).sort(), [
      "android",
      "ios",
      "linux",
      "macos",
      "windows",
    ]);
    for (const [platform, target] of Object.entries(DOWNLOADS)) {
      assert.ok(target.url.length > 0, platform + " needs a url");
      assert.ok(target.label.length > 0, platform + " needs a label");
    }
  });

  it("falls back to the install guide", () => {
    assert.equal(DEFAULT_DOWNLOAD.url, "/install");
  });
});
