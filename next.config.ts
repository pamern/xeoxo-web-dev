import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePattern = supabaseUrl
  ? {
      protocol: new URL(supabaseUrl).protocol.replace(":", "") as "http" | "https",
      hostname: new URL(supabaseUrl).hostname,
      pathname: "/storage/v1/object/public/product-media/**",
    }
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remotePattern ? [remotePattern] : [],
  },
};

export default nextConfig;
