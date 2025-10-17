import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Ensure Chromium binaries are bundled properly for serverless
    serverComponentsExternalPackages: ["@sparticuz/chromium"],
  },
};

export default nextConfig;
