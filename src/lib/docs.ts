import type { Doc, DocsGroup } from "./types";

// 文档是手工登记的：articles/ 下的文件名不会自动变成路由，
// 新加一篇文章要在下面加一条，slug / path 用小写（静态站路由区分大小写）。
export const docs: Doc[] = [
  {
    slug: "install",
    title: "安装指南",
    titleEn: "Installation",
    description: "安装。",
    descriptionEn: "",
    path: "/install",
    sourcePath: "/articles/install.md",
    section: "快速开始",
  },
  {
    slug: "feedback",
    title: "问题反馈",
    titleEn: "Feedback",
    description: "反馈使用中遇到的问题和建议。",
    descriptionEn: "Report problems and share feedback.",
    path: "/feedback",
    sourcePath: "/articles/Feedback.md",
    section: "反馈",
  },
  {
    slug: "privacy",
    title: "隐私政策",
    titleEn: "Privacy Policy",
    description: "knloop 如何处理你的数据：笔记只存本地，内容不被收集。",
    descriptionEn: "How knloop handles your data: notes stay on your device, content is never collected.",
    path: "/privacy",
    sourcePath: "/articles/privacy.md",
    section: "法律",
  },
];

export const SECTION_LABELS: Record<string, { en: string }> = {
  快速开始: { en: "Quick start" },
  反馈: { en: "Feedback" },
  法律: { en: "Legal" },
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
