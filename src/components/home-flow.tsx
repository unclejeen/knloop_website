"use client";

import { ArrowRightIcon } from "@/components/icons";
import { HomeSection } from "@/components/home-section";
import { useHomeMessages } from "@/i18n/locale";

/**
 * 四步流程（照抄 zerolang 的 ArchitectureDiagram）：
 * 发丝线网格，每格「序号 + 大写标签 + 标题 + 说明」，格与格之间一条带箭头的连接点；
 * 图下面挂 hero 里那句小字（i18n 的 home.hero.note）。
 */
export function HomeFlow() {
  const { flow, hero } = useHomeMessages();

  return (
    <HomeSection>
      <div className="reveal grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {flow.map((step, index) => (
          <div
            key={step.title}
            className="group relative flex flex-col bg-bg p-7 transition-colors duration-200 hover:bg-surface-muted"
          >
            <div className="mb-7 flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border font-mono text-[0.6875rem] tabular-nums text-muted transition-colors group-hover:border-fg/40 group-hover:text-fg">
                {index + 1}
              </span>
              <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
                {step.label}
              </span>
            </div>
            <h2 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em]">{step.title}</h2>
            <p className="mt-2.5 whitespace-pre-line text-[0.8125rem] leading-[1.65] text-muted">{step.body}</p>

            {/* 格与格之间的箭头（只在四列时出现，最后一格不画） */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-[calc(50%+1px)] lg:flex"
            >
              {index < flow.length - 1 ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg text-muted">
                  <ArrowRightIcon width={12} height={12} />
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>

      <p className="reveal mt-5 max-w-[34rem] text-[0.8125rem] leading-relaxed text-muted">{hero.note}</p>
    </HomeSection>
  );
}
