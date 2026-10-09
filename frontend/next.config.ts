import type { NextConfig } from "next";

// The UI is fully client-rendered against the FastAPI backend, so Cache
// Components / partial prefetching (server-side data caching) are not used.
const nextConfig: NextConfig = {
  // Duolingo's official artwork, font and animations are loaded from their CDNs
  // through these same-origin paths (their CDN sends no CORS headers, which
  // fonts and Lottie JSON need). Nothing is copied into this repository.
  async rewrites() {
    return [
      { source: "/duo-cdn/:path*", destination: "https://d35aaqx5ub95lt.cloudfront.net/:path*" },
      { source: "/duo-simg/:path*", destination: "https://simg-ssl.duolingo.com/:path*" },
    ];
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
