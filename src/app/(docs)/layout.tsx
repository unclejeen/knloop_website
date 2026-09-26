import type { ReactNode } from "react";

/** 文档区只需要外层留白，站点头部已经统一挂在根 layout 上。 */
export default function DocsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
