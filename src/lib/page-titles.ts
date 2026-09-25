import { docs } from "./docs";

const DOCS_TITLES: Record<string, string> = Object.fromEntries(
  docs.map((doc) => [doc.path.replace(/^\//, ""), doc.title]),
);

export const PAGE_TITLES: Record<string, string> = {
  "": "Agent 优先的语言实验",
  ...DOCS_TITLES,
};

export function getPageTitle(slug: string): string | null {
  return slug in PAGE_TITLES ? PAGE_TITLES[slug] : null;
}
