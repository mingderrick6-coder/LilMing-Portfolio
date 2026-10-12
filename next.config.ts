import type { NextConfig } from "next";

const cloudflareBuild = process.env.CLOUDFLARE_STATIC_BUILD === "1";

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(cloudflareBuild ? { output: "export" } : {}),
  images: {
    qualities: [75, 100],
    ...(cloudflareBuild ? { loader: "custom", loaderFile: "./src/cloudflare-image-loader.ts" } : {}),
  },
};

export default nextConfig;
