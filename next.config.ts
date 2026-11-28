import type { NextConfig } from "next";

// Static export served as Cloudflare Worker assets (see wrangler.jsonc).
// Redirects live in public/_redirects; images ship unoptimised.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
