/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  basePath: process.env.NEXT_BASE_PATH || undefined,
  assetPrefix: process.env.NEXT_ASSET_PREFIX || undefined,
  pageExtensions: ["ts", "tsx", "mdx"],
};

export default nextConfig;
