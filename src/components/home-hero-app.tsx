import type { ReactNode } from "react";
import {
  ArrowLeftRightIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  CodeXmlIcon,
  EllipsisIcon,
  FileChartPieIcon,
  FileIcon,
  FolderCodeIcon,
  FolderIcon,
  GitBranchIcon,
  GitCommitHorizontalIcon,
  GitCommitVerticalIcon,
  InboxIcon,
  InfoIcon,
  ListIcon,
  MoonIcon,
  PanelLeftIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCcwClockIcon,
  SearchIcon,
  SettingsIcon,
  SquareSlashIcon,
  StarIcon,
  SunIcon,
  WandSparklesIcon,
  XIcon,
} from "@/components/home-hero-app-icons";
import { cn } from "@/lib/utils";

/**
 * 首页 Hero 里的应用界面预览。
 *
 * 它是项目内的一组组件，不是内嵌页面、也不是截图：原稿那张 441 KB 的静态导出
 * HTML 只保留了界面骨架（侧栏 / 文档 / 检查器 / 状态栏），排版交给站点自己的
 * 设计令牌，所以深浅色主题自动跟随，也省掉一次额外请求。
 *
 * 尺寸：外框的 16:9 由 home-hero.tsx 的 aspect-video 决定，这里只负责铺满，
 * 并靠容器查询决定露出多少：窄框只留文档，@md 起出现左侧栏，@2xl 起再出现
 * 右侧检查器（Tailwind 的容器断点，@md = 28rem，@2xl = 42rem）。
 *
 * 只有中间的文档区可以滚动（pointer-events-auto + overflow-y-auto），
 * 其余整块是只读装饰：aria-hidden + pointer-events-none + select-none。
 *
 * 字号/图标按桌面端的档位对齐：chrome 11px + 12px 图标，正文 13px + 14px 图标。
 */

/** 侧栏一行：emoji 字形与 lucide 图标二选一。 */
type NavItem = {
  label: string;
  glyph?: string;
  icon?: "search" | "inbox" | "folder" | "chart" | "file";
  /** 当前打开的文档，加一层高亮底 */
  active?: boolean;
};

const QUICK_NAV: NavItem[] = [
  { icon: "search", label: "Search" },
  { icon: "inbox", label: "Inbox" },
];

const FAVORITES: NavItem[] = [
  { glyph: "👋", label: "Welcome to knloop", active: true },
  { glyph: "📇", label: "AGENTS.md" },
];

/** 工作区树：目录可展开（左侧有折叠箭头），文件没有。 */
const WORKSPACE_FOLDERS: NavItem[] = [
  { glyph: "📁", label: "archive" },
  { glyph: "🗂️", label: "area" },
  { glyph: "🌆", label: "event" },
  { glyph: "🎛️", label: "measure" },
  { icon: "folder", label: "person" },
  { icon: "folder", label: "procedure" },
  { icon: "chart", label: "project" },
  { icon: "folder", label: "responsibility" },
  { glyph: "🇦🇸", label: "samples" },
  { glyph: "🖐️", label: "topic" },
];

const WORKSPACE_FILES: NavItem[] = [
  { glyph: "📇", label: "AGENTS.md" },
  { icon: "file", label: "AGENTS.md — knloop vault" },
  { glyph: "🫯", label: "CLAUDE" },
  { glyph: "💍", label: "GEMINI" },
  { glyph: "👋", label: "Welcome to knloop", active: true },
];

/** 右侧检查器：文档目录 + 文件信息，数字与正文一致。 */
const OUTLINE = ["Notes are just files", "Connect your thinking", "Work with AI agents", "Get started"];

const DOC_INFO: [string, string][] = [
  ["Modified", "2026-09-25 17:14:13"],
  ["Created", "2026-09-25 13:34:27"],
  ["Words", "258"],
  ["Size", "2.1 KB"],
];

/* ─── 侧栏 ─────────────────────────────────────────── */

/** 行首图标：lucide 与 emoji 都占同一个 14px 方框，纵向居中，免得高低不齐。 */
function ItemGlyph({ item, className }: { item: NavItem; className?: string }) {
  const box = "size-3.5 shrink-0";
  if (item.icon === "search") return <SearchIcon className={cn(box, className)} />;
  if (item.icon === "inbox") return <InboxIcon className={cn(box, className)} />;
  if (item.icon === "folder") return <FolderIcon className={cn(box, className)} />;
  if (item.icon === "chart") return <FileChartPieIcon className={cn(box, className)} />;
  if (item.icon === "file") return <FileIcon className={cn(box, className)} />;
  return (
    <span className={cn(box, "flex items-center justify-center text-[0.8125rem] leading-3.5", className)}>
      {item.glyph}
    </span>
  );
}

function ItemRow({ item, collapsible = false }: { item: NavItem; collapsible?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-7 items-center gap-2 rounded-md px-2 text-xs leading-none",
        item.active ? "bg-fg/10 font-medium text-fg" : "text-fg/80",
      )}
    >
      {collapsible ? <ChevronRightIcon className="size-3.5 shrink-0 text-muted" /> : null}
      <ItemGlyph item={item} className={item.icon ? "text-muted" : undefined} />
      <span className="truncate">{item.label}</span>
    </div>
  );
}

function SidebarGroup({ label, icon, action, children }: { label?: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-1.5 py-1">
      {label ? (
        <div className="flex h-7 items-center gap-2 px-2 text-[0.6875rem] leading-none font-medium text-muted">
          {icon}
          <span className="truncate">{label}</span>
          {action ? <span className="ml-auto flex size-3.5 items-center justify-center">{action}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-44 shrink-0 flex-col overflow-hidden border-r border-border bg-surface-muted @md:flex @3xl:w-48">
      {/* 仓库切换器 */}
      <div className="flex h-9 shrink-0 items-center gap-2 px-3">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted">
          <FolderCodeIcon className="size-3" />
        </span>
        <span className="truncate text-xs leading-none font-semibold">Code base</span>
        <ChevronsUpDownIcon className="ml-auto size-3 shrink-0 text-muted" />
      </div>

      <SidebarGroup>
        {QUICK_NAV.map((item) => (
          <ItemRow key={item.label} item={item} />
        ))}
      </SidebarGroup>

      <SidebarGroup label="Favorites" icon={<StarIcon className="size-3 shrink-0" />}>
        {FAVORITES.map((item) => (
          <ItemRow key={item.label} item={item} />
        ))}
      </SidebarGroup>

      <SidebarGroup
        label="Workspace"
        icon={<SquareSlashIcon className="size-3 shrink-0" />}
        action={<PlusIcon className="size-3" />}
      >
        {WORKSPACE_FOLDERS.map((item) => (
          <ItemRow key={item.label} item={item} collapsible />
        ))}
        {WORKSPACE_FILES.map((item) => (
          <ItemRow key={item.label} item={item} />
        ))}
      </SidebarGroup>
    </aside>
  );
}

/* ─── 文档区 ───────────────────────────────────────── */

function DocParagraph({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-fg/90 @md:text-[0.8125rem]">{children}</p>;
}

function DocHeading({ children }: { children: ReactNode }) {
  return <h2 className="pt-1 text-sm leading-snug font-semibold tracking-tight @md:text-[0.9375rem]">{children}</h2>;
}

function DocCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border border-border bg-surface-muted px-1 py-px font-mono text-[0.68rem] @md:text-[0.75rem]">{children}</code>
  );
}

function DocBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-hidden rounded-md border border-border bg-code-bg px-3 py-2 font-mono text-[0.68rem] leading-5 text-code-fg @md:text-[0.75rem]">
      <code>{children}</code>
    </pre>
  );
}

/** 正文里的 [[wikilink]]：原文照排，只用主题蓝标出来。 */
function Wikilink({ text }: { text: string }) {
  return <span className="text-blue">[[{text}]]</span>;
}

function DocToolbar() {
  return (
    <div className="flex h-8 shrink-0 items-center gap-2 px-2 @md:h-9 @md:px-3">
      <PanelLeftIcon className="size-3.5 shrink-0 text-muted" />
      <span className="h-3.5 w-px shrink-0 bg-border" />
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="flex size-3.5 shrink-0 items-center justify-center text-[0.8125rem] leading-3.5">
          👋
        </span>
        <span className="truncate text-xs leading-none font-medium">Welcome to knloop</span>
        <ArrowLeftRightIcon className="size-3.5 shrink-0 text-muted" />
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-2 text-muted">
        <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
        <CodeXmlIcon className="hidden size-3.5 @sm:block" />
        <WandSparklesIcon className="hidden size-3.5 @sm:block" />
        <EllipsisIcon className="size-3.5" />
      </div>
    </div>
  );
}

function DocBody() {
  return (
    // 唯一可交互的地方：滚轮/触摸能往下看文档，其余保持只读。
    // 这里不设 overscroll-contain —— 文档滚到顶/底之后，继续滚就交给整页滚动。
    <div className="home-app-scroll pointer-events-auto min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-3 @md:px-8 @md:pb-10 @md:pt-4">
      <div className="mx-auto flex w-full max-w-[38rem] flex-col gap-3">
        <div className="text-[1.375rem] leading-none @md:text-[1.75rem]">👋</div>
        <h1 className="text-lg font-bold leading-tight tracking-tight @md:text-2xl">Welcome to knloop</h1>

        <DocParagraph>
          knloop is a <strong>local-first Markdown knowledge base</strong>. Everything you write lives as plain{" "}
          <DocCode>.md</DocCode> files in your own vault folder — no lock-in, no proprietary database, and your files
          stay readable in any editor.
        </DocParagraph>
        <DocParagraph>Start writing your thoughts here …</DocParagraph>
        <DocParagraph>
          Try some <strong>Markdown:</strong>
        </DocParagraph>

        <DocBlock>
          {[
            "# Headings",
            "- Lists",
            "> Quotes",
            "`Inline code`",
          ].join("\n")}
        </DocBlock>

        <DocHeading>Notes are just files</DocHeading>
        <DocParagraph>Every note is a Markdown file with YAML frontmatter:</DocParagraph>

        <DocBlock>
          {[
            "---",
            'tags: ["note", "Topic"]',
            'related_to: "[[knloop]]"',
            "---",
            "# Example note",
          ].join("\n")}
        </DocBlock>

        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs leading-relaxed text-fg/90 marker:text-muted @md:text-[0.8125rem]">
          <li>
            The <strong>first H1</strong> is the note title. knloop uses it in the note list, search, and wikilinks.
          </li>
          <li>
            <strong>Tags</strong> in the frontmatter organize your notes — two notes sharing a tag are related.
          </li>
          <li>
            <strong>Relationships</strong> are any frontmatter property containing <DocCode>[[wikilinks]]</DocCode>, like{" "}
            <DocCode>related_to</DocCode>, <DocCode>belongs_to</DocCode>, or <DocCode>has</DocCode>.
          </li>
          <li>
            Filenames use <DocCode>snake_case.md</DocCode>, one note per file.
          </li>
        </ul>

        <DocHeading>Connect your thinking</DocHeading>
        <DocParagraph>
          Organization comes from links and tags, not folders. Use <DocCode>[[wikilinks]]</DocCode> anywhere in the body
          or frontmatter to connect notes:
        </DocParagraph>
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs leading-relaxed text-fg/90 marker:text-muted @md:text-[0.8125rem]">
          <li>
            <Wikilink text="Note Title" /> links to another note
          </li>
          <li>
            <Wikilink text="Note Title|display text" /> links with custom text
          </li>
        </ul>
        <DocParagraph>
          knloop reads your notes recursively from all folders, so structure your vault however feels natural — meaning
          lives in the links and properties, not the directory tree.
        </DocParagraph>

        <DocHeading>Work with AI agents</DocHeading>
        <DocParagraph>
          knloop is built for agent collaboration. Agents can read, search, create, and edit your notes — following the
          same conventions described in <Wikilink text="agents_md" />. Keep the <DocCode>AGENTS.md</DocCode> file in your
          vault root as the shared rulebook for both humans and agents.
        </DocParagraph>

        <DocHeading>Get started</DocHeading>
        <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-fg/90 @md:text-[0.8125rem]">
          {[
            "Read up to this point",
            "Create a new note and give it a tag",
            "Link two notes with a [[wikilink]]",
            "Explore the note list and related notes",
            "Invite an agent to help organize your vault",
          ].map((task) => (
            <li key={task} className="flex items-start gap-2">
              <span className="mt-0.5 size-3 shrink-0 rounded-[3px] border border-border" />
              <span>{task}</span>
            </li>
          ))}
        </ul>

        <DocParagraph>Happy note-taking! 👋</DocParagraph>
      </div>
    </div>
  );
}

/* ─── 右侧检查器 ───────────────────────────────────── */

function Inspector() {
  return (
    <aside className="hidden w-40 shrink-0 flex-col border-l border-border bg-bg @2xl:flex @3xl:w-44">
      <div className="flex h-9 shrink-0 items-center gap-2 px-3">
        <ListIcon className="size-3 shrink-0" />
        <span className="truncate text-[0.6875rem] leading-none font-medium">Table of contents</span>
        <XIcon className="ml-auto size-3.5 shrink-0 text-muted" />
      </div>

      <div className="flex flex-col gap-0.5 px-1.5 py-1">
        {OUTLINE.map((entry) => (
          <div key={entry} className="flex h-7 items-center rounded-md px-2 text-xs leading-none text-muted">
            <span className="truncate">{entry}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-border p-2">
        <div className="mb-1.5 flex items-center gap-1 px-1.5 text-[0.6875rem] leading-none font-medium text-muted">
          <InfoIcon className="size-3 shrink-0" />
          Info
        </div>
        <div className="flex flex-col gap-1.5">
          {DOC_INFO.map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 items-center gap-2 px-1.5 text-[0.6875rem] leading-none text-muted">
              <span className="truncate">{key}</span>
              <span className="truncate text-right tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ─── 状态栏 ───────────────────────────────────────── */

function StatusItem({ icon, children, wide = false }: { icon: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <span className={cn("items-center gap-1", wide ? "hidden @lg:flex" : "flex")}>
      {icon}
      {children}
    </span>
  );
}

function StatusBar() {
  return (
    <footer className="flex h-5 shrink-0 items-center justify-between gap-2 border-t border-border px-2 text-[0.625rem] leading-none text-muted @md:h-6 @md:gap-3 @md:px-3 @md:text-[0.6875rem]">
      <div className="flex min-w-0 items-center gap-2 @md:gap-3">
        <StatusItem icon={<GitBranchIcon className="size-3 shrink-0" />}>
          <span className="text-fg/80">main</span>
        </StatusItem>
        <StatusItem wide icon={<GitCommitVerticalIcon className="size-3 shrink-0" />}>
          No remote
        </StatusItem>
        <StatusItem icon={<GitCommitHorizontalIcon className="size-3 shrink-0" />}>Commit</StatusItem>
        <StatusItem icon={<RefreshCwIcon className="size-3 shrink-0" />}>Synced</StatusItem>
        <StatusItem wide icon={<RotateCcwClockIcon className="size-3 shrink-0" />}>
          History
        </StatusItem>
      </div>
      <div className="flex shrink-0 items-center gap-2 @md:gap-3">
        <SunIcon className="home-app-sun size-3" />
        <MoonIcon className="home-app-moon size-3" />
        <SettingsIcon className="size-3" />
      </div>
    </footer>
  );
}

export function HomeHeroApp() {
  return (
    <div aria-hidden="true" className="pointer-events-none h-full w-full select-none overflow-hidden bg-bg text-fg">
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col bg-bg">
            <DocToolbar />
            <DocBody />
          </main>
          <Inspector />
        </div>
        <StatusBar />
      </div>
    </div>
  );
}
