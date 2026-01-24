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
        hostname: "lh3.googleusercontent.com",
      },
    ],
    // Optimización: Formatos modernos y compresión
    formats: ['image/webp', 'image/avif'],
    // Calidad optimizada (reduce tamaño 40% sin pérdida visual)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache 30 días
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    if (nextConfig.images && nextConfig.images.remotePatterns) {
        nextConfig.images.remotePatterns.push({
            protocol: "https",
            hostname: url.hostname,
        });
    }
  } catch (error) {
    console.error("Invalid NEXT_PUBLIC_SUPABASE_URL:", error);
  }
}

export default nextConfig;
