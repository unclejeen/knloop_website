import type { Metadata } from "next";
import { DownloadPage } from "@/components/download-page";
import { HomeFooter } from "@/components/home-footer";

export const metadata: Metadata = {
  title: "下载 knloop",
  description: "下载 knloop 的 Windows、Linux、Android 客户端，或直接使用网页版。",
};

export default function Page() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <main className="flex flex-1 flex-col">
        <DownloadPage />
      </main>
      <HomeFooter />
    </div>
  );
}
