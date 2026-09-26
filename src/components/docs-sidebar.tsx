"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDownIcon, HamburgerIcon } from "@/components/icons";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { sectionLabel } from "@/lib/docs";
import type { DocsGroup } from "@/lib/types";
import { useLocale } from "@/i18n/locale";

type SidebarNavProps = {
  groups: DocsGroup[];
  activeSlug: string;
  onNavigate?: () => void;
};

function SidebarNav({ groups, activeSlug, onNavigate }: SidebarNavProps) {
  const { locale, t } = useLocale();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(section: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  return (
    <nav className="px-3 py-4">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.section);
        return (
          <div key={group.section} className="mb-4">
            <button
              type="button"
              aria-expanded={!isCollapsed}
              onClick={() => toggle(group.section)}
              className="flex w-full cursor-pointer items-center justify-between rounded bg-transparent px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted transition hover:text-fg"
            >
              {/* 显示名按语言取（快速开始 / Quick start），折叠状态仍用原始 section */}
              <span>{sectionLabel(group.section, locale)}</span>
              <ChevronDownIcon className={`shrink-0 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-200 ${
                isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
              }`}
            >
              <div className="overflow-hidden">
                {group.items.map((item) => {
                  const active = item.slug === activeSlug;
                  return (
                    <Link
                      key={item.slug}
                      href={item.path}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={`block rounded px-3 py-[0.1875rem] text-[0.8125rem] leading-[1.8] no-underline transition hover:text-fg ${
                        active ? "font-medium text-fg" : "text-muted"
                      }`}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

type DocsSidebarShellProps = {
  groups: DocsGroup[];
  activeSlug: string;
  currentTitle?: string;
};

export function DocsSidebarShell({ groups, activeSlug, currentTitle }: DocsSidebarShellProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label={t("sidebar.open")}
          className="sticky top-14 z-40 flex w-full items-center justify-between border-b border-border bg-bg/80 px-6 py-3 backdrop-blur-sm focus:outline-none md:hidden"
        >
          <span className="text-sm font-medium text-fg">{currentTitle ?? t("nav.docs")}</span>
          <span className="flex h-8 w-8 items-center justify-center text-muted">
            <HamburgerIcon className="h-4 w-4" />
          </span>
        </SheetTrigger>
        <SheetContent side="left" className="overflow-y-auto p-0" showCloseButton={false}>
          <SheetTitle className="px-6 pt-6">{t("sidebar.title")}</SheetTitle>
          <SidebarNav groups={groups} activeSlug={activeSlug} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside
        aria-label={t("sidebar.aria")}
        className="hidden md:sticky md:top-0 md:block md:h-screen md:w-60 md:overflow-y-auto"
      >
        <SidebarNav groups={groups} activeSlug={activeSlug} />
      </aside>
    </>
  );
}