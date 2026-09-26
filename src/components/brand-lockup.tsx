import { cn } from "@/lib/utils";

/**
 * 品牌组合：logo mark + knloop 字标。
 *
 * 头部（sm）和首页文案区（lg）共用同一份，免得两处各写一遍再走样。
 * mark 是 knloop-logo.svg（黑色），深色下靠 theme-adapt-invert 反白；
 * 字标用站点的 Geist（font-sans 默认），不再用像素字体。
 */
const SIZES = {
  sm: { mark: "h-4", word: "text-lg", gap: "gap-2" },
  lg: { mark: "h-5", word: "text-2xl", gap: "gap-4" },
} as const;

export function BrandLockup({
  size = "sm",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const scale = SIZES[size];

  return (
    <span className={cn("inline-flex items-center select-none", scale.gap, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/knloop-logo.svg"
        alt=""
        draggable={false}
        className={cn("theme-adapt-invert w-auto shrink-0", scale.mark)}
      />
      <span className={cn("font-semibold tracking-tight", scale.word)}>knloop</span>
    </span>
  );
}
