/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@researchhive/ui', '@researchhive/types'],
  output: 'standalone',
}

module.exports = nextConfig
