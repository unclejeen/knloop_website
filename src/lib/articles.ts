import { readFile } from "node:fs/promises";
import { join } from "node:path";
import GithubSlugger from "github-slugger";
import { docs, findDocBySlug } from "./docs";
import type { Article, Heading } from "./types";

const ARTICLES_ROOT = join(process.cwd(), "articles");

export async function readArticleBySlug(slug: string): Promise<string | null> {
  const doc = findDocBySlug(slug);
  if (!doc) return null;
  const relative = doc.sourcePath.replace(/^\/articles\//, "");
  const filePath = join(ARTICLES_ROOT, relative);
  return readFile(filePath, "utf8");
}

export async function readArticleByPath(routePath: string): Promise<Article | null> {
  const doc = docs.find((d) => d.path === routePath);
  if (!doc) return null;
  const source = await readArticleBySlug(doc.slug);
  if (source === null) return null;
  return { doc, source };
}

export function extractHeadings(markdown: string): Heading[] {
  // 与正文 rehype-slug（github-slugger）保持一致的 id 规则：按文档顺序、支持中文、自动去重。
  const slugger = new GithubSlugger();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const headings: Heading[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{1,4})\s+(.+)$/.exec(line.trim());
    if (match) {
      const text = match[2].replace(/`([^`]+)`/g, "$1");
      const id = slugger.slug(text);
      // 目录只收录 h2-h4；h1 也需参与占位，保证与 rehype-slug 的去重序号一致。
      if (match[1].length >= 2) {
        headings.push({
          level: match[1].length as Heading["level"],
          text,
          id,
        });
      }
    }
  }
  return headings;
}
