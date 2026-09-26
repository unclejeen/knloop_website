/**
 * 各平台下载地址 —— 唯一出处，改这个文件就行，组件不用动。
 *
 * 发行包放在 knloop 自己的 disk 上（和 articles/install.md 里那个 Windows 地址同源），
 * 文件名带版本号，发新版记得一起改。带 TODO 的几项是待确认的产物名，
 * 换成真实文件名即可；平台认不出来时用 DEFAULT_DOWNLOAD（安装说明页）。
 */

const DISK = "https://disk.knloop.com/api/raw?path=/knloop";

export type DownloadPlatform = "windows" | "macos" | "linux" | "android" | "ios";

export type DownloadTarget = {
  /** 按钮上的平台名（专有名词，中英一致） */
  label: string;
  url: string;
};

export const DOWNLOADS: Record<DownloadPlatform, DownloadTarget> = {
  // articles/install.md 里正在用的地址，确定有效
  windows: { label: "Windows", url: `${DISK}/Knloop_0.1.0_x64-setup.exe` },
  // TODO: 换成真实 macOS 产物名
  macos: { label: "macOS", url: `${DISK}/Knloop_0.1.0_universal.dmg` },
  // TODO: 换成真实 Linux 产物名（AppImage / deb）
  linux: { label: "Linux", url: `${DISK}/Knloop_0.1.0_amd64.AppImage` },
  // TODO: 换成真实 APK 文件名
  android: { label: "Android", url: `${DISK}/Knloop_0.1.0_arm64.apk` },
  // TODO: 有 App Store 链接后替换；现在先落到安装说明页
  ios: { label: "iOS", url: "/install" },
};

/** 认不出平台时的兜底：安装说明页（那里列了各平台的包） */
export const DEFAULT_DOWNLOAD: DownloadTarget = { label: "knloop", url: "/install" };

/** 从 UA 认平台；认不出来返回 null，交给调用方兜底。 */
export function detectPlatform(): DownloadPlatform | null {
  if (typeof navigator === "undefined") return null;

  const ua = navigator.userAgent.toLowerCase();

  // iPadOS 13+ 的 UA 伪装成 macOS，只能靠触摸点区分
  const iPadOS = /macintosh|mac os x/.test(ua) && navigator.maxTouchPoints > 1;
  if (iPadOS || /iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android"; // Android 的 UA 里也带 linux，必须先判
  if (/windows|win32|win64/.test(ua)) return "windows";
  if (/mac os x|macintosh/.test(ua)) return "macos";
  if (/linux|x11|cros/.test(ua)) return "linux";

  return null;
}
