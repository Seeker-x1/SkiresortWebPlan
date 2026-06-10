import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Parent dirs に別 lockfile がある場合の誤検知を避ける（例: ホーム直下の package-lock.json）
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default withNextIntl(nextConfig);
