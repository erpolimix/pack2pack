import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        // TODO: Replace with your Supabase project ID
        hostname: "<YOUR_PROJECT_ID>.supabase.co",
      },
    ],
  },
};

export default nextConfig;
