/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uqhbxaxjabhnrknkuqfo.supabase.co" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};
module.exports = nextConfig;
