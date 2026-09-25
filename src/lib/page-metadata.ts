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