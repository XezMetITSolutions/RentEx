import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.pngmart.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // Cloudflare R2 domains
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          // Dynamic CORS is now handled in middleware.ts
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
};

export default nextConfig;
