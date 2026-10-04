import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { HTMLAttributes, ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { docs, getAdjacentDocs, groupBySection } from "@/lib/docs";
import { extractHeadings, readArticleByPath } from "@/lib/articles";
import { pageMetadata } from "@/lib/page-metadata";
import { DocsSidebarShell } from "@/components/docs-sidebar";
import { PagerNav } from "@/components/docs-page-chrome";
import { DocsToc } from "@/components/docs-toc";
import { CopyCodeButton } from "@/components/copy-button";
import { HeadingAnchor } from "@/components/heading-anchor";
import { MirrorLink } from "@/components/mirror-link";

type DocsPageParams = { slug?: string[] };
type DocsPageProps = { params: Promise<DocsPageParams> };

export function generateStaticParams(): DocsPageParams[] {
  return docs.map((doc) => ({
    slug: doc.path.replace(/^\//, "").split("/"),
  }));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  return pageMetadata((slug ?? []).join("/"));
}

const rehypePrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
};

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  id?: string;
  children?: ReactNode;
};

function makeHeading(Tag: "h2" | "h3" | "h4") {
  return function Heading({ id, children, ...rest }: HeadingProps) {
    return (
      <Tag id={id} {...rest} className="group">
        {children}
        <HeadingAnchor id={id} />
      </Tag>
    );
  };
}

const mdxComponents = {
  pre: ({ children, ...props }: HTMLAttributes<HTMLPreElement>) => (
    <div data-code-block className="relative">
      <CopyCodeButton />
      <pre {...props}>{children}</pre>
    </div>
  ),
  // 文档里的加速下载链接在点击时自己挑一条通的线路（见 mirror-link），
  // 所以安装说明不用再教用户手动把 gh-proxy.org 换成 v4 / v6 / cdn。
  a: MirrorLink,
  h2: makeHeading("h2"),
  h3: makeHeading("h3"),
  h4: makeHeading("h4"),
};

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const routePath = "/" + (slug ?? []).join("/");
  const result = await readArticleByPath(routePath);
  if (!result) notFound();

  const { doc, source } = result;
  const headings = extractHeadings(source);
  const { prev, next } = getAdjacentDocs(doc.slug);
  const groups = groupBySection(docs);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)_14rem]">
      <DocsSidebarShell groups={groups} activeSlug={doc.slug} currentTitle={doc.title} />

      <main className="mx-auto w-full max-w-[54rem] px-4 pb-[50vh] pt-6 md:px-12">
        <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:tracking-[-0.03em] prose-headings:font-semibold prose-a:text-blue prose-a:font-medium prose-a:no-underline prose-a:hover:underline prose-code:font-normal">
          <MDXRemote
            source={source}
            components={mdxComponents}
            options={{
              mdxOptions: {
                format: "md",
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [rehypePrettyCode, rehypePrettyCodeOptions],
                ],
              },
              parseFrontmatter: false,
            }}
          />
        </article>

        <PagerNav
          prev={prev ? { title: prev.title, path: prev.path } : null}
          next={next ? { title: next.title, path: next.path } : null}
        />
      </main>

      <DocsToc headings={headings} />
    </div>
  );
}