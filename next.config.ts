import type { NextConfig } from "next";

// Generate timestamp-based version for cache busting
// Updated on every build to ensure fresh assets
const VERSION = `${Date.now()}`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
          { key: "X-App-Version", value: VERSION },
        ],
      },
    ];
  }
};

export { VERSION };

export default nextConfig;
