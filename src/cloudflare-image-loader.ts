"use client";

const optimizedImages: Record<string, string> = {
  "/intro-graphics-original.png": "/cloudflare-images/intro-graphics.webp",
  "/sites/pacomepertant-com-b16b412f/shared/intro-avatar.png": "/cloudflare-images/intro-avatar.webp",
  "/sites/pacomepertant-com-b16b412f/shared/about-avatar.png": "/cloudflare-images/about-avatar.webp",
};

export default function cloudflareImageLoader({ src }: { src: string; width: number; quality?: number }) {
  return optimizedImages[src] ?? src;
}
