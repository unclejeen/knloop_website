"use client";

import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { useHomeMessages } from "@/i18n/locale";

/** 备案号：中国大陆站点要求展示，按惯例链到工信部备案系统。 */
const ICP = "粤ICP备2024284751号-1";
const ICP_URL = "https://beian.miit.gov.cn/";

/**
 * 页脚：左边品牌组合 + tagline，右边版权与备案号；
 * 窄屏整块居中堆叠。
 */
export function HomeFooter() {
  const { footer } = useHomeMessages();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-[min(100%-3rem,var(--container-content))] flex-col items-center gap-8 py-12 text-center md:flex-row md:items-start md:justify-between md:text-left">
        {/* 左：品牌 + 一句话 */}
        <div className="flex flex-col items-center gap-3 md:items-start">
          <BrandLockup />
          <p className="max-w-[26rem] text-pretty text-[0.8125rem] leading-relaxed text-muted">
            {footer.tagline}
          </p>
        </div>

        {/* 右：版权 + 备案 */}
        <div className="flex flex-col items-center gap-1.5 text-[0.75rem] text-muted md:items-end md:text-right">
          {/* 隐私政策入口：备案与合规信息的常规落点，放在版权行上方。 */}
          <Link
            href="/privacy"
            className="no-underline transition-colors hover:text-fg"
          >
            {footer.privacy}
          </Link>
          <p className="m-0">Copyright © {year} knloop. All Rights Reserved.</p>
          <a
            href={ICP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline transition-colors hover:text-fg"
          >
            {ICP}
          </a>
        </div>
      </div>
    </footer>
  );
}
