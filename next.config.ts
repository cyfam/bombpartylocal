import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",  // <=== Enables static exports
  
  // If you are deploying to username.github.io (root), remove this line entirely.
  basePath: "/bombpartylocal", 

  images: {
    unoptimized: true, // <=== Required for static export
  },
};

export default nextConfig;