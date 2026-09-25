"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale";
import { sectionLabel } from "@/lib/docs";

export function DocsHeader({
  section,
  title,
  description,
}: {
  section?: string;
  title: string;
  description: string;
}) {
  const { locale, t } = useLocale();

  return (
    <header className="mb-8 border-b border-border pb-6">
      <p className="mb-2 text-[0.8125rem] font-medium tracking-wide text-muted">
        {section ? sectionLabel(section, locale) : t("docs.fallback")}
      </p>
      <h1 className="m-0 text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.04em]">
        {title}
      </h1>
      <p className="m-0 mt-3 max-w-[42rem] leading-[1.7] text-muted">{description}</p>
    </header>
  );
}

type PagerItem = { title: string; path: string } | null;

export function PagerNav({ prev, next }: { prev: PagerItem; next: PagerItem }) {
  const { t } = useLocale();

  return (
    <nav aria-label="Pagination" className="mt-16 grid grid-cols-1 gap-4 border-t border-border pt-8 md:grid-cols-2">
      {prev ? (
        <Link
          href={prev.path}
          className="flex flex-col gap-1 rounded-lg border border-border p-4 no-underline transition hover:border-muted"
        >
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{t("pager.prev")}</span>
          <span className="text-[0.9375rem] font-semibold text-blue">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.path}
          className="flex flex-col items-end gap-1 rounded-lg border border-border p-4 text-right no-underline transition hover:border-muted"
        >
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-muted">{t("pager.next")}</span>
          <span className="text-[0.9375rem] font-semibold text-blue">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
