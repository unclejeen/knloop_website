/**
 * 首页截图的守门测试：清单、产物、组件三边对得上，而且体积不反弹。
 *
 * 这些图以前是 1.3 MB / 11 MP 的原始截图直接挂 <img>（还会被 React 自动预载），
 * 所以这里除了对账，还钉住了每档体积上限：换图/换编码参数把体积顶上去了，
 * 或者有人把 lazy / srcSet 拆了，测试先红。
 */
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

import { MASTER_DIR, SHOTS } from "../../scripts/home-shots-plan.mjs";

const root = resolve(import.meta.dirname, "../..");
const manifest = JSON.parse(await readFile(join(root, "src/lib/home-shot-images.json"), "utf8"));
const component = await readFile(join(root, "src/components/home-shots.tsx"), "utf8");
const registry = await readFile(join(root, "src/lib/home-shots.ts"), "utf8");

/** 单档上限（当前最大的一档 editor@1263 是 64.4 KB / 76.9 KB）。 */
const MAX_VARIANT_BYTES = { avif: 80 * 1024, webp: 100 * 1024 };
/** 一屏（每张图只取最宽那档、AVIF）的合计上限，当前约 200 KB。 */
const MAX_WIDEST_AVIF_TOTAL = 260 * 1024;

const fileSize = (url) => stat(join(root, "public", url)).then((s) => s.size);

describe("home shot assets", () => {
  it("registers every shot in the plan, in order", () => {
    assert.deepEqual(Object.keys(manifest.shots), SHOTS.map((shot) => shot.id));
  });

  it("keeps the component ids and the plan in sync", () => {
    const ids = [...registry.matchAll(/id: "([a-z]+)", window:/g)].map((match) => match[1]);
    assert.deepEqual(ids, SHOTS.map((shot) => shot.id));
  });

  it("generates ascending width variants, never upscaled", () => {
    for (const shot of SHOTS) {
      const { width, variants } = manifest.shots[shot.id];
      assert.ok(variants.length > 0, shot.id + " 没有产物");
      const widths = variants.map((variant) => variant.width);
      assert.deepEqual(widths, [...widths].sort((a, b) => a - b), shot.id + " 的档位没按宽度排序");
      assert.equal(new Set(widths).size, widths.length, shot.id + " 有重复档位");
      assert.ok(widths.every((w) => w <= width), shot.id + " 把图放大了（最大档超过了原图宽度）");
      assert.ok(widths.every((w) => w <= 1664), shot.id + " 出现了用不上的超大档");
    }
  });

  it("ships every variant, with the manifest's byte counts", async () => {
    for (const shot of SHOTS) {
      for (const variant of manifest.shots[shot.id].variants) {
        for (const format of ["avif", "webp"]) {
          const size = await fileSize(variant[format]);
          assert.ok(size > 0, variant[format] + " 是空文件");
          assert.equal(size, variant[format + "Bytes"], variant[format] + " 的字节数和清单对不上");
        }
      }
    }
  });

  it("keeps each variant inside its budget", async () => {
    for (const shot of SHOTS) {
      for (const variant of manifest.shots[shot.id].variants) {
        for (const format of ["avif", "webp"]) {
          assert.ok(
            (await fileSize(variant[format])) <= MAX_VARIANT_BYTES[format],
            `${variant[format]} 超过 ${MAX_VARIANT_BYTES[format] / 1024} KB`,
          );
        }
      }
    }
  });

  it("keeps a full scroll-through within budget", async () => {
    let total = 0;
    for (const shot of SHOTS) {
      const variants = manifest.shots[shot.id].variants;
      total += await fileSize(variants[variants.length - 1].avif);
    }
    assert.ok(total <= MAX_WIDEST_AVIF_TOTAL, `最宽档 AVIF 合计 ${(total / 1024).toFixed(0)} KB 超标`);
  });

  it("never publishes the masters", async () => {
    for (const shot of SHOTS) {
      for (const dir of [MASTER_DIR, "public/home"]) {
        const path = join(root, dir, shot.master);
        if (dir === MASTER_DIR) await stat(path);
        else
          await assert.rejects(stat(path), undefined, shot.master + " 不该出现在 public/home 里（原图会被整张下载）");
      }
    }
  });

  it("lazy-loads the shots through <picture>", () => {
    assert.match(component, /<picture/);
    assert.match(component, /loading="lazy"/);
    assert.match(component, /type="image\/avif"/);
    assert.match(component, /srcSet=/);
  });
});
