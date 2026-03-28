/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Enable modern image formats for smaller file sizes
    formats: ['image/avif', 'image/webp'],
    // Device widths for responsive images (mobile-first)
    deviceSizes: [320, 420, 640, 768, 1024, 1280],
    // Smaller thumbnail sizes for menu cards
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },
};

export default nextConfig;
