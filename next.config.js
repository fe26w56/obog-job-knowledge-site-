/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14では app directory はデフォルトで有効
  images: {
    domains: ['localhost', 'supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  eslint: {
    dirs: ['src'],
  },
}

module.exports = nextConfig 