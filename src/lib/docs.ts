import type { Doc, DocsGroup } from "./types";

export const docs: Doc[] = [
  {
    slug: "install",
    title: "安装指南",
    titleEn: "Installation",
    description: "安装。",
    descriptionEn: "",
    path: "/install",
    sourcePath: "/articles/install.md",
    section: "学习",
  },
];

export const SECTION_LABELS: Record<string, { en: string }> = {
  学习: { en: "Learn" },
};

export function groupBySection(allDocs: Doc[]): DocsGroup[] {
  const groups: DocsGroup[] = [];
  const bySection = new Map<string, DocsGroup>();
  for (const doc of allDocs) {
    const section = doc.section ?? "";
    let group = bySection.get(section);
    if (!group) {
      group = { section, items: [] };
      bySection.set(section, group);
      groups.push(group);
    }
    group.items.push(doc);
  }
  return groups;
}

export function getAdjacentDocs(slug: string): { prev: Doc | null; next: Doc | null } {
  const index = docs.findIndex((doc) => doc.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? docs[index - 1] : null,
    next: index < docs.length - 1 ? docs[index + 1] : null,
  };
}

export function findDocBySlug(slug: string): Doc | undefined {
  return docs.find((doc) => doc.slug === slug);
}

export function findDocByPath(path: string): Doc | undefined {
  return docs.find((doc) => doc.path === path);
}

export function sectionLabel(section: string, locale: string): string {
  const labels = SECTION_LABELS[section];
  if (!labels) return section;
  return locale === "en" ? labels.en : section;
}
