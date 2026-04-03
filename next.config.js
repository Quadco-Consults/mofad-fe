/** @type {import('next').NextConfig} */
// Force rebuild: 2026-04-03-18:00:00 - Bin Card Critical Fix
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    BUILD_ID: Date.now().toString(),
    FORCE_REBUILD: '2026-04-03-18:00:00',
  },
  // Disable static optimization to prevent aggressive caching during development
  generateBuildId: async () => {
    return Date.now().toString()
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mofad-app-363f0ff77886.herokuapp.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Enable compression
  compress: true,

  // Standalone output for containerized deployments
  output: 'standalone',
  trailingSlash: false,
};

module.exports = nextConfig;
