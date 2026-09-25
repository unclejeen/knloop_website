"use client";

import { useLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/dictionaries";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const next: Locale = locale === "zh" ? "en" : "zh";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
      title={locale === "zh" ? "Switch to English" : "切换到中文"}
      className="flex h-8 cursor-pointer items-center rounded-md border border-border px-2 font-mono text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      {locale === "zh" ? "EN" : "中"}
    </button>
  );
}
