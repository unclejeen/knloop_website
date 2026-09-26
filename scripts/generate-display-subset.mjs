/**
 * 重新生成「展示级标题」的中文子集字体（思源黑体 / Noto Sans SC，SIL OFL-1.1）。
 *
 * 覆盖首页所有用 .display-title / .home-hero-title 的标题文案：
 *   home.hero.title、home.cta.title、home.sections.*.title
 * 改动这些文案（新增汉字）后跑一次：
 *
 *   node scripts/generate-display-subset.mjs
 *
 * 它把这些标题里的非 ASCII 字符收集起来，向 Google Fonts 的 CSS2 接口要一份
 * `text=` 子集（同一套思源黑体，按字裁切），存到 src/app/fonts/。
 * 产物提交进仓库，构建/部署不需要联网；
 * 子集里没有的字会按字栈回退到本机黑体，不会变豆腐块。
 */
import fs from "node:fs";
import path from "node:path";

const OUT = "src/app/fonts/display-cjk.woff2";
/** 展示级标题统一用 500（.home-hero-title / .display-title 都写死这个字重）。 */
const WEIGHT = "500";
/** 思源黑体；要换字体只改这一行，再跑一次脚本即可。 */
const FAMILY = "Noto Sans SC";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const texts = ["zh", "en"].flatMap((locale) => {
  const messages = JSON.parse(fs.readFileSync(`src/i18n/messages/${locale}.json`, "utf8"));
  const home = messages.home;
  return [home.hero.title, home.cta.title, ...Object.values(home.sections).map((section) => section.title)];
});

const chars = [...new Set(texts.join("").split(""))]
  .filter((char) => (char.codePointAt(0) ?? 0) > 0x7f)
  .sort();

if (chars.length === 0) {
  console.error("标题里没有非 ASCII 字符，不需要子集字体。");
  process.exit(1);
}

// 注意：字重必须写在 family 里（family=Noto+Sans+SC:wght@500），
// 写成 `&wght@500` 这种独立参数 Google 会忽略、直接给 400。
const url =
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FAMILY).replace(/%20/g, "+")}:wght@${WEIGHT}` +
  `&text=${encodeURIComponent(chars.join(""))}&display=swap`;

const css = await fetch(url, { headers: { "User-Agent": UA } }).then((r) => {
  if (!r.ok) throw new Error(`Google Fonts 返回 ${r.status}`);
  return r.text();
});

console.log("返回的 @font-face 字重:", (css.match(/font-weight:\s*([^;]+);/) ?? [])[1] ?? "(未声明)");

const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/);
if (!match) throw new Error(`没解析出 woff2 地址：\n${css}`);

const font = Buffer.from(await fetch(match[1], { headers: { "User-Agent": UA } }).then((r) => r.arrayBuffer()));
if (font.subarray(0, 4).toString("ascii") !== "wOF2") throw new Error("下载到的不是 woff2");

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, font);
console.log(`${OUT}: ${(font.length / 1024).toFixed(1)} KB，覆盖 ${chars.length} 个汉字 → ${chars.join("")}`);
