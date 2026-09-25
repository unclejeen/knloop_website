export const metadata = {
  title: "knloop",
};

// 临时首页：仅居中展示 logo，其他内容稍后再上。
export default function HomePage() {
  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/knloop-logo.svg"
        alt="knloop logo"
        draggable={false}
        className="theme-adapt-invert h-12 w-auto select-none pointer-events-none"
      />
    </main>
  );
}
