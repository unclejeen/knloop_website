/**
 * 下半部分「一个标题 + 一张图」区块的截图清单。
 *
 * 图片放到 public/home/ 下，把路径填进 src（例如 "/home/local.png"）；
 * 留空就渲染成占位框，先对版式。
 * 顺序、增删都改这个数组；每个 id 对应的标题/说明在 i18n 的 home.sections 里。
 *
 * frame: true  套窗口外框（三个圆点 + 标题栏 + 描边），图区默认 16:10；
 *        false 光图一张（圆角 + 图自己的比例）。
 *        套框时 fit "contain" 整图完整、"cover" 铺满但会裁边。
 * aspect: 套框时图区的宽高比（形如 "4480 / 2232"）。给成和图片一致就没有上下留白；
 *         不给就用默认 16:10（多块并排时高度统一）。
 * ratio:  不套框的 SVG 用它撑开高度（<object> 没有内在尺寸）。
 */
export type HomeShotId = "local" | "agents" | "mcp" | "git" | "editor" | "start";

export type HomeShot = {
  id: HomeShotId;
  window: string;
  src: string;
  frame: boolean;
  fit: "contain" | "cover";
  aspect?: string;
  ratio?: string;
};

export const HOME_SHOTS: readonly HomeShot[] = [
  { id: "local", window: "vault · markdown", src: "/home/markdown.png", frame: true, fit: "contain" },
  // 对话框截图，保留外框；图区和图片自身比例一致（1210 × 870）
  { id: "agents", window: "agents", src: "/home/ai.png", frame: true, fit: "contain", aspect: "1210 / 870" },
  // mcp 同样按图片自身比例走，图区高度和图片一致
  { id: "mcp", window: "mcp", src: "/home/knloop-mcp.webp", frame: true, fit: "contain", aspect: "4358 / 2568" },
  // git 这张是 2:1 的宽图，图区按它自己的比例走，避免 16:10 框里上下大片留白
  { id: "git", window: "git", src: "/home/knloop-git.webp", frame: true, fit: "contain", aspect: "4480 / 2232" },
  { id: "editor", window: "editor", src: "/home/rwa.png", frame: true, fit: "contain", aspect: "1263 / 1013" },
  { id: "start", window: "quick start", src: "/home/k.png", frame: true, fit: "contain", aspect: "1539 / 1040" },
];
