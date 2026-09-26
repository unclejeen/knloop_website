/**
 * 下半部分「一个标题 + 一张图」区块的截图清单。
 *
 * 原图放在 assets/home-shots/（不进 public：11 MP 的截图原样上线没人受得了），
 * 页面用的一律是 scripts/optimize-home-shots.mjs 压出来的响应式 AVIF/WebP，
 * 清单在 home-shot-images.json（生成产物，别手改）。
 * 顺序、增删都改这个数组；每个 id 对应的标题/说明在 i18n 的 home.sections 里。
 *
 * frame: true  套窗口外框（三个圆点 + 标题栏 + 描边），图区默认 16:10；
 *        false 光图一张（圆角 + 图自己的比例）。
 *        套框时 fit "contain" 整图完整、"cover" 铺满但会裁边。
 * aspect: 套框时图区的宽高比（形如 "4480 / 2232"）。给成和原图一致就没有上下留白；
 *         不给就用默认 16:10（多块并排时高度统一）。
 */
import manifest from "./home-shot-images.json";

export type HomeShotId = "local" | "agents" | "mcp" | "git" | "editor" | "start";

/** 一档宽度、两种格式：AVIF 优先，WebP 兜底（两种格式像素尺寸一致）。 */
export type HomeShotVariant = {
  width: number;
  height: number;
  avif: string;
  webp: string;
};

export type HomeShot = {
  id: HomeShotId;
  window: string;
  frame: boolean;
  fit: "contain" | "cover";
  aspect?: string;
  /** 原图像素尺寸（用来给 <img> 的 width/height，图片进来前不抖） */
  source?: { width: number; height: number };
  /** 由窄到宽排好序（生成脚本保证）；空数组 = 图还没生成，渲染占位框 */
  variants: readonly HomeShotVariant[];
};

type ShotMeta = Omit<HomeShot, "source" | "variants">;

/** 生成产物：scripts/optimize-home-shots.mjs 按 scripts/home-shots-plan.mjs 写的。 */
const ASSETS: Partial<Record<HomeShotId, { width: number; height: number; variants: readonly HomeShotVariant[] }>> =
  manifest.shots;

const META: readonly ShotMeta[] = [
  { id: "local", window: "vault · markdown", frame: true, fit: "contain" },
  // 对话框截图，保留外框；图区和图片自身比例一致（1210 × 870）
  { id: "agents", window: "agents", frame: true, fit: "contain", aspect: "1210 / 870" },
  // mcp 同样按图片自身比例走，图区高度和图片一致
  { id: "mcp", window: "mcp", frame: true, fit: "contain", aspect: "4358 / 2568" },
  // git 这张是 2:1 的宽图，图区按它自己的比例走，避免 16:10 框里上下大片留白
  { id: "git", window: "git", frame: true, fit: "contain", aspect: "4480 / 2232" },
  { id: "editor", window: "editor", frame: true, fit: "contain", aspect: "1263 / 1013" },
  { id: "start", window: "quick start", frame: true, fit: "contain", aspect: "1539 / 1040" },
];

export const HOME_SHOTS: readonly HomeShot[] = META.map((meta) => {
  const asset = ASSETS[meta.id];
  return {
    ...meta,
    source: asset ? { width: asset.width, height: asset.height } : undefined,
    variants: asset?.variants ?? [],
  };
});
