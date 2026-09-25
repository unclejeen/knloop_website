"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SearchResult, SearchIndexEntry } from "@/lib/types";
import { useLocale } from "@/i18n/locale";

let indexCache: SearchIndexEntry[] | null = null;

async function loadSearchIndex(): Promise<SearchIndexEntry[]> {
  if (indexCache) return indexCache;
  const res = await fetch("/search-index.json");
  if (!res.ok) return [];
  indexCache = await res.json();
  return indexCache ?? [];
}

function searchIndex(index: SearchIndexEntry[], q: string, locale: "zh" | "en"): SearchResult[] {
  const terms = q.split(/\s+/).filter(Boolean).map((t) => t.toLowerCase());
  if (terms.length === 0) return [];

  return index
    .map((entry) => {
      // Search across both languages: zh title, en title, zh/en sections, and content.
      const titleLower = [entry.title, entry.titleEn ?? "", entry.section, entry.sectionEn ?? ""]
        .join("\n")
        .toLowerCase();
      const contentLower = entry.content.toLowerCase();

      const titleMatch = terms.every((t) => titleLower.includes(t));
      const contentMatch = terms.every((t) => contentLower.includes(t));

      if (!titleMatch && !contentMatch) return null;

      let snippet = "";
      if (contentMatch) {
        const firstTermIdx = Math.min(
          ...terms.map((t) => {
            const idx = contentLower.indexOf(t);
            return idx === -1 ? Infinity : idx;
          }),
        );
        if (firstTermIdx !== Infinity) {
          const start = Math.max(0, firstTermIdx - 40);
          const end = Math.min(entry.content.length, firstTermIdx + 120);
          snippet =
            (start > 0 ? "..." : "") +
            entry.content.slice(start, end).replace(/\n/g, " ") +
            (end < entry.content.length ? "..." : "");
        }
      }

      const displayTitle = locale === "en" ? (entry.titleEn ?? entry.title) : entry.title;

      return {
        title: displayTitle,
        href: entry.href,
        section: entry.section,
        snippet,
        score: titleMatch ? 2 : 1,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ score: _, ...rest }) => rest);
}

export function Search() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = setTimeout(async () => {
      try {
        const index = await loadSearchIndex();
        if (controller.signal.aborted) return;
        const found = searchIndex(index, q, locale);
        setResults(found);
      } catch {
        // aborted or network error
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, locale]);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].href);
    }
  }

  useEffect(() => {
    const active = listRef.current?.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const hasQuery = query.trim().length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-1.5 text-sm text-muted transition-colors hover:border-fg/25 hover:text-fg sm:flex"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        {t("search.button")}
        <kbd className="pointer-events-none ml-1 inline-flex items-center gap-0.5 rounded border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-muted">
          <span>&#8984;</span>K
        </kbd>
      </button>

      <button
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center text-muted transition-colors hover:text-fg sm:hidden"
        aria-label={t("search.button")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-lg">
          <DialogTitle className="sr-only">{t("search.button")}</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted hover:text-fg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>

          <div ref={listRef} className="max-h-[min(60vh,400px)] overflow-y-auto p-2">
            {loading && hasQuery ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
              </div>
            ) : hasQuery && results.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">{t("search.noResults")}</p>
            ) : !hasQuery ? (
              <p className="py-6 text-center text-sm text-muted">{t("search.hint")}</p>
            ) : (
              results.map((item, i) => (
                <button
                  key={item.href}
                  data-active={i === activeIndex}
                  onClick={() => navigate(item.href)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left transition-colors",
                    i === activeIndex ? "bg-surface-muted text-fg" : "text-fg",
                  )}
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.snippet && (
                    <span className="line-clamp-2 text-xs leading-relaxed text-muted">{item.snippet}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}