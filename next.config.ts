import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ...suas outras configs
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;