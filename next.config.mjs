/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  // next dev 默认只信任自己启动时用的主机名（localhost），从 127.0.0.1 打开页面时
  // HMR websocket 和 /__nextjs_* 调试接口会被当成跨源请求拒掉（403）。
  // 仅开发期生效，生产构建忽略。
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  basePath: process.env.NEXT_BASE_PATH || undefined,
  assetPrefix: process.env.NEXT_ASSET_PREFIX || undefined,
  pageExtensions: ["ts", "tsx", "mdx"],
};

export default nextConfig;
