/** @type {import('next').NextConfig} */
const nextConfig = {
  // No experimental config needed for Next.js 15.5.9 - app directory is now stable
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  // Direct API calls to Django backend, no rewrites needed
};

module.exports = nextConfig;