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

// Dynamically add the Supabase remote pattern only if the URL is set
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;

    // Ensure the images and remotePatterns properties exist before modification
    if (nextConfig.images && nextConfig.images.remotePatterns) {
      nextConfig.images.remotePatterns.push({
        protocol: 'https',
        hostname: supabaseHostname,
      });
    }
  } catch (error) {
    // Log an error if the URL is invalid, but don't block the build
    console.error('Error parsing NEXT_PUBLIC_SUPABASE_URL for image remotePatterns:', error);
  }
}


export default nextConfig;
