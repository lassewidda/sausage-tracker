/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async redirects() {
    const theme = process.env.NEXT_PUBLIC_THEME || 'sausage'
    const redirectList = []

    if (theme !== 'exercise') {
      redirectList.push(
        { source: '/challenge', destination: '/', permanent: false },
        { source: '/challenge/:path*', destination: '/', permanent: false },
        { source: '/progress', destination: '/', permanent: false },
      )
    }

    return redirectList
  },
}

export default nextConfig
