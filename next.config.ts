import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePattern = supabaseUrl
  ? {
      protocol: new URL(supabaseUrl).protocol.replace(":", "") as "http" | "https",
      hostname: new URL(supabaseUrl).hostname,
      port: new URL(supabaseUrl).port || undefined,
      pathname: "/storage/v1/object/public/product-media/**",
    }
  : null;

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://172.28.70.238:3000",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "15431",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "15431",
        pathname: "/storage/v1/object/public/**",
      },
      ...(remotePattern ? [remotePattern] : []),
    ],
  },
};

export default nextConfig;
