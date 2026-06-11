"use client";

import type { SocialPlatform } from "@/types/publish";
import { socialPlatforms } from "@/types/publish";
import { cn } from "@/lib/utils";

type ConnectedAccountsStripProps = {
  connected: SocialPlatform[];
  onChange: (platforms: SocialPlatform[]) => void;
};

export function ConnectedAccountsStrip({ connected, onChange }: ConnectedAccountsStripProps) {
  function toggle(platform: SocialPlatform) {
    const next = connected.includes(platform)
      ? connected.filter((item) => item !== platform)
      : [...connected, platform];
    onChange(next);
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/40 px-4 py-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-violet-700">
        Connected accounts (mock)
      </p>
      <div className="flex flex-wrap gap-2">
        {socialPlatforms.map((platform) => {
          const isConnected = connected.includes(platform);
          return (
            <button
              key={platform}
              type="button"
              title={isConnected ? `${platform} connected` : `Connect ${platform} (coming soon)`}
              onClick={() => toggle(platform)}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200",
                isConnected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-white text-slate-500 line-through opacity-70",
              )}
            >
              {platform}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Toggle platforms to simulate which accounts are ready for publishing.
      </p>
    </div>
  );
}
