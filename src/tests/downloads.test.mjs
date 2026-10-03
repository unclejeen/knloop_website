import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_DOWNLOAD,
  DOWNLOADABLE_PLATFORMS,
  GH_PROXIES,
  GH_PROXY,
  LINUX_DOWNLOAD_TARGET,
  RELEASES_API_URL,
  detectPlatform,
  fetchLatestDownloadUrls,
  isAcceleratedUrl,
  mirrorUrls,
  pickAssetUrl,
  pickReachableDownloadUrl,
  proxyUrl,
  resolveDownloadTarget,
  unproxyUrl,
} from "../lib/downloads.ts";

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

/** 造一个 release 资产；直链格式和 GitHub API 返回的一致。 */
function asset(name) {
  return {
    name,
    browser_download_url: `https://github.com/unclejeen/knloop_website/releases/download/0.1.0-770/${name}`,
  };
}

/** 最新的 0.1.0-770 真实资产：只有 Windows 安装包，没有 apk / Linux 包。 */
const RELEASE_770 = [
  asset("knloop_0.1.0-770_x64-setup.exe"),
  asset("knloop_0.1.0-770_x64-setup.exe.sig"),
  asset("latest.json"),
];

const RAW_WINDOWS =
  "https://github.com/unclejeen/knloop_website/releases/download/0.1.0-770/knloop_0.1.0-770_x64-setup.exe";

const WINDOWS_URL = `${GH_PROXY}/${RAW_WINDOWS}`;

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

function releaseResponse(assets) {
  return { ok: true, status: 200, json: async () => ({ tag_name: "0.1.0-770", assets }) };
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

describe("release asset picking", () => {
  it("picks the Windows installer and ignores .sig / latest.json", () => {
    assert.equal(pickAssetUrl(RELEASE_770, "windows"), WINDOWS_URL);
  });

  it("prefers a universal apk, then arm64, then any apk", () => {
    assert.ok(
      pickAssetUrl([asset("knloop_0.1.0-770_arm64.apk"), asset("knloop_0.1.0-770_universal.apk")], "android")
        .endsWith("/knloop_0.1.0-770_universal.apk"),
    );
    assert.ok(
      pickAssetUrl([asset("knloop_0.1.0-770_arm64-v8a.apk")], "android").endsWith("/knloop_0.1.0-770_arm64-v8a.apk"),
    );
  });

  it("prefers AppImage, then deb", () => {
    assert.ok(
      pickAssetUrl([asset("knloop_0.1.0-770_amd64.deb"), asset("knloop_0.1.0-770_x86_64.AppImage")], "linux")
        .endsWith("/knloop_0.1.0-770_x86_64.AppImage"),
    );
    assert.ok(
      pickAssetUrl([asset("knloop_0.1.0-770_amd64.deb")], "linux").endsWith("/knloop_0.1.0-770_amd64.deb"),
    );
  });

  it("returns null when the release has no asset for the platform", () => {
    assert.equal(pickAssetUrl(RELEASE_770, "android"), null);
    assert.equal(pickAssetUrl(RELEASE_770, "linux"), null);
    assert.equal(pickAssetUrl([], "windows"), null);
  });

  // 真实的 0.1.0-871 资产名（平台前缀，ADR-0104）。改名却忘了改这里的后缀规则，
  // 下载页会静默置灰——所以用发布出来的名字钉住。
  it("picks the platform-prefixed 0.1.0-871 assets", () => {
    const release871 = [
      "knloop_0.1.0-871_android-arm64-v8a.apk",
      "knloop_0.1.0-871_linux-amd64.AppImage",
      "knloop_0.1.0-871_linux-amd64.AppImage.sig",
      "knloop_0.1.0-871_linux-amd64.deb",
      "knloop_0.1.0-871_linux-amd64.deb.sig",
      "knloop_0.1.0-871_linux-x86_64.rpm",
      "knloop_0.1.0-871_linux-x86_64.rpm.sig",
      "knloop_0.1.0-871_windows-x64-setup.exe",
      "knloop_0.1.0-871_windows-x64-setup.exe.sig",
      "latest.json",
    ].map(asset);

    assert.match(pickAssetUrl(release871, "windows"), /knloop_0\.1\.0-871_windows-x64-setup\.exe$/);
    assert.match(pickAssetUrl(release871, "linux"), /knloop_0\.1\.0-871_linux-amd64\.AppImage$/);
    assert.match(pickAssetUrl(release871, "android"), /knloop_0\.1\.0-871_android-arm64-v8a\.apk$/);
  });

  it("runs asset urls through the accelerator", () => {
    assert.equal(proxyUrl("https://github.com/a/b"), `${GH_PROXY}/https://github.com/a/b`);
  });
});

describe("download targets", () => {
  it("never offers macOS / iOS", () => {
    assert.equal(resolveDownloadTarget("macos", { windows: WINDOWS_URL }), null);
    assert.equal(resolveDownloadTarget("ios", { windows: WINDOWS_URL }), null);
  });

  it("keeps Android disabled until the release has its asset", () => {
    assert.equal(resolveDownloadTarget("android", {}), null);
  });

  it("sends Linux to the install guide so users pick their own package", () => {
    const appimage = `${GH_PROXY}/https://github.com/unclejeen/knloop_website/releases/download/0.1.0-871/knloop_0.1.0-871_linux-amd64.AppImage`;
    // 不管拉没拉到 release，Linux 都不给直链——AppImage 只是其中一个发行包
    assert.deepEqual(resolveDownloadTarget("linux", {}), LINUX_DOWNLOAD_TARGET);
    assert.deepEqual(resolveDownloadTarget("linux", { linux: appimage }), LINUX_DOWNLOAD_TARGET);
    assert.equal(LINUX_DOWNLOAD_TARGET.label, "Linux");
    assert.equal(LINUX_DOWNLOAD_TARGET.url, "/install");
  });

  it("uses the latest release url when available", () => {
    const apk = `${GH_PROXY}/https://github.com/unclejeen/knloop_website/releases/download/0.1.0-770/knloop_0.1.0-770_universal.apk`;
    assert.deepEqual(resolveDownloadTarget("android", { android: apk }), { label: "Android", url: apk });
  });

  it("falls back to the static Windows installer when fetching fails", () => {
    const target = resolveDownloadTarget("windows", {});
    assert.equal(target.label, "Windows");
    assert.ok(target.url.startsWith(`${GH_PROXY}/https://github.com/`));
    assert.ok(target.url.endsWith(".exe"));
  });

  it("covers exactly the three download platforms, plus the install-guide fallback", () => {
    assert.deepEqual([...DOWNLOADABLE_PLATFORMS].sort(), ["android", "linux", "windows"]);
    assert.equal(DEFAULT_DOWNLOAD.url, "/install");
  });
});

describe("latest release lookup", () => {
  it("requests the accelerated GitHub API and resolves platform urls", async () => {
    const calls = [];
    const storage = fakeStorage();
    const urls = await fetchLatestDownloadUrls({
      storage,
      fetchImpl: async (url) => {
        calls.push(String(url));
        return releaseResponse(RELEASE_770);
      },
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0], RELEASES_API_URL);
    assert.ok(calls[0].startsWith(`${GH_PROXY}/https://api.github.com/repos/`));
    assert.equal(urls.windows, WINDOWS_URL);
    assert.equal(urls.android, undefined);
    assert.equal(urls.linux, undefined);
  });

  it("serves the second call from cache", async () => {
    const calls = [];
    const storage = fakeStorage();
    const fetchImpl = async (url) => {
      calls.push(String(url));
      return releaseResponse(RELEASE_770);
    };

    await fetchLatestDownloadUrls({ storage, fetchImpl });
    await fetchLatestDownloadUrls({ storage, fetchImpl });
    assert.equal(calls.length, 1);
  });

  it("throws on a failed request so the caller can fall back", async () => {
    await assert.rejects(
      fetchLatestDownloadUrls({
        storage: fakeStorage(),
        fetchImpl: async () => ({ ok: false, status: 403 }),
      }),
    );
  });
});

describe("accelerator mirrors", () => {
  it("keeps the documented lines in fallback order, primary first", () => {
    assert.equal(GH_PROXY, GH_PROXIES[0]);
    assert.deepEqual(GH_PROXIES, [
      "https://gh-proxy.org",
      "https://v4.gh-proxy.org",
      "https://v6.gh-proxy.org",
      "https://cdn.gh-proxy.org",
    ]);
  });

  it("builds the same asset on every line", () => {
    assert.deepEqual(
      mirrorUrls(RAW_WINDOWS),
      GH_PROXIES.map((proxy) => `${proxy}/${RAW_WINDOWS}`),
    );
  });

  it("round-trips an accelerated url back to github", () => {
    for (const proxy of GH_PROXIES) {
      assert.equal(unproxyUrl(`${proxy}/${RAW_WINDOWS}`), RAW_WINDOWS);
    }
    assert.equal(unproxyUrl("/install"), "/install");
  });

  it("falls through to the next line when one returns 504", async () => {
    const calls = [];
    const urls = await fetchLatestDownloadUrls({
      storage: fakeStorage(),
      fetchImpl: async (url) => {
        calls.push(String(url));
        return calls.length === 1 ? { ok: false, status: 504 } : releaseResponse(RELEASE_770);
      },
    });

    assert.equal(calls.length, 2);
    assert.ok(calls[0].startsWith(`${GH_PROXIES[0]}/`));
    assert.ok(calls[1].startsWith(`${GH_PROXIES[1]}/`));
    // 资产链接跟着 API 一起用通了的那条线路
    assert.equal(urls.windows, `${GH_PROXIES[1]}/${RAW_WINDOWS}`);
  });

  it("throws only after every line has failed", async () => {
    const calls = [];
    await assert.rejects(
      fetchLatestDownloadUrls({
        storage: fakeStorage(),
        fetchImpl: async (url) => {
          calls.push(String(url));
          return { ok: false, status: 502 };
        },
      }),
    );
    assert.equal(calls.length, GH_PROXIES.length);
  });

  it("picks the first line whose asset answers a HEAD", async () => {
    const assetUrl = `${GH_PROXY}/${RAW_WINDOWS}`;
    const tried = [];
    const picked = await pickReachableDownloadUrl(assetUrl, {
      fetchImpl: async (url, init) => {
        tried.push([String(url), init?.method]);
        return String(url).startsWith(`${GH_PROXIES[1]}/`) ? { ok: true } : { ok: false, status: 504 };
      },
    });

    assert.equal(picked, `${GH_PROXIES[1]}/${RAW_WINDOWS}`);
    assert.deepEqual(tried[0], [assetUrl, "HEAD"]);
    assert.equal(tried.length, 2);
  });

  it("keeps the original link when nothing answers", async () => {
    const assetUrl = `${GH_PROXY}/${RAW_WINDOWS}`;
    const picked = await pickReachableDownloadUrl(assetUrl, {
      fetchImpl: async () => {
        throw new Error("network down");
      },
    });
    assert.equal(picked, assetUrl);
  });

  it("leaves links that are not accelerated alone", async () => {
    assert.equal(await pickReachableDownloadUrl("/install"), "/install");
    assert.equal(isAcceleratedUrl("/install"), false);
  });

  it("tells accelerated links apart from site links", () => {
    for (const proxy of GH_PROXIES) {
      assert.equal(isAcceleratedUrl(`${proxy}/${RAW_WINDOWS}`), true);
    }
    assert.equal(isAcceleratedUrl("https://github.com/a/b/releases/download/1/x.exe"), false);
  });
});
