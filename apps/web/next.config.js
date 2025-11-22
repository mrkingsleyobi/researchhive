/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vibecast/ui', '@vibecast/types'],
  output: 'standalone',
}

module.exports = nextConfig
