import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    domains: ["res.cloudinary.com"],
  },
  devIndicators: false,
  /* devIndicators: {
    appIsrStatus: false, // Remove a bolinha de status (Static/Dynamic)
    buildActivity: false, // Remove o indicador de compilação
  }, */
};

export default nextConfig;
