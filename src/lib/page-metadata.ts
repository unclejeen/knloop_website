import type { Metadata } from "next";
import { PAGE_TITLES } from "./page-titles";
import { findDocByPath } from "./docs";

const SITE_NAME = "knloop";
const DESCRIPTION = "knloop 官网";

export function pageMetadata(slug: string): Metadata {
  const title = PAGE_TITLES[slug];
  if (title === undefined) return {};

  const displayTitle = title.replace(/\n/g, " ");
  const fullTitle = slug === "" ? `${SITE_NAME} | ${displayTitle}` : `${displayTitle} | ${SITE_NAME}`;
  const doc = slug ? findDocByPath(`/${slug}`) : null;
  const description = doc?.description ?? DESCRIPTION;

  return {
    title: slug === "" ? fullTitle : displayTitle,
    description,
    // llms.txt v2：文档页有对应的 Markdown 版本（public/{slug}.md，见
    // scripts/generate-llms-files.mjs），这里声明 <link rel="alternate" type="text/markdown">，
    // Agent 不用先读 llms.txt 也能发现它。
    alternates: doc ? { types: { "text/markdown": `${doc.path}.md` } } : undefined,
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: "https://knloop.ai",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}