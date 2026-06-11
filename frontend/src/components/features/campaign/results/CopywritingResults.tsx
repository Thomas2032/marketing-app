"use client";

import { useEffect, useState } from "react";
import type { CampaignOutput } from "@/types/campaign";
import { getPlatformLimit } from "@/lib/platform-limits";
import type { SocialPlatform } from "@/types/publish";
import { cn } from "@/lib/utils";
import { AiMessage, ContextCard } from "@/components/features/campaign/ConversationMessages";

type CopyOutputProps = {
  output: CampaignOutput;
};

export function CopyOutput({ output }: CopyOutputProps) {
  const platforms = (output.metadata.platforms as Record<string, string> | undefined) ?? {};
  const platformNames = Object.keys(platforms);
  const [activePlatform, setActivePlatform] = useState(platformNames[0] ?? "LinkedIn");

  useEffect(() => {
    if (platformNames.length > 0 && !platformNames.includes(activePlatform)) {
      setActivePlatform(platformNames[0]);
    }
  }, [platformNames, activePlatform]);

  const activeCopy = platforms[activePlatform] ?? "";
  const charLimit = getPlatformLimit(activePlatform as SocialPlatform);

  return (
    <>
      {platformNames.length > 0 && (
        <AiMessage agent="Write copy">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {platformNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActivePlatform(name)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors duration-200",
                    activePlatform === name
                      ? "bg-violet-600 text-white"
                      : "bg-violet-100 text-indigo-950 hover:bg-violet-200",
                  )}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-violet-200 bg-white p-4">
              <p className="mb-2 text-xs font-medium text-cyan-600">{activePlatform}</p>
              <p className="font-[family-name:var(--font-dm-sans)] text-sm leading-relaxed text-slate-700">
                {activeCopy || "Drafting…"}
              </p>
              {activeCopy && (
                <p className="mt-3 text-xs text-slate-500">
                  {activeCopy.length} / {charLimit} characters
                </p>
              )}
            </div>
          </div>
        </AiMessage>
      )}

      {output.metadata.overall_score != null && (
        <ContextCard title="Review score">
          <p className="text-2xl font-semibold text-emerald-700">
            {String(output.metadata.overall_score)}/10
          </p>
          {Array.isArray(output.metadata.strengths) && (
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {(output.metadata.strengths as string[]).map((item) => (
                <li key={item}>+ {item}</li>
              ))}
            </ul>
          )}
          {Array.isArray(output.metadata.suggestions) && (
            <ul className="mt-2 space-y-1 text-sm text-slate-500">
              {(output.metadata.suggestions as string[]).map((item) => (
                <li key={item}>→ {item}</li>
              ))}
            </ul>
          )}
        </ContextCard>
      )}
    </>
  );
}
