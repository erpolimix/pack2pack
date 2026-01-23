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
    formats: ["image/webp", "image/avif"],
    // Calidad optimizada (reduce tamaño 40% sin pérdida visual)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache 30 días
  },
};

// SECURITY: The Supabase hostname is dynamically parsed from the environment
// variable to prevent an open-redirect vulnerability. Using a wildcard
// like "*.supabase.co" is too permissive and could allow malicious actors
// to use the application as an image proxy for any Supabase project.
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (nextConfig.images?.remotePatterns) {
      nextConfig.images.remotePatterns.push({
        protocol: "https",
        hostname: supabaseUrl.hostname,
      });
    }
  } catch {
    console.warn(
      `[next.config.ts] Invalid NEXT_PUBLIC_SUPABASE_URL: "${process.env.NEXT_PUBLIC_SUPABASE_URL}"`
    );
  }
}

export default nextConfig;
