/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  // Registration and status lookups are over and those pages are gone - send
  // the old (indexed) URLs somewhere useful instead of serving a 404.
  async redirects() {
    return [
      { source: "/register", destination: "/prizes", permanent: true },
      { source: "/status", destination: "/", permanent: true },
    ];
  },
};
export default nextConfig;
