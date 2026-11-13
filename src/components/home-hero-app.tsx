"use client";

import { useLocale } from "@/i18n/locale";

/**
 * 首页 Hero 的真实客户端界面（静态 HTML/CSS 版）。
 *
 * 不再用 iframe / 图片 / 运行时代码：侧栏、顶栏、正文、目录都是服务端直出的
 * 真实 DOM 与 Tailwind 样式，浏览器首屏就能画出来。文档区是原生 overflow 滚动，
 * 滚到顶/底后会自动把滚动交还给页面；主题跟随站点 .dark token，无需额外 JS。
 *
 * 尺寸按客户端 1440×810 窗口的 80% 复刻到 1152×648 外框：
 * 侧栏 205、检查器 205、正文栏 576、正文 12.8px、标题 28.8px。
 * 移动端（<768px）隐藏侧栏/检查器，正文 13px，卡片宽度由 HomeHero 控制。
 */

type TreeItem = {
  depth: number;
  icon: string;
  label: string;
  folder?: boolean;
  open?: boolean;
  active?: boolean;
};

const TREE: Record<"zh" | "en", TreeItem[]> = {
  zh: [
    { depth: 0, icon: "📚", label: "文档", folder: true, open: true },
    { depth: 1, icon: "🚀", label: "快速开始", folder: false },
    { depth: 1, icon: "🧭", label: "指南", folder: true, open: true },
    { depth: 2, icon: "🔐", label: "身份认证" },
    { depth: 2, icon: "📦", label: "部署" },
    { depth: 1, icon: "📖", label: "参考" },
    { depth: 0, icon: "🧱", label: "架构", folder: true, open: true },
    { depth: 1, icon: "🗺️", label: "系统设计" },
    { depth: 1, icon: "🛡️", label: "威胁模型" },
    { depth: 0, icon: "🗂️", label: "决策记录", folder: true, open: true },
    { depth: 1, icon: "📜", label: "ADR-0042：事件驱动摄取" },
    { depth: 1, icon: "📝", label: "RFC-0018：多区域故障转移" },
    { depth: 0, icon: "👋", label: "欢迎使用 knloop", active: true },
  ],
  en: [
    { depth: 0, icon: "📚", label: "Docs", folder: true, open: true },
    { depth: 1, icon: "🚀", label: "Getting Started" },
    { depth: 1, icon: "🧭", label: "Guides", folder: true, open: true },
    { depth: 2, icon: "🔐", label: "Authentication" },
    { depth: 2, icon: "📦", label: "Deployment" },
    { depth: 1, icon: "📖", label: "Reference" },
    { depth: 0, icon: "🧱", label: "Architecture", folder: true, open: true },
    { depth: 1, icon: "🗺️", label: "System Design" },
    { depth: 1, icon: "🛡️", label: "Threat Model" },
    { depth: 0, icon: "🗂️", label: "Decision Records", folder: true, open: true },
    { depth: 1, icon: "📜", label: "ADR-0042: Event-Driven Ingestion" },
    { depth: 1, icon: "📝", label: "RFC-0018: Multi-Region Failover" },
    { depth: 0, icon: "👋", label: "Welcome to knloop", active: true },
  ],
};

function Icon({ name, className = "h-3.5 w-3.5" }: { name: string; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
  if (name === "inbox") return <svg {...common}><path d="M4 5h16v10H4z" /><path d="M4 12h4l2 3h4l2-3h4" /></svg>;
  if (name === "settings") return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></svg>;
  if (name === "panel") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>;
  if (name === "star") return <svg {...common}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" /></svg>;
  if (name === "code") return <svg {...common}><path d="m8 8-4 4 4 4M16 8l4 4-4 4" /></svg>;
  if (name === "list") return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  if (name === "more") return <svg {...common}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
  if (name === "back") return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
  return null;
}

function Copy({ zh }: { zh: boolean }) {
  if (zh) {
    return (
      <>
        <h1 className="m-0 text-[28.8px] font-semibold leading-[1.2] tracking-[-0.01em]">欢迎使用 knloop</h1>
        <p className="mt-4 text-[12.8px] leading-[1.65]">
          knloop 是一个<strong className="font-semibold">本地优先的 Markdown 知识库</strong>。你写下的所有内容都以纯
          Markdown 文件保存在自己的知识库文件夹里——没有锁定、没有专有数据库，文件在任何编辑器中都保持可读。
        </p>
        <p className="mt-3 text-[12.8px] leading-[1.65]">现在就开始记录你的想法……</p>
        <p className="mt-3 text-[12.8px] leading-[1.65]">
          试试一些 <strong className="font-semibold">Markdown</strong>：
        </p>
        <pre className="mt-3 w-full max-w-[440px] overflow-hidden rounded-md bg-surface-muted px-4 py-3 font-mono text-[11.5px] leading-[1.9]">
          <code>
            <span className="text-[#2563eb]"># 标题</span>{"\n"}
            <span className="text-[#b45309]">- 列表</span>{"\n"}
            <span className="text-[#15803d]">&gt; 引用</span>{"\n"}
            <span className="text-[#6b7280]">`行内代码`</span>
          </code>
        </pre>
        <h2 className="mt-6 text-[18px] font-semibold">笔记就是文件</h2>
        <p className="mt-2 text-[12.8px] leading-[1.65]">每篇笔记都是带有 YAML 元信息（frontmatter）的 Markdown 文件：</p>
        <pre className="mt-3 w-full max-w-[440px] overflow-hidden rounded-md bg-surface-muted px-4 py-3 font-mono text-[11.5px] leading-[1.9]">
          <code>
            <span className="text-[#6b7280]">---</span>{"\n"}tags: [&quot;note&quot;, &quot;Topic&quot;]{"\n"}
            <span className="text-[#2563eb]">related_to</span>: &quot;[[knloop]]&quot;{"\n"}
            <span className="text-[#6b7280]">---</span>{"\n"}
            <span className="text-[#2563eb]"># 示例笔记</span>
          </code>
        </pre>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[12.8px] leading-[1.65]">
          <li>第一个一级标题就是笔记标题。knloop 会在笔记列表、搜索和双链中使用它。</li>
          <li>frontmatter 中的标签用来组织笔记——共享同一标签的两篇笔记彼此相关。</li>
          <li>关系是任何包含 [[双链]] 的 frontmatter 属性，例如 related_to、belongs_to 或 has。</li>
        </ul>
        <h2 className="mt-6 text-[18px] font-semibold">连接你的思考</h2>
        <p className="mt-2 text-[12.8px] leading-[1.65]">
          组织来自链接和标签，而不是文件夹。可以在正文或 frontmatter 中的任何位置使用 [[双链]] 连接笔记。
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.8px] leading-[1.65]">
          <li>[[笔记标题]] 链接到另一篇笔记</li>
          <li>[[笔记标题|显示文本]] 使用自定义文本链接</li>
          <li>knloop 会递归读取所有文件夹中的笔记，因此可以按自己觉得自然的方式组织知识库。</li>
        </ul>
        <h2 className="mt-6 text-[18px] font-semibold">与 AI 代理协作</h2>
        <p className="mt-2 text-[12.8px] leading-[1.65]">
          knloop 为代理协作而构建。代理可以读取、搜索、创建和编辑你的笔记，并遵循 AGENTS.md 中描述的同一套约定。
        </p>
        <p className="mt-3 text-[12.8px] leading-[1.65]">
          请把知识库根目录的 AGENTS.md 保留为人与代理共享的规则手册。
        </p>
        <h2 className="mt-6 text-[18px] font-semibold">开始使用</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.8px] leading-[1.65]">
          <li>读到这里</li>
          <li>新建一篇笔记，并给它一个标签</li>
          <li>用 [[双链]] 连接两篇笔记</li>
          <li>浏览笔记列表与相关笔记</li>
          <li>邀请一个代理帮你整理知识库</li>
        </ul>
        <p className="mt-4 pb-2 text-[12.8px] leading-[1.65]">祝你记录愉快！👋</p>
      </>
    );
  }

  return (
    <>
      <h1 className="m-0 text-[28.8px] font-semibold leading-[1.2] tracking-[-0.01em]">Welcome to knloop</h1>
      <p className="mt-4 text-[12.8px] leading-[1.65]">
        knloop is a <strong className="font-semibold">local-first Markdown knowledge base</strong>. Everything you write
        lives as plain Markdown files in your own vault folder — no lock-in, no proprietary database, and your files
        stay readable in any editor.
      </p>
      <p className="mt-3 text-[12.8px] leading-[1.65]">Start writing your thoughts here ...</p>
      <p className="mt-3 text-[12.8px] leading-[1.65]">
        Try some <strong className="font-semibold">Markdown</strong>:
      </p>
      <pre className="mt-3 w-full max-w-[440px] overflow-hidden rounded-md bg-surface-muted px-4 py-3 font-mono text-[11.5px] leading-[1.9]">
        <code>
          <span className="text-[#2563eb]"># Headings</span>{"\n"}
          <span className="text-[#b45309]">- Lists</span>{"\n"}
          <span className="text-[#15803d]">&gt; Quotes</span>{"\n"}
          <span className="text-[#6b7280]">`Inline code`</span>
        </code>
      </pre>
      <h2 className="mt-6 text-[18px] font-semibold">Notes are just files</h2>
      <p className="mt-2 text-[12.8px] leading-[1.65]">Every note is a Markdown file with YAML frontmatter:</p>
      <pre className="mt-3 w-full max-w-[440px] overflow-hidden rounded-md bg-surface-muted px-4 py-3 font-mono text-[11.5px] leading-[1.9]">
        <code>
          <span className="text-[#6b7280]">---</span>{"\n"}tags: [&quot;note&quot;, &quot;Topic&quot;]{"\n"}
          <span className="text-[#2563eb]">related_to</span>: &quot;[[knloop]]&quot;{"\n"}
          <span className="text-[#6b7280]">---</span>{"\n"}
          <span className="text-[#2563eb]"># Example note</span>
        </code>
      </pre>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[12.8px] leading-[1.65]">
        <li>The first H1 is the note title. knloop uses it in the note list, search, and wikilinks.</li>
        <li>Tags in the frontmatter organize your notes — two notes sharing a tag are related.</li>
        <li>Relationships are any frontmatter property containing [[wikilinks]], like related_to.</li>
      </ul>
      <h2 className="mt-6 text-[18px] font-semibold">Connect your thinking</h2>
      <p className="mt-2 text-[12.8px] leading-[1.65]">
        Organization comes from links and tags, not folders. Use [[wikilinks]] anywhere in the body or frontmatter.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.8px] leading-[1.65]">
        <li>[[Note title]] links to another note</li>
        <li>[[Note title|display text]] links with custom text</li>
        <li>knloop reads notes from every folder, so you can organize the vault the way that feels natural.</li>
      </ul>
      <h2 className="mt-6 text-[18px] font-semibold">Work with AI agents</h2>
      <p className="mt-2 text-[12.8px] leading-[1.65]">
        knloop is built for agent collaboration. Agents can read, search, create and edit notes, following the same
        conventions described in AGENTS.md.
      </p>
      <p className="mt-3 text-[12.8px] leading-[1.65]">
        Keep the AGENTS.md in your vault root as the shared rulebook for people and agents.
      </p>
      <h2 className="mt-6 text-[18px] font-semibold">Get started</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.8px] leading-[1.65]">
        <li>Read this far</li>
        <li>Create a note and give it a tag</li>
        <li>Connect two notes with a [[wikilink]]</li>
        <li>Browse the note list and related notes</li>
        <li>Invite an agent to tidy up your vault</li>
      </ul>
      <p className="mt-4 pb-2 text-[12.8px] leading-[1.65]">Happy writing! 👋</p>
    </>
  );
}

export function HomeHeroApp() {
  const { locale } = useLocale();
  const zh = locale !== "en";
  const tree = TREE[zh ? "zh" : "en"];

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-bg text-fg">
      {/* 侧栏（移动端隐藏） */}
      <aside className="hidden w-[205px] shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-[42px] shrink-0 items-center gap-2 px-3 text-[13px] font-semibold">
          <span aria-hidden="true">🚀</span>
          <span>helios</span>
          <span className="ml-auto text-[10px] text-muted">⌄</span>
        </div>
        <div className="flex flex-col gap-1 px-2 py-2 text-[11px] text-muted">
          <span className="flex h-6 items-center gap-2 rounded px-1.5"><Icon name="search" />{zh ? "搜索" : "Search"}</span>
          <span className="flex h-6 items-center gap-2 rounded px-1.5"><Icon name="inbox" />{zh ? "收件箱" : "Inbox"}</span>
          <span className="flex h-6 items-center gap-2 rounded px-1.5"><Icon name="settings" />{zh ? "设置" : "Settings"}</span>
        </div>
        <div className="mt-1 flex h-6 items-center gap-2 px-3.5 text-[10.5px] text-muted">
          <Icon name="panel" className="h-3 w-3" />
          <span>{zh ? "工作区" : "Workspace"}</span>
          <span className="ml-auto text-[12px]">+</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
          {tree.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className={
                "flex h-[22px] items-center gap-1.5 rounded px-1 text-[11px] leading-none " +
                (item.active ? "bg-surface-muted font-medium" : "text-muted")
              }
              style={{ paddingLeft: 6 + item.depth * 11 }}
            >
              {item.folder ? <span className="w-2 text-[8px] text-muted">{item.open ? "▾" : "▸"}</span> : <span className="w-2" />}
              <span className="text-[11px] leading-none" aria-hidden="true">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex h-9 shrink-0 items-center gap-2 border-t border-border px-3 text-[10.5px] text-muted">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[9px]">K</span>
          {zh ? "未登录" : "Signed out"}
          <span className="ml-auto">↪</span>
        </div>
      </aside>

      {/* 主区域 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[42px] shrink-0 items-center gap-2 border-b border-border px-3 md:px-4">
          <span className="text-[11px] md:hidden"><Icon name="back" className="h-4 w-4" /></span>
          <span className="hidden text-[11px] md:inline"><Icon name="panel" className="h-4 w-4" /></span>
          <span className="ml-1 truncate text-[11px] md:ml-2 md:text-[12px]" aria-hidden="true">👋</span>
          <span className="truncate text-[11px] font-medium md:text-[12.5px]">
            {zh ? "欢迎使用 knloop" : "Welcome to knloop"}
          </span>
          <div className="ml-auto flex items-center gap-1.5 text-muted">
            <Icon name="star" className="hidden h-3.5 w-3.5 md:block" />
            <Icon name="code" className="hidden h-3.5 w-3.5 md:block" />
            <Icon name="list" className="h-3.5 w-3.5" />
            <Icon name="more" className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div data-hero-doc className="min-w-0 flex-1 overflow-y-auto overscroll-auto px-5 py-6 [scrollbar-width:thin] md:px-10 md:py-8">
            <div className="mx-auto w-full max-w-[576px]">
              <p className="m-0 text-[26px] leading-none" aria-hidden="true">👋</p>
              <Copy zh={zh} />
            </div>
          </div>

          {/* 目录（移动端隐藏） */}
          <aside className="hidden w-[205px] shrink-0 flex-col border-l border-border md:flex">
            <div className="flex h-9 items-center justify-between border-b border-border px-3 text-[11px] text-muted">
              <span className="flex items-center gap-1.5"><Icon name="list" className="h-3 w-3" />{zh ? "目录" : "Table of contents"}</span>
              <span>×</span>
            </div>
            <div className="flex flex-col gap-2 px-3 py-3 text-[11px] text-muted">
              <span>{zh ? "笔记就是文件" : "Notes are just files"}</span>
              <span>{zh ? "连接你的思考" : "Connect your thinking"}</span>
              <span>{zh ? "与 AI 代理协作" : "Work with AI agents"}</span>
              <span>{zh ? "开始使用" : "Get started"}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}