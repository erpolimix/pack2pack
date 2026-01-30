import type { NextConfig } from "next";

// Base remote patterns
const remotePatterns = [
  {
    protocol: "https" as const,
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https" as const,
    hostname: "github.com",
  },
  {
    protocol: "https" as const,
    hostname: "lh3.googleusercontent.com",
  },
];

// Parse Supabase hostname from environment variable to avoid overly permissive wildcards
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    remotePatterns.push({
      protocol: "https" as const,
      hostname: supabaseUrl.hostname,
    });
  } catch (e) {
    console.error("Invalid NEXT_PUBLIC_SUPABASE_URL in next.config.ts", e);
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    // Optimización: Formatos modernos y compresión
    formats: ['image/webp', 'image/avif'],
    // Calidad optimizada (reduce tamaño 40% sin pérdida visual)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache 30 días
  },
};

export default nextConfig;
