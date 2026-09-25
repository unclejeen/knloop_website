"use client";

import { ButtonLink } from "@/components/button";
import { useLocale } from "@/i18n/locale";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-[min(100%-3rem,42rem)] py-16">
      <p className="mb-2 text-[0.8125rem] font-medium uppercase tracking-[0.04em] text-muted">404</p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">{t("notfound.title")}</h1>
      <p className="mb-6 text-muted">{t("notfound.body")}</p>
      <ButtonLink href="/">{t("notfound.back")}</ButtonLink>
    </main>
  );
}
