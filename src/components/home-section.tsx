import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 首页区块容器（照抄 zerolang docs 的 Section）：
 * 宽 min(页面宽 - 3rem, 内容宽度 72rem) 居中，一条上边框分开，上下留白 clamp 跟视口走。
 * 首屏文案块不要分隔线和留白，靠 className 覆盖。
 */
export function HomeSection({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative z-10 mx-auto w-[min(100%-3rem,var(--container-content))] border-t border-border py-[clamp(5rem,11vh,8rem)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** 区块抬头：标题 + 说明整体居中（下面的图也居中，见 home-shots.tsx）。 */
export function HomeSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto mb-12 max-w-[44rem] text-center">
      {/* 字号明显压在首页 hero 标题（60px）之下：最大 2.25rem = 36px；字重由 .display-title 统一给 */}
      <h2 className="display-title text-[clamp(1.25rem,2.5vw,2.25rem)] leading-[1.2]">{title}</h2>
      <p className="mx-auto mt-6 max-w-[34rem] text-pretty text-[1.0625rem] leading-[1.65] text-muted">{description}</p>
    </div>
  );
}
