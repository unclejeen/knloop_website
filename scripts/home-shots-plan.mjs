/**
 * 首页截图的清单：生成脚本和测试共用，避免两边各写一份对不上。
 *
 * id 必须和 src/lib/home-shots.ts 里的区块 id 一致（用哪个 id 就取哪张原图），
 * 测试会校验这一点。加图/换图的流程：
 *   1. 原图丢进 assets/home-shots/（不放 public，别把 11 MP 截图发到线上）
 *   2. 在这里登记
 *   3. node scripts/optimize-home-shots.mjs
 */
export const MASTER_DIR = "assets/home-shots";

/**
 * 要生成几档宽度。
 *
 * 页面里这些图的显示宽度上限是 52rem = 832 px（home-shots.tsx 的 max-w-[52rem]），
 * 所以 1x 屏最多要 832，2x 屏最多要 1664；480 给手机。
 * 比原图还大的档不会生成（不放大），原图本身在 832~1664 之间时会补一档原图宽度。
 */
export const TARGET_WIDTHS = [480, 832, 1664];

export const SHOTS = [
  { id: "local", master: "markdown.png" },
  { id: "agents", master: "ai.png" },
  { id: "mcp", master: "knloop-mcp.webp" },
  { id: "git", master: "knloop-git.webp" },
  { id: "editor", master: "rwa.png" },
  { id: "start", master: "k.png" },
];
