import { access } from "node:fs/promises";
import path from "node:path";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { projectCovers, projectVideos } from "./data/project-media";
import { projectDetails } from "./data/project-details";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["motion", "lucide-react"],
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const files = [
      ...Object.values(projectCovers).map((cover) => cover.image),
      ...Object.values(projectDetails).flatMap((detail) => detail.gallery.map((item) => item.src)),
      ...Object.values(projectVideos).flatMap((video) =>
        video ? [video.src, video.poster, video.captions] : [],
      ),
    ];
    await Promise.all(files.map((file) => access(path.join(process.cwd(), "public", file))));
  }
  return nextConfig;
}
