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
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    // Optimización: Formatos modernos y compresión
    formats: ["image/webp", "image/avif"],
    // Calidad optimizada (reduce tamaño 40% sin pérdida visual)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache 30 días
  },
};

// Replace the insecure "*.supabase.co" with the specific Supabase hostname.
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const supabaseHostname = new URL(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ).hostname;
  if (nextConfig.images && nextConfig.images.remotePatterns) {
    nextConfig.images.remotePatterns = nextConfig.images.remotePatterns.filter(
      (p) => p.hostname !== "*.supabase.co",
    );
    nextConfig.images.remotePatterns.push({
      protocol: "https",
      hostname: supabaseHostname,
    });
  }
}

export default nextConfig;
