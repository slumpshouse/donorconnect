/** @type {import('next').NextConfig} */
const isWindows = process.platform === 'win32'

const nextConfig = {
  ...(isWindows ? {} : { output: 'standalone' }),

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
