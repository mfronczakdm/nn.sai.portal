/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'edge.sitecorecloud.io' },
      { protocol: 'https', hostname: 'xmc-lcmchealth.sitecorecloud.io' },
    ],
  },
};

export default nextConfig;
