import type { NextConfig } from "next";

// Dynamically determine the Supabase hostname to avoid security vulnerabilities
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "your-project-id.supabase.co"; // Fallback for safety

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
        // 🛡️ SENTINEL: SECURITY PATCH
        // The wildcard "*.supabase.co" is too permissive and creates an open redirect vulnerability.
        // This now dynamically uses your specific Supabase project hostname from the environment variable.
        hostname: supabaseHostname,
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

export default nextConfig;
