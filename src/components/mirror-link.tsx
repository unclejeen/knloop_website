"use client";

import { useCallback, useState, type ComponentProps, type MouseEvent } from "react";
import { isAcceleratedUrl, pickReachableDownloadUrl } from "@/lib/downloads";

/**
 * 加速下载链接的点击处理。文档里的下载链接（MirrorLink）和首页下载按钮
 * （DownloadButton）共用这一套，两处的回退行为必须一致。
 *
 * 点下去先按顺序 HEAD 每一条加速线路，第一个 2xx 的才算数；四条线路都不通就直接去
 * GitHub 原址兜底。用户不需要知道底下换了几条线路，也不需要自己动手换域名——以前
 * install.md 让人手动把 gh-proxy.org 换成 v4 / v6 / cdn，现在由这里接管。
 */
export function useMirrorDownload() {
  const [probing, setProbing] = useState(false);

  const follow = useCallback(
    async (event: MouseEvent<HTMLAnchorElement>, url: string): Promise<boolean> => {
      // 站内链接（比如安装说明页 /install）没什么可回退的，走浏览器默认行为
      if (!isAcceleratedUrl(url)) return false;
      // Ctrl / Cmd / Shift / Alt / 中键都是「另开一个」的意思，别拦
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

      event.preventDefault();
      if (probing) return true;

      setProbing(true);
      let target = url;
      try {
        target = await pickReachableDownloadUrl(url, { fresh: true });
      } catch {
        // 探测本身出错：退回原链接，别让用户点不动
      }
      setProbing(false);
      window.location.href = target;
      return true;
    },
    [probing],
  );

  return { probing, follow };
}

/**
 * 文档（MDX）里的 <a>：加速链接在点击时接管（见 useMirrorDownload），其余链接原样交给
 * 浏览器。探测期间把链接压暗、光标换成进度态——四条线路挨个 HEAD 需要时间，不给反馈
 * 会让人以为点了没反应。
 */
export function MirrorLink({ href, onClick, style, children, ...rest }: ComponentProps<"a">) {
  const { probing, follow } = useMirrorDownload();

  return (
    <a
      {...rest}
      href={href}
      style={probing ? { ...style, cursor: "progress", opacity: 0.6 } : style}
      aria-busy={probing || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && href) void follow(event, href);
      }}
    >
      {children}
    </a>
  );
}
