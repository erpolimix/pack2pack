import type { NextConfig } from "next";

// Base remote patterns
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
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
];

// Dynamically add Supabase hostname if the environment variable is set
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    remotePatterns.push({
      protocol: 'https',
      hostname: supabaseHostname,
    });
  } catch (error) {
    console.error("Invalid NEXT_PUBLIC_SUPABASE_URL for image remotePatterns:", error);
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
