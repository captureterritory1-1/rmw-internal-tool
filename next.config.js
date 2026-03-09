/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
}

module.exports = nextConfig
