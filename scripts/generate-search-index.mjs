import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { docs, SECTION_LABELS } from "../src/lib/docs.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_ROOT = join(__dirname, "..", "articles");
const OUTPUT_PATH = join(__dirname, "..", "public", "search-index.json");

function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const entries = [];

  for (const doc of docs) {
    const relative = doc.sourcePath.replace(/^\/articles\//, "");
    const filePath = join(ARTICLES_ROOT, relative);
    const sectionEn = SECTION_LABELS[doc.section]?.en ?? doc.section;
    // English keywords (translated title + description) are appended to the
    // searchable content so English queries can hit Chinese-language articles.
    const enKeywords = [doc.titleEn, doc.descriptionEn].filter(Boolean).join("\n");
    try {
      const raw = await readFile(filePath, "utf8");
      const content = [stripMarkdown(raw), enKeywords].filter(Boolean).join("\n");
      entries.push({
        title: doc.title,
        titleEn: doc.titleEn,
        href: doc.path,
        section: doc.section,
        sectionEn,
        content,
      });
    } catch {
      entries.push({
        title: doc.title,
        titleEn: doc.titleEn,
        href: doc.path,
        section: doc.section,
        sectionEn,
        content: enKeywords,
      });
    }
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(entries), "utf8");
  console.log(`Generated search index with ${entries.length} entries → ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
