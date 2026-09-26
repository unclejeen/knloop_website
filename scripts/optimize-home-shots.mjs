/**
 * 首页截图 → 响应式 AVIF / WebP（内容哈希命名）。
 *
 *   node scripts/optimize-home-shots.mjs
 *
 * 为什么要这一步：assets/home-shots 下的原图是 1.3 MB 的截图，其中两张宽到
 * 4480 px（11 MP），而页面上这些图最宽只显示 832 px（2x 屏 1664 px）。
 * 原图直接放 public 里，浏览器会按原始尺寸整张下载。这里按
 * scripts/home-shots-plan.mjs 里的宽度档压成 AVIF + WebP 两种格式，
 * 文件名带上内容哈希，于是 public/home 下的产物可以放心用一年不可变缓存
 * （见 public/_headers）。
 *
 * 产物提交进仓库，构建和部署都不需要 ffmpeg（和 display-cjk.woff2 一个路子）；
 * 只有换图/换宽度档/换编码参数时才需要在本机跑这个脚本。需要 ffmpeg
 * （PATH 里，或用 FFMPEG 环境变量指到可执行文件）。
 *
 * 幂等：同名同内容的文件不重写；public/home 下没有出现在清单里的旧文件会删掉。
 */
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { MASTER_DIR, SHOTS, TARGET_WIDTHS } from "./home-shots-plan.mjs";

const OUT_DIR = "public/home";
const MANIFEST_PATH = "src/lib/home-shot-images.json";
const FFMPEG = process.env.FFMPEG || "ffmpeg";

/**
 * 编码参数：CRF/质量是在 832 和原图宽度下逐档比过画质和体积之后定的
 * （UI 截图，字多，压太狠会糊）。改这两个值等于改所有产物的哈希，
 * 下次跑会整批重编码。
 */
const CODECS = [
  {
    ext: "avif",
    args: ["-c:v", "libsvtav1", "-crf", "32", "-preset", "6", "-pix_fmt", "yuv420p"],
  },
  {
    ext: "webp",
    args: ["-c:v", "libwebp", "-quality", "82", "-preset", "picture", "-compression_level", "6"],
  },
];

/** 读原图尺寸：只认这几种（截图也就这几种），够用了。 */
function readImageSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  const riff = buf.toString("ascii", 0, 4);
  const fourcc = buf.toString("ascii", 8, 12);
  if (riff === "RIFF" && fourcc === "WEBP") {
    const type = buf.toString("ascii", 12, 16);
    if (type === "VP8X") {
      return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    }
    if (type === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (type === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    throw new Error(`${file}: 认不出的 WebP 内部格式 ${type}`);
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off < buf.length - 8) {
      if (buf[off] !== 0xff) { off++; continue; }
      const marker = buf[off + 1];
      const size = buf.readUInt16BE(off + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(off + 7), height: buf.readUInt16BE(off + 5) };
      }
      off += 2 + size;
    }
  }
  throw new Error(`${file}: 只支持 PNG / WebP / JPEG`);
}

/** 原图宽度不够 1664 时，用原图本身当最大档：再放大是白花时间，缩到 832 又糊。 */
function widthsFor(nativeWidth) {
  const widths = TARGET_WIDTHS.filter((w) => w <= nativeWidth);
  const widest = TARGET_WIDTHS[TARGET_WIDTHS.length - 1];
  if (nativeWidth <= widest && !widths.includes(nativeWidth)) widths.push(nativeWidth);
  if (widths.length === 0) widths.push(nativeWidth);
  return [...new Set(widths)].sort((a, b) => a - b);
}

function encode({ master, width, codec, tmp }) {
  const args = [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", master,
    "-vf", `scale=${width}:-2:flags=lanczos`,
    "-frames:v", "1",
    ...codec.args,
    tmp,
  ];
  // stdio 全 inherit：Windows 上受限沙箱里 node 用管道起子进程会 EPERM，inherit 不受影响。
  // SVT_LOG=1：libsvtav1 自己往 stderr 打一堆 info，级别降到只报错。
  const result = spawnSync(FFMPEG, args, {
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, SVT_LOG: "1" },
  });
  if (result.error) {
    throw new Error(`没跑起来 ${FFMPEG}：${result.error.message}（可用 FFMPEG 环境变量指定路径）`);
  }
  if (result.status !== 0 || !fs.existsSync(tmp)) {
    throw new Error(`ffmpeg 编码失败（exit ${result.status}）：${FFMPEG} ${args.join(" ")}`);
  }
}

function main() {
  const force = process.argv.includes("--force");
  const probe = spawnSync(FFMPEG, ["-hide_banner", "-version"], { stdio: ["ignore", "ignore", "inherit"] });
  if (probe.error || probe.status !== 0) {
    throw new Error(`找不到 ${FFMPEG}，装一个或者用 FFMPEG=<路径> 指过来`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });

  const manifest = { generator: "scripts/optimize-home-shots.mjs", shots: {} };
  const keep = new Set();
  const rows = [];
  let masterBytes = 0;
  let generatedBytes = 0;

  for (const shot of SHOTS) {
    const master = path.join(MASTER_DIR, shot.master);
    if (!fs.existsSync(master)) throw new Error(`缺少原图：${master}`);

    const native = readImageSize(master);
    const masterSize = fs.statSync(master).size;
    masterBytes += masterSize;
    const variants = [];

    for (const width of widthsFor(native.width)) {
      const variant = { width: 0, height: 0 };
      for (const codec of CODECS) {
        const tmp = path.join(OUT_DIR, `.tmp-${shot.id}.${width}.${codec.ext}`);
        encode({ master: master, width, codec, tmp });

        const bytes = fs.readFileSync(tmp);
        const hash = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 8);
        const name = `${shot.id}.${hash}.${width}.${codec.ext}`;
        const dest = path.join(OUT_DIR, name);
        const url = `/home/${name}`;
        keep.add(name);

        if (!force && fs.existsSync(dest) && fs.readFileSync(dest).equals(bytes)) {
          fs.rmSync(tmp);
        } else {
          fs.renameSync(tmp, dest);
        }

        const size = fs.statSync(dest).size;
        generatedBytes += size;
        variant[codec.ext] = url;
        variant[codec.ext + "Bytes"] = size;
        if (codec.ext === "webp") {
          // 尺寸从 WebP 头里读：两种格式过的是同一个 scale，像素尺寸一致。
          const dims = readImageSize(dest);
          variant.width = dims.width;
          variant.height = dims.height;
        }
      }
      if (!variant.width) throw new Error(`${shot.id} ${width}w：没拿到产物尺寸`);
      rows.push({ id: shot.id, ...variant });
      variants.push(variant);
    }

    manifest.shots[shot.id] = {
      master: shot.master,
      width: native.width,
      height: native.height,
      variants,
    };
  }

  // 清掉不在清单里的旧产物（换宽度档/换参数之后会留下孤儿文件）
  const removed = [];
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (name.startsWith(".tmp-")) {
      fs.rmSync(path.join(OUT_DIR, name), { force: true });
      continue;
    }
    if (!keep.has(name)) {
      fs.rmSync(path.join(OUT_DIR, name));
      removed.push(name);
    }
  }
  if (removed.length > 0) console.log(`清理旧产物 ${removed.length} 个：${removed.join(", ")}`);

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`
${MANIFEST_PATH} 已更新`);

  // 体积账：原图 vs 各档产物
  console.log(`
${"图片".padEnd(20)}${"档位".padEnd(8)}${"AVIF".padStart(10)}${"WebP".padStart(10)}`);
  for (const row of rows) {
    const owner = SHOTS.find((s) => s.id === row.id);
    console.log(
      `${(owner.id + " · " + owner.master).padEnd(20)}${(row.width + "w").padEnd(8)}` +
      `${((row.avifBytes / 1024).toFixed(1) + " KB").padStart(10)}${((row.webpBytes / 1024).toFixed(1) + " KB").padStart(10)}`,
    );
  }
  const avifTotal = rows.reduce((sum, r) => sum + r.avifBytes, 0);
  const webpTotal = rows.reduce((sum, r) => sum + r.webpBytes, 0);
  console.log(
    `
原图合计 ${(masterBytes / 1024).toFixed(0)} KB；` +
    `产物 AVIF 合计 ${(avifTotal / 1024).toFixed(0)} KB、WebP 合计 ${(webpTotal / 1024).toFixed(0)} KB（${rows.length} 档 × 2 格式）`,
  );
}

main();
