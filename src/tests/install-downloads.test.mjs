import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

import { GH_PROXY } from "../lib/downloads.ts";
import {
  BLOCK_END,
  BLOCK_START,
  INSTALL_DOC_PATH,
  renderInstallBlock,
  renderInstallDoc,
  replaceInstallBlock,
} from "../../scripts/sync-install-downloads.mjs";

const SCRIPT = resolve(import.meta.dirname, "../../scripts/sync-install-downloads.mjs");

const TAG = "0.1.0-871";

/** 真实的 0.1.0-871 资产（含 .sig、latest.json——它们不该出现在文档里）。 */
const ASSETS_871 = [
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
];

function release(tag = TAG, names = ASSETS_871) {
  return {
    tag_name: tag,
    assets: names.map((name) => ({
      name,
      browser_download_url: `https://github.com/unclejeen/knloop_website/releases/download/${tag}/${name}`,
    })),
  };
}

/** 一份带标记块的 install.md：标记之外的内容必须原样保留。 */
const DOC = `## 安装 knloop

下载链接见下表。

${BLOCK_START}
旧的、写死的 0.1.0-844 链接
${BLOCK_END}

有问题去反馈页。
`;

describe("install.md download links", () => {
  it("lists windows, android and every linux package through the accelerator", () => {
    const block = renderInstallBlock(release());

    assert.ok(block.startsWith(BLOCK_START));
    assert.ok(block.trimEnd().endsWith(BLOCK_END));

    for (const asset of [
      "windows-x64-setup.exe",
      "android-arm64-v8a.apk",
      "linux-amd64.AppImage",
      "linux-amd64.deb",
      "linux-x86_64.rpm",
    ]) {
      const url = `${GH_PROXY}/https://github.com/unclejeen/knloop_website/releases/download/${TAG}/knloop_${TAG}_${asset}`;
      assert.ok(block.includes(`[knloop_${TAG}_${asset}](${url})`), `缺 ${asset} 的加速直链`);
    }

    assert.ok(block.includes(TAG), "要写明当前版本");
    // gh-proxy 代理 GitHub 网页会 403，所以块里只允许出现 release 资产直链。
    for (const link of [...block.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1])) {
      assert.ok(link.includes("/releases/download/"), `${link} 不是资产直链`);
    }
    assert.ok(!block.includes(".sig"), ".sig 不该进文档");
    assert.ok(!block.includes("latest.json"), "latest.json 不该进文档");
  });

  it("lists the linux packages a button cannot choose between", () => {
    const block = renderInstallBlock(release());
    assert.ok(block.includes("Linux（有多个包，按你的发行版选一个）"));
    assert.ok(block.includes("AppImage"));
    assert.ok(block.includes("deb（Debian / Ubuntu）"));
    assert.ok(block.includes("rpm（Fedora / RHEL / openSUSE）"));
  });

  it("prefers a universal apk over the per-abi one", () => {
    const block = renderInstallBlock(
      release(TAG, ["knloop_0.1.0-871_android-arm64-v8a.apk", "knloop_0.1.0-871_android-universal.apk"]),
    );
    assert.ok(
      block.indexOf("android-universal.apk") < block.indexOf("android-arm64-v8a.apk"),
      "universal 应该排在分架构包前面",
    );
  });

  it("says so when a platform has no asset yet", () => {
    const block = renderInstallBlock({ tag_name: "0.1.0-1", assets: [] });
    assert.equal(block.match(/还没有这个平台的安装包。/g).length, 3);
  });

  it("replaces only the marked block", () => {
    const updated = replaceInstallBlock(DOC, renderInstallBlock(release()));
    assert.ok(updated.startsWith("## 安装 knloop\n"));
    assert.ok(updated.includes("下载链接见下表。"));
    assert.ok(updated.endsWith("有问题去反馈页。\n"));
    assert.ok(!updated.includes("0.1.0-844"), "旧链接必须被换掉");
  });

  it("fails loudly when the markers are gone", () => {
    assert.throws(() => replaceInstallBlock("## 安装 knloop\n", "x"), /downloads:start/);
  });

  it("is idempotent, so the sync job only commits real changes", () => {
    const once = renderInstallDoc(DOC, release());
    assert.equal(renderInstallDoc(once, release()), once);
  });

  it("keeps the checked-in articles/install.md accelerated and inside the markers", () => {
    const source = readFileSync(INSTALL_DOC_PATH, "utf8");
    assert.ok(source.includes(BLOCK_START) && source.includes(BLOCK_END), "install.md 缺标记块");
    assert.match(source, /^##\s+\S/m, "install.md 缺标题");

    const links = [...source.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]);
    assert.ok(links.length >= 5, `install.md 里的下载链接太少（${links.length}）`);
    for (const link of links) {
      assert.ok(link.startsWith(`${GH_PROXY}/https://`), `${link} 没走加速服务`);
    }
  });
});

describe("sync-install-downloads CLI", () => {
  function withTempDir(run) {
    const dir = mkdtempSync(join(tmpdir(), "knloop-install-"));
    try {
      return run(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  function runCli(dir, args) {
    return spawnSync(process.execPath, [SCRIPT, ...args], {
      cwd: dir,
      encoding: "utf8",
      env: { ...process.env, GITHUB_TOKEN: "", GH_TOKEN: "" },
    });
  }

  it("rewrites a doc from an offline release, then reports it is up to date", () => {
    withTempDir((dir) => {
      const doc = join(dir, "install.md");
      const json = join(dir, "release.json");
      writeFileSync(doc, DOC);
      writeFileSync(json, JSON.stringify(release()));

      const first = runCli(dir, ["--release", json, "--doc", doc]);
      assert.equal(first.status, 0, first.stderr);
      assert.match(first.stdout, /已更新/);

      const synced = readFileSync(doc, "utf8");
      assert.ok(synced.includes("knloop_0.1.0-871_windows-x64-setup.exe"));
      assert.ok(synced.includes("下载链接见下表。"));

      const again = runCli(dir, ["--release", json, "--doc", doc, "--check"]);
      assert.equal(again.status, 0, again.stderr);
      assert.match(again.stdout, /已是最新/);
    });
  });

  it("exits non-zero under --check when the doc is stale", () => {
    withTempDir((dir) => {
      const doc = join(dir, "install.md");
      const json = join(dir, "release.json");
      writeFileSync(doc, DOC);
      writeFileSync(json, JSON.stringify(release()));

      const stale = runCli(dir, ["--release", json, "--doc", doc, "--check"]);
      assert.equal(stale.status, 1);
      assert.match(stale.stderr, /不一致/);
      assert.equal(readFileSync(doc, "utf8"), DOC, "--check 不能改文件");
    });
  });

  it("explains itself with --help", () => {
    withTempDir((dir) => {
      const help = runCli(dir, ["--help"]);
      assert.equal(help.status, 0, help.stderr);
      assert.match(help.stdout, /--check/);
    });
  });
});
