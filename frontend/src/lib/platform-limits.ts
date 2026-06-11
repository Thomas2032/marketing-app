import type { SocialPlatform } from "@/types/publish";

export const PLATFORM_LIMITS: Record<SocialPlatform, number> = {
  LinkedIn: 3000,
  X: 280,
  Instagram: 2200,
  Facebook: 63206,
};

export function getPlatformLimit(platform: SocialPlatform): number {
  return PLATFORM_LIMITS[platform];
}

export function isOverPlatformLimit(platform: SocialPlatform, text: string): boolean {
  return text.length > PLATFORM_LIMITS[platform];
}
