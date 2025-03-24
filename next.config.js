/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // This is a temporary workaround for the type error
    // Remove this once the issue is fixed in Next.js
    ignoreBuildErrors: true,
  },
}

export default nextConfig
