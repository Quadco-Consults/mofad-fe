/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  // Direct API calls to Django backend, no rewrites needed
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Disable static optimization globally to avoid initialization issues
  output: 'standalone',
  trailingSlash: false,
  // Force all pages to be server-side rendered
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;
