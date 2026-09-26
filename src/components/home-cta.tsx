"use client";

import { ArrowRightIcon } from "@/components/icons";
import { ButtonLink } from "@/components/button";
import { DownloadButton } from "@/components/download-button";
import { useHomeMessages } from "@/i18n/locale";

/** 收尾（照抄 zerolang 的 CTA 段）：居中大标题 + 说明 + 按钮组。 */
export function HomeCta() {
  const { cta } = useHomeMessages();

  return (
    <section className="relative z-10 border-t border-border">
      <div className="mx-auto flex w-[min(100%-3rem,var(--container-content))] flex-col items-center py-[clamp(6rem,14vh,9rem)] text-center">
        <h2 className="display-title text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.2]">{cta.title}</h2>
        <p className="mt-6 max-w-[38rem] text-pretty text-[1.0625rem] leading-[1.6] text-muted">{cta.body}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <DownloadButton />
          <ButtonLink href="/install" variant="default" size="lg">
            {cta.button}
            <ArrowRightIcon />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
