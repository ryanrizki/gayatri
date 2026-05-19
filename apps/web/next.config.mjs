/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@gayatri/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
}

export default nextConfig
